const pool = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const [[{ totalPlays, totalTime }]] = await pool.query(
      `SELECT 
        COUNT(session_id) as totalPlays, 
        COALESCE(SUM(duration_seconds), 0) as totalTime 
       FROM game_sessions WHERE user_id = ?`,
      [userId]
    );

    const [[{ favCount }]] = await pool.query(
      'SELECT COUNT(*) as favCount FROM favourites WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        ...users[0],
        stats: {
          totalSessions: totalPlays,
          totalPlayTimeSeconds: totalTime,
          favouriteCount: favCount
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/favourites
const getFavourites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        g.id,
        g.name,
        g.slug,
        g.description,
        g.genre,
        g.thumbnail,
        g.icon,
        g.color,
        g.launch_type,
        g.launch_url,
        g.status,
        f.created_at AS favourited_at,
        TRUE AS is_favourite
      FROM favourites f
      JOIN games g ON f.game_id = g.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;

    const [favourites] = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/favourites
const addFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({
        success: false,
        message: 'gameId is required.'
      });
    }

    await pool.query(
      'INSERT IGNORE INTO favourites (user_id, game_id) VALUES (?, ?)',
      [userId, gameId]
    );

    res.status(201).json({
      success: true,
      message: 'Game added to favourites.'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/favourites/:gameId
const removeFavourite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { gameId } = req.params;

    await pool.query(
      'DELETE FROM favourites WHERE user_id = ? AND game_id = ?',
      [userId, gameId]
    );

    res.status(200).json({
      success: true,
      message: 'Game removed from favourites.'
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/history
const getPlayHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        h.id,
        h.game_id,
        g.name AS game_name,
        g.slug AS game_slug,
        g.thumbnail,
        g.genre,
        g.status,
        h.total_play_time_seconds,
        h.last_played_at
      FROM play_history h
      JOIN games g ON h.game_id = g.id
      WHERE h.user_id = ?
      ORDER BY h.last_played_at DESC
    `;

    const [history] = await pool.query(query, [userId]);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/all (Admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.created_at,
        COUNT(DISTINCT s.session_id) AS total_sessions,
        COALESCE(SUM(s.duration_seconds), 0) AS total_play_time_seconds
      FROM users u
      LEFT JOIN game_sessions s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;

    const [users] = await pool.query(query);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  getFavourites,
  addFavourite,
  removeFavourite,
  getPlayHistory,
  getAllUsers
};
