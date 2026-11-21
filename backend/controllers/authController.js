const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'gamecloud_default_jwt_secret_key';
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user or email already exists
    const [existing] = await pool.query(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?',
      [username.trim(), email.trim().toLowerCase()]
    );

    if (existing.length > 0) {
      const match = existing[0];
      const field = match.username.toLowerCase() === username.trim().toLowerCase() ? 'Username' : 'Email';
      return res.status(409).json({
        success: false,
        message: `${field} is already taken.`
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default role is 'user'
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), passwordHash, 'user']
    );

    const newUser = {
      id: result.insertId,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role: 'user'
    };

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        token,
        user: newUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/Email and password are required.'
      });
    }

    const [users] = await pool.query(
      'SELECT id, username, email, password_hash, role, created_at FROM users WHERE email = ? OR username = ?',
      [identifier.trim().toLowerCase(), identifier.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.'
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: safeUser
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = users[0];

    // Fetch user stats
    const [[{ favCount }]] = await pool.query(
      'SELECT COUNT(*) as favCount FROM favourites WHERE user_id = ?',
      [user.id]
    );

    const [[{ playedCount, totalPlayTime }]] = await pool.query(
      'SELECT COUNT(*) as playedCount, COALESCE(SUM(total_play_time_seconds), 0) as totalPlayTime FROM play_history WHERE user_id = ?',
      [user.id]
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          stats: {
            favourites: favCount,
            gamesPlayed: playedCount,
            totalPlayTimeSeconds: totalPlayTime
          }
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe };
