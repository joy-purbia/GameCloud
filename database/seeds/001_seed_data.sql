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
  'HexGL HyperSpeed',
  'hexgl',
  'Hyperspeed futuristic anti-gravity hovercraft racing game inspired by Wipeout. Navigate a neon cyber circuit at 500+ km/h using air-brakes and turbo speed pads.',
  'Racing',
  '/images/thumbnails/hexgl.jpg',
  'Gauge',
  '#ec4899',
  'browser_webgl',
  '/games/hexgl/index.html',
  'playable',
  JSON_OBJECT(
    'Thrust / Accelerate', 'W / Up Arrow',
    'Brake / Reverse', 'S / Down Arrow',
    'Steering', 'A / D or Left / Right',
    'Air Brakes (Drift)', 'Q / E',
    'Restart', 'R'
  )
),
(
  'SuperTuxKart 3D Grand Prix',
  'supertuxkart',
  '3D arcade kart racing featuring Tux the Penguin! Battle against AI rivals across an asphalt circuit, collect mystery power-ups (Nitro and Rockets), and fight for 1st place.',
  'Racing',
  '/images/thumbnails/supertuxkart.jpg',
  'Trophy',
  '#f59e0b',
  'browser_webgl',
  '/games/supertuxkart/index.html',
  'playable',
  JSON_OBJECT(
    'Accelerate', 'W / Up Arrow',
    'Brake / Reverse', 'S / Down Arrow',
    'Steer', 'A / D or Left / Right',
    'Use Power-Up Item', 'Space',
    'Restart', 'R'
  )
),
(
  'Luanti Voxel Sandbox 3D',
  'luanti',
  'Explore an infinite 3D voxel sandbox world. Mine blocks (grass, dirt, stone, wood, cyber ore) with left-click, place new blocks with right-click, and build your own voxel creations.',
  'Sandbox',
  '/images/thumbnails/luanti.jpg',
  'Box',
  '#10b981',
  'browser_webgl',
  '/games/luanti/index.html',
  'playable',
  JSON_OBJECT(
    'Movement', 'WASD',
    'Look (Mouse Lock)', 'Mouse',
    'Mine / Break Block', 'Left Click',
    'Place Block', 'Right Click',
    'Jump', 'Space',
    'Hotbar Slot Select', 'Keys 1 to 6'
  )
),
(
  'OpenArena Cyber FPS',
  'openarena',
  'High-octane 3D arena first-person shooter. Equip your energy plasma blaster, navigate cyber platforms and jump pads, and destroy combat drones to rack up frags.',
  'Action',
  '/images/thumbnails/openarena.jpg',
  'Crosshair',
  '#ef4444',
  'browser_webgl',
  '/games/openarena/index.html',
  'playable',
  JSON_OBJECT(
    'Movement / Strafe', 'WASD',
    'Aim / Look (Mouse Lock)', 'Mouse',
    'Fire Plasma Blaster', 'Left Click',
    'Jump / Launch Pad', 'Space',
    'Reload Energy Core', 'R'
  )
)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  description = VALUES(description),
  launch_type = VALUES(launch_type),
  status = VALUES(status),
  launch_url = VALUES(launch_url),
  controls = VALUES(controls);
