export const DEFAULT_GAMES = [
  {
    id: 1,
    name: 'Neon Racer 3D',
    slug: 'neon-racer',
    description: 'Futuristic 3D synthwave racing game built from scratch using Three.js and WebGL. Accelerate through neon-lit cyber highways, avoid obstacle barriers, trigger speed boost gates, and compete for the highest distance score.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/neon-racer.jpg',
    icon: 'Zap',
    color: '#8b5cf6',
    launch_type: 'browser_webgl',
    launch_url: '/games/neon-racer/index.html',
    status: 'playable',
    controls: {
      'Accelerate': 'W / Up Arrow',
      'Brake / Reverse': 'S / Down Arrow',
      'Steer Left': 'A / Left Arrow',
      'Steer Right': 'D / Right Arrow',
      'Drift / Handbrake': 'Space',
      'Restart Game': 'R'
    }
  },
  {
    id: 2,
    name: '2048 Cyber Grid',
    slug: '2048',
    description: 'The classic 4x4 sliding tile puzzle redesigned with a sleek dark cyberpunk aesthetic. Use arrow keys or swipe gestures to merge matching numerical tiles and reach the legendary 2048 tile.',
    genre: 'Puzzle',
    thumbnail: '/images/thumbnails/2048.jpg',
    icon: 'Grid',
    color: '#06b6d4',
    launch_type: 'browser_canvas',
    launch_url: '/games/2048/index.html',
    status: 'playable',
    controls: {
      'Move Tiles': 'Arrow Keys / WASD',
      'Restart Game': 'R / New Game Button'
    }
  },
  {
    id: 3,
    name: 'HexGL HyperSpeed',
    slug: 'hexgl',
    description: 'Hyperspeed futuristic anti-gravity hovercraft racing game inspired by Wipeout. Navigate a neon cyber circuit at 500+ km/h using air-brakes and turbo speed pads.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/hexgl.jpg',
    icon: 'Gauge',
    color: '#ec4899',
    launch_type: 'browser_webgl',
    launch_url: '/games/hexgl/index.html',
    status: 'playable',
    controls: {
      'Thrust / Accelerate': 'W / Up Arrow',
      'Brake / Reverse': 'S / Down Arrow',
      'Steering': 'A / D or Left / Right',
      'Air Brakes (Drift)': 'Q / E',
      'Restart': 'R'
    }
  },
  {
    id: 4,
    name: 'SuperTuxKart 3D Grand Prix',
    slug: 'supertuxkart',
    description: '3D arcade kart racing featuring Tux the Penguin! Battle against AI rivals across an asphalt circuit, collect mystery power-ups (Nitro and Rockets), and fight for 1st place.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/supertuxkart.jpg',
    icon: 'Trophy',
    color: '#f59e0b',
    launch_type: 'browser_webgl',
    launch_url: '/games/supertuxkart/index.html',
    status: 'playable',
    controls: {
      'Accelerate': 'W / Up Arrow',
      'Brake / Reverse': 'S / Down Arrow',
      'Steer': 'A / D or Left / Right',
      'Use Power-Up Item': 'Space',
      'Restart': 'R'
    }
  },
  {
    id: 5,
    name: 'Luanti Voxel Sandbox 3D',
    slug: 'luanti',
    description: 'Explore an infinite 3D voxel sandbox world. Mine blocks (grass, dirt, stone, wood, cyber ore) with left-click, place new blocks with right-click, and build your own voxel creations.',
    genre: 'Sandbox',
    thumbnail: '/images/thumbnails/luanti.jpg',
    icon: 'Box',
    color: '#10b981',
    launch_type: 'browser_webgl',
    launch_url: '/games/luanti/index.html',
    status: 'playable',
    controls: {
      'Movement': 'WASD',
      'Look (Mouse Lock)': 'Mouse',
      'Mine / Break Block': 'Left Click',
      'Place Block': 'Right Click',
      'Jump': 'Space',
      'Hotbar Slot Select': 'Keys 1 to 6'
    }
  },
  {
    id: 6,
    name: 'OpenArena Cyber FPS',
    slug: 'openarena',
    description: 'High-octane 3D arena first-person shooter. Equip your energy plasma blaster, navigate cyber platforms and jump pads, and destroy combat drones to rack up frags.',
    genre: 'Action',
    thumbnail: '/images/thumbnails/openarena.jpg',
    icon: 'Crosshair',
    color: '#ef4444',
    launch_type: 'browser_webgl',
    launch_url: '/games/openarena/index.html',
    status: 'playable',
    controls: {
      'Movement / Strafe': 'WASD',
      'Aim / Look (Mouse Lock)': 'Mouse',
      'Fire Plasma Blaster': 'Left Click',
      'Jump / Launch Pad': 'Space',
      'Reload Energy Core': 'R'
    }
  }
];

export const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Racing', slug: 'racing', game_count: 3 },
  { id: 2, name: 'Puzzle', slug: 'puzzle', game_count: 1 },
  { id: 3, name: 'Action', slug: 'action', game_count: 1 },
  { id: 4, name: 'Sandbox', slug: 'sandbox', game_count: 1 },
  { id: 5, name: 'Arcade', slug: 'arcade', game_count: 0 }
];
