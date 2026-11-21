const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'error: ' + err.message;
  }

  res.status(200).json({
    status: 'ok',
    platform: 'GameCloud Localhost Gaming Platform',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: 'MySQL 8.0',
      status: dbStatus
    },
    version: '1.0.0'
  });
});

module.exports = router;
