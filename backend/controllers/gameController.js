const pool = require('../config/db');

// GET /api/games
const getAllGames = async (req, res, next) => {
  try {
    const { search, genre, status, sort } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
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
        g.controls,
        g.created_at,
        g.updated_at,
        COUNT(DISTINCT f.id) AS total_favourites,
        COUNT(DISTINCT s.session_id) AS total_plays
        ${userId ? ', (CASE WHEN uf.id IS NOT NULL THEN TRUE ELSE FALSE END) AS is_favourite' : ', FALSE AS is_favourite'}
      FROM games g
      LEFT JOIN favourites f ON g.id = f.game_id
      LEFT JOIN game_sessions s ON g.id = s.game_id
      ${userId ? 'LEFT JOIN favourites uf ON g.id = uf.game_id AND uf.user_id = ' + pool.escape(userId) : ''}
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ' AND (g.name LIKE ? OR g.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    if (genre && genre !== 'all') {
      query += ' AND LOWER(g.genre) = LOWER(?)';
      params.push(genre.trim());
    }

    if (status && status !== 'all') {
      query += ' AND g.status = ?';
      params.push(status.trim());
    }

    query += ' GROUP BY g.id';

    // Sorting
    switch (sort) {
      case 'name_asc':
        query += ' ORDER BY g.name ASC';
        break;
      case 'name_desc':
        query += ' ORDER BY g.name DESC';
        break;
      case 'popular':
        query += ' ORDER BY total_plays DESC, total_favourites DESC';
        break;
      case 'oldest':
        query += ' ORDER BY g.created_at ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY (g.status = "playable") DESC, g.created_at DESC';
        break;
    }

    const [games] = await pool.query(query, params);

    // Format controls if stored as JSON/string
    const formattedGames = games.map(g => ({
      ...g,
      is_favourite: Boolean(g.is_favourite),
      controls: typeof g.controls === 'string' ? JSON.parse(g.controls) : g.controls
    }));

    res.status(200).json({
      success: true,
      count: formattedGames.length,
      data: formattedGames
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/games/:idOrSlug
const getGameByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const userId = req.user ? req.user.id : null;

    const isNumeric = /^\d+$/.test(idOrSlug);
    const whereClause = isNumeric ? 'g.id = ?' : 'g.slug = ?';

    const query = `
      SELECT 
        g.*,
        COUNT(DISTINCT f.id) AS total_favourites,
        COUNT(DISTINCT s.session_id) AS total_plays
        ${userId ? ', (CASE WHEN uf.id IS NOT NULL THEN TRUE ELSE FALSE END) AS is_favourite' : ', FALSE AS is_favourite'}
      FROM games g
      LEFT JOIN favourites f ON g.id = f.game_id
      LEFT JOIN game_sessions s ON g.id = s.game_id
      ${userId ? 'LEFT JOIN favourites uf ON g.id = uf.game_id AND uf.user_id = ' + pool.escape(userId) : ''}
      WHERE ${whereClause}
      GROUP BY g.id
    `;

    const [games] = await pool.query(query, [idOrSlug]);

    if (games.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found.'
      });
    }

    const game = games[0];
    game.is_favourite = Boolean(game.is_favourite);
    if (typeof game.controls === 'string') {
      try {
        game.controls = JSON.parse(game.controls);
      } catch (e) {
        game.controls = {};
      }
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/games/categories
const getCategories = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.description, 
        COUNT(g.id) AS game_count
      FROM categories c
      LEFT JOIN games g ON LOWER(c.name) = LOWER(g.genre)
      GROUP BY c.id
      ORDER BY c.name ASC
    `;

    const [categories] = await pool.query(query);

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/games (Admin only)
const createGame = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      genre,
      thumbnail,
      icon,
      color,
      launch_type,
      launch_url,
      status,
      controls
    } = req.body;

    if (!name || !genre) {
      return res.status(400).json({
        success: false,
        message: 'Name and genre are required fields.'
      });
    }

    const gameSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    const controlsJson = typeof controls === 'object' ? JSON.stringify(controls) : (controls || '{}');

    const [result] = await pool.query(
      `INSERT INTO games 
        (name, slug, description, genre, thumbnail, icon, color, launch_type, launch_url, status, controls)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        gameSlug,
        description || '',
        genre.trim(),
        thumbnail || '/images/thumbnails/default.jpg',
        icon || 'Gamepad2',
        color || '#06b6d4',
        launch_type || 'browser_webgl',
        launch_url || '',
        status || 'playable',
        controlsJson
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Game created successfully.',
      data: { id: result.insertId, slug: gameSlug }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A game with this title or slug already exists.'
      });
    }
    next(err);
  }
};

// PUT /api/games/:id (Admin only)
const updateGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      genre,
      thumbnail,
      icon,
      color,
      launch_type,
      launch_url,
      status,
      controls
    } = req.body;

    const [existing] = await pool.query('SELECT id FROM games WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found.'
      });
    }

    const controlsJson = typeof controls === 'object' ? JSON.stringify(controls) : controls;

    await pool.query(
      `UPDATE games SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        genre = COALESCE(?, genre),
        thumbnail = COALESCE(?, thumbnail),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        launch_type = COALESCE(?, launch_type),
        launch_url = COALESCE(?, launch_url),
        status = COALESCE(?, status),
        controls = COALESCE(?, controls)
      WHERE id = ?`,
      [
        name,
        slug,
        description,
        genre,
        thumbnail,
        icon,
        color,
        launch_type,
        launch_url,
        status,
        controlsJson,
        id
      ]
    );

    res.status(200).json({
      success: true,
      message: 'Game updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/games/:id (Admin only)
const deleteGame = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM games WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Game not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Game deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllGames,
  getGameByIdOrSlug,
  getCategories,
  createGame,
  updateGame,
  deleteGame
};
