const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', authenticate, async (req, res) => {
  try {
    const { request_id, technician_id, rating, comment } = req.body;

    if (!request_id || !technician_id || !rating) {
      return res.status(400).json({ error: 'Request ID, technician ID, and rating are required' });
    }

    // Verify the request is completed and belongs to the reviewer
    const request = await pool.query(
      `SELECT id FROM service_requests WHERE id = $1 AND customer_id = $2 AND status = 'completed'`,
      [request_id, req.user.id]
    );
    if (request.rows.length === 0) {
      return res.status(400).json({ error: 'Can only review completed requests' });
    }

    // Check for duplicate review
    const existing = await pool.query(
      'SELECT id FROM reviews WHERE request_id = $1 AND reviewer_id = $2',
      [request_id, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Already reviewed' });
    }

    const reviewId = require('crypto').randomUUID();
    await pool.query(
      `INSERT INTO reviews (id, request_id, reviewer_id, technician_id, rating, comment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [reviewId, request_id, req.user.id, technician_id, rating, comment || null]
    );

    const result = await pool.query('SELECT * FROM reviews WHERE id = ?', [reviewId]);

    // Update technician avg rating
    const stats = await pool.query(
      'SELECT CAST(AVG(rating) AS DECIMAL(3,2)) as avg_rating, COUNT(*) as total FROM reviews WHERE technician_id = ?',
      [technician_id]
    );
    await pool.query(
      'UPDATE technicians SET avg_rating = ?, total_reviews = ? WHERE id = ?',
      [stats.rows[0].avg_rating || 0, stats.rows[0].total || 0, technician_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for technician
router.get('/technician/:id', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.technician_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.params.id, parseInt(limit), parseInt(offset)]);

    res.json({ reviews: result.rows, page: parseInt(page) });
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
