const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'findfix',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

if (process.env.USE_MOCK_DB === 'true') {
  console.log('⚠️ Using MOCK Database (In-Memory)');
  pool = require('./mockDb');
} else {
  pool = mysql.createPool(poolConfig);

  // Check connection
  pool.getConnection()
    .then(conn => {
      console.log('✅ Connected to MySQL database');
      conn.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection failed:', err.message);
      if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
        module.exports.useMock();
      }
    });
}

// Wrapper to match PostgreSQL-style expected output ({ rows })
const wrapper = {
  query: async (text, params) => {
    // Convert PostgreSQL $1, $2 to MySQL ?
    const mysqlText = text.replace(/\$\d+/g, '?');
    // Remove "RETURNING *" as MySQL doesn't support it
    const cleanedText = mysqlText.replace(/\s+RETURNING\s+\*/gi, '');
    
    try {
      const [rows] = await pool.query(cleanedText, params);
      return { rows: Array.isArray(rows) ? rows : [rows] };
    } catch (err) {
      // Re-throw to be caught by route handlers
      throw err;
    }
  },
  on: (event, callback) => {
    // Basic event mocking
    if (event === 'error') {
      // For now, MySQL2 pool doesn't have identical 'error' event handling like pg
    }
  },
  useMock: () => {
    console.log('⚠️ Switching to MOCK Database...');
    pool = require('./mockDb');
  }
};

module.exports = wrapper;
