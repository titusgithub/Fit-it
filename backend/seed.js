const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'models', 'schema.sql'), 'utf8');
    
    // MySQL2 doesn't support multiple statements by default in a single query() call 
    // unless enabled, but we can split by semicolon.
    // However, some semicolons might be inside strings.
    // A better way is to enable multipleStatements: true in the pool config.
    
    console.log('⏳ Initializing MySQL schema...');
    
    // We'll reopen a connection with multipleStatements enabled just for seeding
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'findfix',
      multipleStatements: true
    });

    await connection.query(schemaSql);
    console.log('✅ Schema initialized and seeded successfully!');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
