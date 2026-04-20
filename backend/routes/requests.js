const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Create service request
router.post('/', authenticate, async (req, res) => {
  try {
    const { technician_id, service_id, title, description, location, latitude, longitude, budget, urgency, images } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const requestId = require('crypto').randomUUID();
    await pool.query(
      `INSERT INTO service_requests (id, customer_id, technician_id, service_id, title, description, location, latitude, longitude, budget, urgency, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [requestId, req.user.id, technician_id || null, service_id || null, title, description, location, latitude, longitude, budget, urgency || 'normal', images ? JSON.stringify(images) : null]
    );

    const result = await pool.query('SELECT * FROM service_requests WHERE id = ?', [requestId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get requests (filtered by role)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let paramIdx = 1;
    let query;

    if (req.user.role === 'customer') {
      query = `
        SELECT sr.*, u.name as technician_name, s.name as service_name, s.icon as service_icon
        FROM service_requests sr
        LEFT JOIN technicians t ON sr.technician_id = t.id
        LEFT JOIN users u ON t.user_id = u.id
        LEFT JOIN services s ON sr.service_id = s.id
        WHERE sr.customer_id = $${paramIdx++}
      `;
      params.push(req.user.id);
    } else if (req.user.role === 'technician') {
      const tech = await pool.query('SELECT id FROM technicians WHERE user_id = $1', [req.user.id]);
      if (tech.rows.length === 0) return res.json({ requests: [] });
      
      query = `
        SELECT sr.*, u.name as customer_name, s.name as service_name, s.icon as service_icon
        FROM service_requests sr
        LEFT JOIN users u ON sr.customer_id = u.id
        LEFT JOIN services s ON sr.service_id = s.id
        WHERE sr.technician_id = $${paramIdx++}
      `;
      params.push(tech.rows[0].id);
    } else {
      query = `
        SELECT sr.*, cu.name as customer_name, tu.name as technician_name, s.name as service_name
        FROM service_requests sr
        LEFT JOIN users cu ON sr.customer_id = cu.id
        LEFT JOIN technicians t ON sr.technician_id = t.id
        LEFT JOIN users tu ON t.user_id = tu.id
        LEFT JOIN services s ON sr.service_id = s.id
        WHERE 1=1
      `;
    }

    if (status) {
      query += ` AND sr.status = $${paramIdx++}`;
      params.push(status);
    }

    query += ` ORDER BY sr.created_at DESC LIMIT $${paramIdx++} OFFSET $${paramIdx++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ requests: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error('Get requests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sr.*, cu.name as customer_name, cu.phone as customer_phone,
        tu.name as technician_name, tu.phone as technician_phone,
        s.name as service_name, s.icon as service_icon
      FROM service_requests sr
      LEFT JOIN users cu ON sr.customer_id = cu.id
      LEFT JOIN technicians t ON sr.technician_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      LEFT JOIN services s ON sr.service_id = s.id
      WHERE sr.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept request (technician)
router.put('/:id/accept', authenticate, authorize('technician'), async (req, res) => {
  try {
    const tech = await pool.query('SELECT id, subscription_expires_at FROM technicians WHERE user_id = $1', [req.user.id]);
    
    if (tech.rows.length === 0) {
      return res.status(404).json({ error: 'Technician profile not found' });
    }

    const { subscription_expires_at } = tech.rows[0];
    if (!subscription_expires_at || new Date(subscription_expires_at) < new Date()) {
      return res.status(403).json({ error: 'Active subscription required to accept jobs. Please renew your subscription.' });
    }

    await pool.query(
      `UPDATE service_requests SET status = 'accepted', technician_id = ?, updated_at = NOW()
       WHERE id = ? AND status = 'pending'`,
      [tech.rows[0].id, req.params.id]
    );

    const result = await pool.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0 || result.rows[0].status !== 'accepted') {
      return res.status(400).json({ error: 'Request not available' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Accept request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete request
router.put('/:id/complete', authenticate, async (req, res) => {
  try {
    await pool.query(
      `UPDATE service_requests SET status = 'completed', updated_at = NOW()
       WHERE id = ? AND status IN ('accepted', 'in_progress')`,
      [req.params.id]
    );

    const result = await pool.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0 || result.rows[0].status !== 'completed') {
      return res.status(400).json({ error: 'Request cannot be completed' });
    }

    // Update technician job count
    if (result.rows[0].technician_id) {
      await pool.query(
        'UPDATE technicians SET total_jobs = total_jobs + 1 WHERE id = $1',
        [result.rows[0].technician_id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Complete request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel request
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    await pool.query(
      `UPDATE service_requests SET status = 'cancelled', updated_at = NOW()
       WHERE id = ? AND status IN ('pending', 'accepted')`,
      [req.params.id]
    );
    const result = await pool.query('SELECT * FROM service_requests WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0 || result.rows[0].status !== 'cancelled') {
      return res.status(400).json({ error: 'Request cannot be cancelled' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
