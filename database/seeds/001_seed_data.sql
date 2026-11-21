USE gamecloud;

-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
('Racing', 'racing', 'High-speed track and arcade racing games'),
('Puzzle', 'puzzle', 'Mind-bending logic and tile matching puzzles'),
('Action', 'action', 'Fast-paced action and combat games'),
('Sandbox', 'sandbox', 'Open-world creative and exploration games'),
('Arcade', 'arcade', 'Classic retro and casual arcade gaming')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Seed Initial Games
INSERT INTO games (name, slug, description, genre, thumbnail, icon, color, launch_type, launch_url, status, controls) VALUES
(
  'Neon Racer',
  'neon-racer',
  'Futuristic 3D synthwave racing game built from scratch using Three.js and WebGL. Accelerate through neon-lit cyber highways, avoid obstacle barriers, trigger speed boost gates, and compete for the highest distance score.',
  'Racing',
  '/images/thumbnails/neon-racer.jpg',
  'Zap',
  '#8b5cf6',
  'browser_webgl',
  '/games/neon-racer/index.html',
  'playable',
  JSON_OBJECT(
    'Accelerate', 'W / Up Arrow',
    'Brake / Reverse', 'S / Down Arrow',
    'Steer Left', 'A / Left Arrow',
    'Steer Right', 'D / Right Arrow',
    'Drift / Handbrake', 'Space',
    'Restart Game', 'R'
  )
),
(
  '2048 Cyber Grid',
  '2048',
  'The classic 4x4 sliding tile puzzle redesigned with a sleek dark cyberpunk aesthetic. Use arrow keys or swipe gestures to merge matching numerical tiles and reach the legendary 2048 tile.',
  'Puzzle',
  '/images/thumbnails/2048.jpg',
  'Grid',
  '#06b6d4',
  'browser_canvas',
  '/games/2048/index.html',
  'playable',
  JSON_OBJECT(
    'Move Tiles', 'Arrow Keys / WASD',
    'Restart Game', 'R / New Game Button'
  )
),
(
  'HexGL',
  'hexgl',
  'Tribute to futuristic anti-gravity racing classics like Wipeout. Currently catalogued as an experimental WebGL asset investigation; direct browser bundle undergoing asset optimization.',
  'Racing',
  '/images/thumbnails/hexgl.jpg',
  'Gauge',
  '#ec4899',
  'browser_webgl',
  '',
  'experimental',
  JSON_OBJECT(
    'Steering', 'A / D or Left / Right',
    'Air Brakes', 'Q / E'
  )
),
(
  'SuperTuxKart 3D',
  'supertuxkart',
  'Open-source 3D arcade kart racer featuring Tux and friends. WebAssembly (Wasm) packaging pipeline is in active research for seamless browser execution.',
  'Racing',
  '/images/thumbnails/supertuxkart.jpg',
  'Trophy',
  '#f59e0b',
  'browser_wasm',
  '',
  'coming_soon',
  JSON_OBJECT(
    'Steer', 'Left / Right',
    'Accelerate', 'Up Arrow',
    'Use Item', 'Space'
  )
),
(
  'Luanti (Minetest)',
  'luanti',
  'Infinite-world voxel sandbox gaming engine. Architectural study underway for Emscripten WebAssembly client and containerized streaming.',
  'Sandbox',
  '/images/thumbnails/luanti.jpg',
  'Box',
  '#10b981',
  'browser_wasm',
  '',
  'coming_soon',
  JSON_OBJECT(
    'Movement', 'WASD',
    'Look / Mine', 'Mouse',
    'Jump', 'Space'
  )
),
(
  'OpenArena',
  'openarena',
  'Community open-source arena FPS built on the id Tech 3 engine. Prepared for remote container execution and WebRTC streaming testbed.',
  'Action',
  '/images/thumbnails/openarena.jpg',
  'Crosshair',
  '#ef4444',
  'remote_container',
  '',
  'experimental',
  JSON_OBJECT(
    'Movement', 'WASD',
    'Aim / Fire', 'Mouse',
    'Jump', 'Space'
  )
)
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  status = VALUES(status),
  launch_url = VALUES(launch_url),
  controls = VALUES(controls);
