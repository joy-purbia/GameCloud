const express = require('express');
const router = express.Router();
const {
  createSession,
  heartbeatSession,
  stopSession,
  getUserSessions,
  getAllSessions
} = require('../controllers/sessionController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Anyone (including guests) can initiate a game session, but user_id is linked if logged in
router.post('/', optionalAuthMiddleware, createSession);
router.post('/:id/heartbeat', heartbeatSession);
router.patch('/:id/stop', stopSession);

// User sessions list
router.get('/', authMiddleware, getUserSessions);

// Admin-only session monitoring
router.get('/all', authMiddleware, roleMiddleware('admin'), getAllSessions);

module.exports = router;
