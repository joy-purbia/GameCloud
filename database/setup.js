const fs = require('fs');
const path = require('path');

// Resolve modules from backend/node_modules
const backendModules = path.resolve(__dirname, '../backend/node_modules');
const dotenv = require(path.join(backendModules, 'dotenv'));
const mysql = require(path.join(backendModules, 'mysql2/promise'));
const bcrypt = require(path.join(backendModules, 'bcryptjs'));

// Load environment from backend/.env
const envPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'gamecloud';

async function runSetup() {
  console.log('====================================================');
  console.log('   GameCloud Platform - Database Setup & Migrations  ');
  console.log('====================================================');
  console.log(`Connecting to MySQL on ${DB_HOST}:${DB_PORT} as user '${DB_USER}'...`);

  let connection;
  try {
    // 1. Initial connection without database selection to ensure DB exists
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✓ Successfully connected to MySQL server.');

    // 2. Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✓ Database '${DB_NAME}' created / verified.`);

    await connection.query(`USE \`${DB_NAME}\`;`);

    // 3. Read and execute schema.sql
    const schemaPath = path.resolve(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Applying database schema from schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✓ Tables created successfully.');
    }

    // 4. Seed Admin and Demo User
    console.log('Seeding default users...');
    const adminPasswordHash = await bcrypt.hash('Joy@2006', 10);
    const playerPasswordHash = await bcrypt.hash('Joy@2006', 10);

    const [existingUsers] = await connection.query('SELECT username FROM users WHERE username IN (?, ?)', ['admin', 'player1']);
    const existingUsernames = existingUsers.map(u => u.username);

    if (!existingUsernames.includes('admin')) {
      await connection.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@gamecloud.local', adminPasswordHash, 'admin']
      );
      console.log('✓ Created default admin user: admin / Joy@2006');
    } else {
      console.log('ℹ Admin user already exists, skipping.');
    }

    if (!existingUsernames.includes('player1')) {
      await connection.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['player1', 'player1@gamecloud.local', playerPasswordHash, 'user']
      );
      console.log('✓ Created demo user: player1 / Joy@2006');
    } else {
      console.log('ℹ Demo user player1 already exists, skipping.');
    }

    // 5. Read and execute seed data
    const seedPath = path.resolve(__dirname, 'seeds/001_seed_data.sql');
    if (fs.existsSync(seedPath)) {
      console.log('Applying catalogue seed data...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✓ Categories and initial games seeded successfully.');
    }

    // 6. Summary check
    const [gameCount] = await connection.query('SELECT COUNT(*) as count FROM games');
    const [catCount] = await connection.query('SELECT COUNT(*) as count FROM categories');
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');

    console.log('----------------------------------------------------');
    console.log('Database Setup Completed Successfully!');
    console.log(`- Categories in database: ${catCount[0].count}`);
    console.log(`- Games in database:      ${gameCount[0].count}`);
    console.log(`- Registered Users:       ${userCount[0].count}`);
    console.log('====================================================');

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

runSetup();
