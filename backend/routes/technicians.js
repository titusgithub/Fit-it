const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all technicians (with search & filter)
router.get('/', async (req, res) => {
  try {
    const { service, location, search, verified, page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let paramIdx = 1;

    let query = `
      SELECT t.*, u.name, u.email, u.phone, u.avatar_url,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT('service_id', s2.id, 'service_name', s2.name, 'icon', s2.icon, 'price_from', ts2.price_from, 'price_to', ts2.price_to)
          ) FROM technician_services ts2 JOIN services s2 ON ts2.service_id = s2.id WHERE ts2.technician_id = t.id), '[]'
        ) as services
      FROM technicians t
      JOIN users u ON t.user_id = u.id
      WHERE u.is_active = true AND t.subscription_expires_at > NOW()
    `;

    if (verified !== undefined) {
      query += ` AND t.is_verified = ?`;
      params.push(verified === 'true');
    }

    if (location) {
      query += ` AND t.location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (search) {
      query += ` AND (u.name LIKE ? OR t.bio LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY t.id, u.id`;

    if (service) {
      query = `SELECT * FROM (${query}) sub WHERE CAST(services AS CHAR) LIKE ?`;
      params.push(`%${service}%`);
    }

    query += ` ORDER BY avg_rating DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ technicians: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error('Get technicians error:', err.message);
    res.status(500).json({ 
      error: 'Database connection failed. Please ensure PostgreSQL is running.',
      details: err.code === 'ECONNREFUSED' ? 'Connection refused' : 'Server error'
    });
  }
});

// Get single technician
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name, u.email, u.phone, u.avatar_url,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT('service_id', s2.id, 'service_name', s2.name, 'icon', s2.icon, 'price_from', ts2.price_from, 'price_to', ts2.price_to)
          ) FROM technician_services ts2 JOIN services s2 ON ts2.service_id = s2.id WHERE ts2.technician_id = t.id), '[]'
        ) as services
      FROM technicians t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = ?
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // Get reviews
    const reviews = await pool.query(`
      SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.technician_id = $1
      ORDER BY r.created_at DESC LIMIT 10
    `, [req.params.id]);

    res.json({ ...result.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error('Get technician error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create/update technician profile
router.post('/profile', authenticate, authorize('technician'), async (req, res) => {
  try {
    const { bio, location, latitude, longitude, years_experience, id_number, id_document_url } = req.body;

    const result = await pool.query(`
      UPDATE technicians SET bio = COALESCE(?, bio), location = COALESCE(?, location),
        latitude = COALESCE(?, latitude), longitude = COALESCE(?, longitude),
        years_experience = COALESCE(?, years_experience), id_number = COALESCE(?, id_number),
        id_document_url = COALESCE(?, id_document_url), updated_at = NOW()
      WHERE user_id = ?
    `, [bio, location, latitude, longitude, years_experience, id_number, id_document_url, req.user.id]);

    const updated = await pool.query('SELECT * FROM technicians WHERE user_id = ?', [req.user.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add service to technician
router.post('/services', authenticate, authorize('technician'), async (req, res) => {
  try {
    const { service_id, price_from, price_to } = req.body;

    const tech = await pool.query('SELECT id FROM technicians WHERE user_id = $1', [req.user.id]);
    if (tech.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });

    const result = await pool.query(
      `INSERT INTO technician_services (id, technician_id, service_id, price_from, price_to)
       VALUES (UUID(), ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE price_from = VALUES(price_from), price_to = VALUES(price_to)`,
      [tech.rows[0].id, service_id, price_from, price_to]
    );

    const inserted = await pool.query('SELECT * FROM technician_services WHERE technician_id = ? AND service_id = ?', [tech.rows[0].id, service_id]);
    res.status(201).json(inserted.rows[0]);
  } catch (err) {
    console.error('Add service error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove service from technician
router.delete('/services/:serviceId', authenticate, authorize('technician'), async (req, res) => {
  try {
    const tech = await pool.query('SELECT id FROM technicians WHERE user_id = $1', [req.user.id]);
    await pool.query(
      'DELETE FROM technician_services WHERE technician_id = $1 AND service_id = $2',
      [tech.rows[0].id, req.params.serviceId]
    );
    res.json({ message: 'Service removed' });
  } catch (err) {
    console.error('Remove service error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get own subscription status
router.get('/me/subscription', authenticate, authorize('technician'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT subscription_expires_at FROM technicians WHERE user_id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    
    const expiresAt = result.rows[0].subscription_expires_at;
    const isActive = expiresAt ? new Date(expiresAt) > new Date() : false;
    
    res.json({
      subscription_expires_at: expiresAt,
      is_active: isActive,
      monthly_cost: 500
    });
  } catch (err) {
    console.error('Get subscription status error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
