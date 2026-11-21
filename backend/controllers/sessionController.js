const crypto = require('crypto');
const pool = require('../config/db');

// POST /api/sessions
const createSession = async (req, res, next) => {
  try {
    const { gameId, executionType = 'browser' } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'gameId is required to start a game session.'
      });
    }

    // Verify game exists
    const [games] = await pool.query('SELECT id, name, status FROM games WHERE id = ?', [gameId]);
    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found.'
      });
    }

    const sessionId = `sess_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    await pool.query(
      `INSERT INTO game_sessions (session_id, user_id, game_id, status, execution_type, started_at)
       VALUES (?, ?, ?, 'active', ?, NOW())`,
      [sessionId, userId, gameId, executionType]
    );

    res.status(201).json({
      success: true,
      message: 'Game session initialized.',
      data: {
        sessionId,
        gameId,
        userId,
        status: 'active',
        startedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/sessions/:id/stop
const stopSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { durationSeconds = 0 } = req.body;

    const [sessions] = await pool.query(
      'SELECT session_id, user_id, game_id, status, started_at FROM game_sessions WHERE session_id = ?',
      [id]
    );

    if (sessions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.'
      });
    }

    const session = sessions[0];
    const duration = Math.max(0, parseInt(durationSeconds, 10) || 0);

    await pool.query(
      `UPDATE game_sessions 
       SET status = 'ended', stopped_at = NOW(), duration_seconds = ?
       WHERE session_id = ?`,
      [duration, id]
    );

    // If session had a registered user, record/update play history
    if (session.user_id) {
      await pool.query(
        `INSERT INTO play_history (user_id, game_id, total_play_time_seconds, last_played_at)
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
           total_play_time_seconds = total_play_time_seconds + VALUES(total_play_time_seconds),
           last_played_at = NOW()`,
        [session.user_id, session.game_id, duration]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Game session ended successfully.',
      data: {
        sessionId: id,
        durationSeconds: duration,
        status: 'ended'
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions (user's sessions)
const getUserSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        s.session_id,
        s.game_id,
        g.name AS game_name,
        g.thumbnail AS game_thumbnail,
        g.genre AS game_genre,
        s.status,
        s.execution_type,
        s.duration_seconds,
        s.started_at,
        s.stopped_at
      FROM game_sessions s
      JOIN games g ON s.game_id = g.id
      WHERE s.user_id = ?
      ORDER BY s.started_at DESC
      LIMIT 50
    `;

    const [sessions] = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/all (Admin only)
const getAllSessions = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        s.session_id,
        s.user_id,
        u.username,
        u.email,
        s.game_id,
        g.name AS game_name,
        s.status,
        s.execution_type,
        s.duration_seconds,
        s.started_at,
        s.stopped_at
      FROM game_sessions s
      JOIN games g ON s.game_id = g.id
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.started_at DESC
      LIMIT 100
    `;

    const [sessions] = await pool.query(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createSession,
  stopSession,
  getUserSessions,
  getAllSessions
};
