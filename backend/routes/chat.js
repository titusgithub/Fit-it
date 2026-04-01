const express = require('express');
const pool = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get chat messages for a service request
router.get('/:requestId', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.request_id = ?
      ORDER BY m.created_at ASC
      LIMIT ? OFFSET ?
    `, [req.params.requestId, parseInt(limit), parseInt(offset)]);

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE request_id = ? AND receiver_id = ? AND is_read = false',
      [req.params.requestId, req.user.id]
    );

    res.json({ messages: result.rows });
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { request_id, receiver_id, content } = req.body;

    if (!request_id || !receiver_id || !content) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const messageId = require('crypto').randomUUID();
    await pool.query(
      `INSERT INTO messages (id, request_id, sender_id, receiver_id, content)
       VALUES (?, ?, ?, ?, ?)`,
      [messageId, request_id, req.user.id, receiver_id, content]
    );

    const result = await pool.query('SELECT * FROM messages WHERE id = ?', [messageId]);

    // Get sender info
    const senderResult = await pool.query('SELECT name, avatar_url FROM users WHERE id = ?', [req.user.id]);
    const message = { ...result.rows[0], sender_name: senderResult.rows[0].name, sender_avatar: senderResult.rows[0].avatar_url };

    res.status(201).json(message);
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unread count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false',
      [req.user.id]
    );
    res.json({ unread: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
