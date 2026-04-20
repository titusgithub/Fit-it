const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Dashboard stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [users, technicians, requests, transactions] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN role = "customer" THEN 1 ELSE 0 END) as customers, SUM(CASE WHEN role = "technician" THEN 1 ELSE 0 END) as techs FROM users'),
      pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified FROM technicians'),
      pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed FROM service_requests'),
      pool.query('SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN status = "completed" THEN amount ELSE 0 END), 0) as revenue FROM transactions'),
    ]);

    res.json({
      users: users.rows[0],
      technicians: technicians.rows[0],
      requests: requests.rows[0],
      transactions: transactions.rows[0],
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify technician
router.put('/verify/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query(
      'UPDATE technicians SET is_verified = true, updated_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    const result = await pool.query('SELECT * FROM technicians WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Technician not found' });
    }
    res.json({ message: 'Technician verified', technician: result.rows[0] });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unverify technician
router.put('/unverify/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query(
      'UPDATE technicians SET is_verified = false, updated_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    const result = await pool.query('SELECT * FROM technicians WHERE id = ?', [req.params.id]);
    res.json({ message: 'Technician unverified', technician: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all disputes
router.get('/disputes', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    let idx = 1;

    let query = `
      SELECT d.*, u.name as raised_by_name, sr.title as request_title,
        a.name as admin_name
      FROM disputes d
      JOIN users u ON d.raised_by = u.id
      JOIN service_requests sr ON d.request_id = sr.id
      LEFT JOIN users a ON d.admin_id = a.id
      WHERE 1=1
    `;

    if (status) {
      query += ` AND d.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY d.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    res.json({ disputes: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error('Get disputes error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create dispute
router.post('/disputes', authenticate, async (req, res) => {
  try {
    const { request_id, reason } = req.body;
    if (!request_id || !reason) {
      return res.status(400).json({ error: 'Request ID and reason are required' });
    }

    const disputeId = require('crypto').randomUUID();
    await pool.query(
      'INSERT INTO disputes (id, request_id, raised_by, reason) VALUES (?, ?, ?, ?)',
      [disputeId, request_id, req.user.id, reason]
    );

    const result = await pool.query('SELECT * FROM disputes WHERE id = ?', [disputeId]);

    // Update request status
    await pool.query(
      `UPDATE service_requests SET status = 'disputed', updated_at = NOW() WHERE id = ?`,
      [request_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create dispute error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve dispute
router.put('/disputes/:id/resolve', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { resolution, status } = req.body;
    await pool.query(
      `UPDATE disputes SET status = ?, resolution = ?, admin_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [status || 'resolved', resolution, req.user.id, req.params.id]
    );
    const result = await pool.query('SELECT * FROM disputes WHERE id = ?', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Resolve dispute error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
