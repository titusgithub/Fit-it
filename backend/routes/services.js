const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get all services
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM services WHERE 1=1';
    const params = [];
    let idx = 1;

    if (category) {
      query += ` AND category = ?`;
      params.push(category);
    }
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Get services error:', err.message);
    res.status(500).json({ 
      error: 'Could not fetch services. Database might be offline.',
      details: err.code === 'ECONNREFUSED' ? 'Connection refused' : 'Server error'
    });
  }
});

// Get service categories
router.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM services ORDER BY category');
    res.json(result.rows.map(r => r.category));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create service (admin)
router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const { name, description, icon, category } = req.body;
    const serviceId = require('crypto').randomUUID();
    await pool.query(
      'INSERT INTO services (id, name, description, icon, category) VALUES (?, ?, ?, ?, ?)',
      [serviceId, name, description, icon, category]
    );

    const result = await pool.query('SELECT * FROM services WHERE id = ?', [serviceId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
