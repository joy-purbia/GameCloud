const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gamecloud',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Test connection on boot
pool.getConnection()
  .then(conn => {
    console.log(`[Database] Connected successfully to MySQL (${process.env.DB_NAME || 'gamecloud'}) on port ${process.env.DB_PORT || 3306}`);
    conn.release();
  })
  .catch(err => {
    console.error('[Database] Connection Error:', err.message);
  });

module.exports = pool;
