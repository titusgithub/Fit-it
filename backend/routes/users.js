const express = require('express');
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = 'SELECT id, name, email, phone, role, is_active, created_at FROM users WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (name LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    
    const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalCount = countResult.rows[0].count;
    
    res.json({
      users: result.rows,
      total: parseInt(totalCount),
      page: parseInt(page),
      pages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Only allow self-update or admin
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { name, phone, avatar_url } = req.body;
    await pool.query(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), 
       avatar_url = COALESCE(?, avatar_url), updated_at = NOW()
       WHERE id = ?`,
      [name, phone, avatar_url, req.params.id]
    );

    const result = await pool.query('SELECT id, name, email, phone, role, avatar_url FROM users WHERE id = ?', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'technician', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await pool.query('UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?', [role, req.params.id]);
    
    // If promoting to technician, ensure a profile exists
    if (role === 'technician') {
      const techRes = await pool.query('SELECT id FROM technicians WHERE user_id = ?', [req.params.id]);
      if (techRes.rows.length === 0) {
        // Use Node.js to generate UUID to keep consistency with users table
        const techId = require('crypto').randomUUID();
        await pool.query('INSERT INTO technicians (id, user_id) VALUES (?, ?)', [techId, req.params.id]);
      }
    }

    res.json({ message: 'User role updated' });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle account status (Admin only)
router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { is_active } = req.body;
    await pool.query('UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?', [is_active, req.params.id]);
    res.json({ message: `Account ${is_active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }
    
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
