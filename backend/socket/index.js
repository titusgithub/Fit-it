const pool = require('../config/db');

function setupSocket(io) {
  // Track online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    // Join user room
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`👤 User ${userId} joined`);
    });

    // Join request chat room
    socket.on('joinChat', (requestId) => {
      socket.join(`chat_${requestId}`);
      console.log(`💬 User joined chat: ${requestId}`);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { request_id, sender_id, receiver_id, content } = data;

        // Save to database
        const messageId = require('crypto').randomUUID();
        await pool.query(
          `INSERT INTO messages (id, request_id, sender_id, receiver_id, content)
           VALUES (?, ?, ?, ?, ?)`,
          [messageId, request_id, sender_id, receiver_id, content]
        );
        
        const result = await pool.query('SELECT * FROM messages WHERE id = ?', [messageId]);

        const sender = await pool.query(
          'SELECT name, avatar_url FROM users WHERE id = ?',
          [sender_id]
        );

        const message = {
          ...result.rows[0],
          sender_name: sender.rows[0].name,
          sender_avatar: sender.rows[0].avatar_url,
        };

        // Emit to room
        io.to(`chat_${request_id}`).emit('newMessage', message);

        // Notify receiver if not in room
        io.to(receiver_id).emit('notification', {
          type: 'message',
          message: `New message from ${sender.rows[0].name}`,
          request_id,
        });
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(`chat_${data.request_id}`).emit('userTyping', {
        userId: data.userId,
        name: data.name,
      });
    });

    socket.on('stopTyping', (data) => {
      socket.to(`chat_${data.request_id}`).emit('userStoppedTyping', {
        userId: data.userId,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('🔌 User disconnected:', socket.id);
    });
  });
}

module.exports = setupSocket;
