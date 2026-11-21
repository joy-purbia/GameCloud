const bcrypt = require('bcryptjs');

const DDL_TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE IF NOT EXISTS games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    genre VARCHAR(50) NOT NULL,
    thumbnail VARCHAR(255),
    icon VARCHAR(255),
    color VARCHAR(50) DEFAULT '#06b6d4',
    launch_type VARCHAR(50) DEFAULT 'browser_webgl',
    launch_url VARCHAR(255) NOT NULL,
    status ENUM('playable', 'coming_soon', 'experimental') DEFAULT 'playable',
    controls JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB;`,

  `CREATE TABLE IF NOT EXISTS favourites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_fav (user_id, game_id)
  ) ENGINE=InnoDB;`,

  `CREATE TABLE IF NOT EXISTS game_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id INT NULL,
    game_id INT NOT NULL,
    status ENUM('active', 'ended', 'crashed') DEFAULT 'active',
    execution_type VARCHAR(50) DEFAULT 'browser',
    container_id VARCHAR(100) NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    stopped_at TIMESTAMP NULL,
    duration_seconds INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
  ) ENGINE=InnoDB;`,

  `CREATE TABLE IF NOT EXISTS play_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    total_play_time_seconds INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_history (user_id, game_id)
  ) ENGINE=InnoDB;`
];

const SEED_CATEGORIES = [
  { name: 'Racing', slug: 'racing', description: 'High-speed track and arcade racing games' },
  { name: 'Puzzle', slug: 'puzzle', description: 'Mind-bending logic and tile matching puzzles' },
  { name: 'Action', slug: 'action', description: 'Fast-paced action and combat games' },
  { name: 'Sandbox', slug: 'sandbox', description: 'Open-world creative and exploration games' },
  { name: 'Arcade', slug: 'arcade', description: 'Classic retro and casual arcade gaming' }
];

const SEED_GAMES = [
  {
    name: 'Neon Racer',
    slug: 'neon-racer',
    description: 'Futuristic 3D synthwave racing game built from scratch using Three.js and WebGL. Accelerate through neon-lit cyber highways, avoid obstacle barriers, trigger speed boost gates, and compete for the highest distance score.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/neon-racer.svg',
    icon: 'Zap',
    color: '#8b5cf6',
    launch_type: 'browser_webgl',
    launch_url: '/games/neon-racer/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Accelerate': 'W / Up Arrow',
      'Brake / Reverse': 'S / Down Arrow',
      'Steer Left': 'A / Left Arrow',
      'Steer Right': 'D / Right Arrow',
      'Drift / Handbrake': 'Space',
      'Restart Game': 'R'
    })
  },
  {
    name: '2048 Cyber Grid',
    slug: '2048',
    description: 'The classic 4x4 sliding tile puzzle redesigned with a sleek dark cyberpunk aesthetic. Use arrow keys or swipe gestures to merge matching numerical tiles and reach the legendary 2048 tile.',
    genre: 'Puzzle',
    thumbnail: '/images/thumbnails/2048.svg',
    icon: 'Grid',
    color: '#06b6d4',
    launch_type: 'browser_canvas',
    launch_url: '/games/2048/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Move Tiles': 'Arrow Keys / WASD',
      'Restart Game': 'R / New Game Button'
    })
  },
  {
    name: 'HexGL Anti-Gravity',
    slug: 'hexgl',
    description: 'Futuristic sci-fi anti-gravity racing game built with HTML5, WebGL, and Three.js. Pilot a high-speed hovercraft reaching speeds over 500 km/h through high-altitude magnetic tracks.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/hexgl.svg',
    icon: 'Flame',
    color: '#ec4899',
    launch_type: 'browser_webgl',
    launch_url: '/games/hexgl/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Accelerate': 'Up Arrow',
      'Brake / Reverse': 'Down Arrow',
      'Steer Left / Right': 'Left / Right Arrow',
      'Left Airbrake': 'A',
      'Right Airbrake': 'D',
      'Restart': 'R'
    })
  },
  {
    name: 'SuperTuxKart Web',
    slug: 'supertuxkart',
    description: '3D arcade kart racing featuring open-source mascots. Drift through sunny coastal tracks, collect power-up gift boxes, trigger nitro boosts, and out-maneuver AI racers.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/supertuxkart.svg',
    icon: 'Trophy',
    color: '#f59e0b',
    launch_type: 'browser_webgl',
    launch_url: '/games/supertuxkart/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Accelerate': 'W / Up Arrow',
      'Brake / Reverse': 'S / Down Arrow',
      'Steer Left': 'A / Left Arrow',
      'Steer Right': 'D / Right Arrow',
      'Drift / Hop': 'Space',
      'Restart': 'R'
    })
  },
  {
    name: 'Luanti Voxel Sandbox',
    slug: 'luanti',
    description: 'Voxel sandbox world powered by Three.js and WebGL. Explore procedurally generated terrain, mine grass, stone, wood, and cobblestone blocks, and craft structures in creative mode.',
    genre: 'Sandbox',
    thumbnail: '/images/thumbnails/luanti.svg',
    icon: 'Boxes',
    color: '#10b981',
    launch_type: 'browser_webgl',
    launch_url: '/games/luanti/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Move': 'W, A, S, D',
      'Jump': 'Space',
      'Look Around': 'Mouse Click & Drag',
      'Break Block': 'Left Click',
      'Place Block': 'Right Click',
      'Select Block': 'Keys 1 - 5'
    })
  },
  {
    name: 'OpenArena Web Combat',
    slug: 'openarena',
    description: 'Fast-paced first-person 3D arena deathmatch. Navigate cyber colosseums with jump pads, collect armor and ammo crates, and eliminate enemy combat bots.',
    genre: 'Action',
    thumbnail: '/images/thumbnails/openarena.svg',
    icon: 'Crosshair',
    color: '#ef4444',
    launch_type: 'browser_webgl',
    launch_url: '/games/openarena/index.html',
    status: 'playable',
    controls: JSON.stringify({
      'Move': 'W, A, S, D',
      'Jump': 'Space',
      'Aim / Look': 'Mouse Click & Drag',
      'Shoot': 'Left Mouse Button',
      'Reload': 'R'
    })
  }
];

async function autoMigrate(pool) {
  try {
    console.log('[AutoMigrate] Checking database schema status...');

    // 1. Create tables if not present
    for (const ddl of DDL_TABLES) {
      await pool.query(ddl);
    }

    // 2. Seed default users if missing
    const [users] = await pool.query('SELECT username FROM users WHERE username IN (?, ?)', ['admin', 'player1']);
    const existingUsernames = users.map(u => u.username);

    if (!existingUsernames.includes('admin')) {
      const adminHash = await bcrypt.hash('Joy@2006', 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@gamecloud.local', adminHash, 'admin']
      );
      console.log('[AutoMigrate] ✓ Created default admin (admin / Joy@2006)');
    }

    if (!existingUsernames.includes('player1')) {
      const playerHash = await bcrypt.hash('Joy@2006', 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['player1', 'player1@gamecloud.local', playerHash, 'user']
      );
      console.log('[AutoMigrate] ✓ Created default player (player1 / Joy@2006)');
    }

    // 3. Seed categories if missing
    for (const cat of SEED_CATEGORIES) {
      await pool.query(
        `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [cat.name, cat.slug, cat.description]
      );
    }

    // 4. Seed games if missing
    for (const game of SEED_GAMES) {
      const [existing] = await pool.query('SELECT id FROM games WHERE slug = ?', [game.slug]);
      if (existing.length === 0) {
        await pool.query(
          `INSERT INTO games (name, slug, description, genre, thumbnail, icon, color, launch_type, launch_url, status, controls)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            game.name,
            game.slug,
            game.description,
            game.genre,
            game.thumbnail,
            game.icon,
            game.color,
            game.launch_type,
            game.launch_url,
            game.status,
            game.controls
          ]
        );
        console.log(`[AutoMigrate] ✓ Seeded game: ${game.name}`);
      }
    }

    console.log('[AutoMigrate] ✓ Database verification & migration complete.');
  } catch (err) {
    console.warn('[AutoMigrate] Database not available or setup skipped:', err.message);
  }
}

module.exports = { autoMigrate };
