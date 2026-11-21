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
    name: 'HexGL',
    slug: 'hexgl',
    description: 'Tribute to futuristic anti-gravity racing classics like Wipeout. Currently catalogued as an experimental WebGL asset investigation.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/hexgl.jpg',
    icon: 'Gauge',
    color: '#ec4899',
    launch_type: 'browser_webgl',
    launch_url: '',
    status: 'experimental',
    controls: {
      'Steering': 'A / D or Left / Right',
      'Air Brakes': 'Q / E'
    }
  },
  {
    id: 4,
    name: 'SuperTuxKart 3D',
    slug: 'supertuxkart',
    description: 'Open-source 3D arcade kart racer featuring Tux and friends. WebAssembly (Wasm) packaging pipeline is in active research.',
    genre: 'Racing',
    thumbnail: '/images/thumbnails/supertuxkart.jpg',
    icon: 'Trophy',
    color: '#f59e0b',
    launch_type: 'browser_wasm',
    launch_url: '',
    status: 'coming_soon',
    controls: {
      'Steer': 'Left / Right',
      'Accelerate': 'Up Arrow',
      'Use Item': 'Space'
    }
  },
  {
    id: 5,
    name: 'Luanti (Minetest)',
    slug: 'luanti',
    description: 'Infinite-world voxel sandbox gaming engine. Architectural study underway for Emscripten WebAssembly client.',
    genre: 'Sandbox',
    thumbnail: '/images/thumbnails/luanti.jpg',
    icon: 'Box',
    color: '#10b981',
    launch_type: 'browser_wasm',
    launch_url: '',
    status: 'coming_soon',
    controls: {
      'Movement': 'WASD',
      'Look / Mine': 'Mouse',
      'Jump': 'Space'
    }
  },
  {
    id: 6,
    name: 'OpenArena',
    slug: 'openarena',
    description: 'Community open-source arena FPS built on the id Tech 3 engine. Prepared for future WebRTC streaming testbed.',
    genre: 'Action',
    thumbnail: '/images/thumbnails/openarena.jpg',
    icon: 'Crosshair',
    color: '#ef4444',
    launch_type: 'remote_container',
    launch_url: '',
    status: 'experimental',
    controls: {
      'Movement': 'WASD',
      'Aim / Fire': 'Mouse',
      'Jump': 'Space'
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
