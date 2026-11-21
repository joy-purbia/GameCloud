const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const { autoMigrate } = require('./autoMigrate');

// Load environment from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let poolConfig = {};

const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

if (connectionUri) {
  try {
    const dbUrl = new URL(connectionUri);
    poolConfig = {
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port || '3306', 10),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: dbUrl.pathname.replace(/^\//, '') || 'gamecloud',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000
    };

    // Auto-enable SSL for cloud databases (TiDB, Aiven, Railway, Render, etc.)
    const isCloudHost = dbUrl.hostname.includes('tidbcloud') ||
                        dbUrl.hostname.includes('aivencloud') ||
                        dbUrl.hostname.includes('rlwy.net') ||
                        dbUrl.hostname.includes('railway') ||
                        dbUrl.hostname.includes('render') ||
                        process.env.DB_SSL === 'true';

    if (isCloudHost || dbUrl.searchParams.has('ssl') || process.env.DB_SSL === 'true') {
      poolConfig.ssl = { rejectUnauthorized: false };
    }
    console.log(`[Database] Initializing connection via DATABASE_URL to host: ${poolConfig.host}:${poolConfig.port}`);
  } catch (err) {
    console.warn(`[Database] Failed to parse DATABASE_URL: ${err.message}. Falling back to default parameters.`);
  }
}

// Fallback to individual environment parameters
if (!poolConfig.host) {
  poolConfig = {
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
  };

  if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool(poolConfig);

// Test connection on boot and trigger auto-migration
pool.getConnection()
  .then(async (conn) => {
    console.log(`[Database] Connected successfully to MySQL (${poolConfig.database}) on ${poolConfig.host}:${poolConfig.port}`);
    conn.release();
    // Run auto-migration to ensure schema and seeds exist
    await autoMigrate(pool);
  })
  .catch((err) => {
    console.warn('[Database] MySQL connection warning:', err.message);
    console.warn('[Database] GameCloud will continue running. (Default games & client-side play remain 100% accessible).');
  });

module.exports = pool;
