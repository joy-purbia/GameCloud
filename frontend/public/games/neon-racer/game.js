import * as THREE from './three.module.js';

// --- SOUND SYNTHESIZER (Web Audio API - No external assets needed) ---
class SoundSystem {
  constructor() {
    this.ctx = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Continuous Engine Hum
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.ctx.currentTime);
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      // Lowpass filter for smooth hum
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or blocked');
    }
  }

  updateEngine(speedRatio) {
    if (!this.initialized || !this.ctx || !this.engineOsc) return;
    const targetFreq = 50 + speedRatio * 180;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    this.engineGain.gain.setTargetAtTime(0.03 + speedRatio * 0.05, this.ctx.currentTime, 0.05);
  }

  playBoost() {
    if (!this.initialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }

  playCrash() {
    if (!this.initialized || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }
}

const sounds = new SoundSystem();

// --- GAME CONSTANTS & STATE ---
const ROAD_WIDTH = 14;
const ROAD_LENGTH = 400;
const SEGMENT_COUNT = 30;

const state = {
  running: false,
  gameOver: false,
  speed: 0,           // Current speed in internal units
  maxSpeed: 1.8,      // ~240 km/h
  acceleration: 0.012,
  braking: 0.02,
  friction: 0.005,
  boostTimer: 0,
  carX: 0,
  carSteerVelocity: 0,
  carRoll: 0,
  distance: 0,
  score: 0,
  shield: 100,
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    drift: false
  }
};

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050608, 0.007);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
dirLight.position.set(0, 40, 20);
scene.add(dirLight);

// --- PROCEDURAL 3D CAR MODEL ---
function createCyberCar() {
  const carGroup = new THREE.Group();

  // 1. Lower Body / Chassis
  const bodyGeo = new THREE.BoxGeometry(2.0, 0.5, 4.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x111625,
    metalness: 0.8,
    roughness: 0.2
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.5;
  carGroup.add(body);

  // 2. Cabin / Windshield
  const cabinGeo = new THREE.BoxGeometry(1.4, 0.45, 2.0);
  const cabinMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0x06b6d4,
    emissiveIntensity: 0.25
  });
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 0.9, -0.2);
  carGroup.add(cabin);

  // 3. Neon Underglow
  const underglowLight = new THREE.PointLight(0x06b6d4, 2.5, 8);
  underglowLight.position.set(0, 0.1, 0);
  carGroup.add(underglowLight);

  // 4. Headlights (Cyan Neon)
  const headGeo = new THREE.BoxGeometry(0.35, 0.15, 0.1);
  const headMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const headL = new THREE.Mesh(headGeo, headMat);
  headL.position.set(-0.7, 0.5, -2.1);
  const headR = headL.clone();
  headR.position.set(0.7, 0.5, -2.1);
  carGroup.add(headL, headR);

  // 5. Taillights (Red/Magenta Neon)
  const tailGeo = new THREE.BoxGeometry(1.6, 0.12, 0.1);
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.position.set(0, 0.6, 2.1);
  carGroup.add(tail);

  // 6. Rear Spoiler
  const spoilerBarGeo = new THREE.BoxGeometry(1.8, 0.1, 0.4);
  const spoilerBar = new THREE.Mesh(spoilerBarGeo, bodyMat);
  spoilerBar.position.set(0, 1.1, 1.8);
  carGroup.add(spoilerBar);

  // 7. Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x020408, roughness: 0.8 });
  const wheels = [];

  const wheelPositions = [
    [-1.05, 0.35, -1.3],
    [1.05, 0.35, -1.3],
    [-1.05, 0.35, 1.3],
    [1.05, 0.35, 1.3]
  ];

  wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(...pos);
    carGroup.add(wheel);
    wheels.push(wheel);
  });

  carGroup.wheels = wheels;
  return carGroup;
}

const playerCar = createCyberCar();
scene.add(playerCar);

// --- PROCEDURAL SYNTHWAVE ENVIRONMENT & ROAD ---
// Road Surface
const roadSegments = [];
const segmentLength = ROAD_LENGTH / SEGMENT_COUNT;

const roadMat = new THREE.MeshStandardMaterial({
  color: 0x080c14,
  roughness: 0.7
});

const borderMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
const dashMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

for (let i = 0; i < SEGMENT_COUNT; i++) {
  const group = new THREE.Group();

  // Tarmac
  const roadMesh = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_WIDTH, segmentLength), roadMat);
  roadMesh.rotation.x = -Math.PI / 2;
  group.add(roadMesh);

  // Left Border Neon Rail
  const borderGeo = new THREE.BoxGeometry(0.3, 0.4, segmentLength);
  const borderL = new THREE.Mesh(borderGeo, borderMat);
  borderL.position.set(-ROAD_WIDTH / 2, 0.2, 0);
  const borderR = new THREE.Mesh(borderGeo, borderMat);
  borderR.position.set(ROAD_WIDTH / 2, 0.2, 0);
  group.add(borderL, borderR);

  // Center Dashed Line
  const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, segmentLength * 0.4), dashMat);
  dash.rotation.x = -Math.PI / 2;
  dash.position.y = 0.02;
  group.add(dash);

  group.position.z = -i * segmentLength;
  scene.add(group);
  roadSegments.push(group);
}

// Synthwave Grid Horizon / Terrain
const gridHelper = new THREE.GridHelper(800, 80, 0x8b5cf6, 0x1e1b4b);
gridHelper.position.y = -0.5;
gridHelper.position.z = -200;
scene.add(gridHelper);

// --- OBSTACLES & BOOST PADS POOL ---
const obstacles = [];
const boosts = [];

const obstacleGeo = new THREE.BoxGeometry(2.4, 1.4, 0.6);
const obstacleMat = new THREE.MeshStandardMaterial({
  color: 0xf43f5e,
  emissive: 0xf43f5e,
  emissiveIntensity: 0.8,
  roughness: 0.2
});

const boostGeo = new THREE.BoxGeometry(2.2, 0.05, 3.0);
const boostMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

function spawnTrackObjects() {
  // Clear existing
  obstacles.forEach(o => scene.remove(o));
  boosts.forEach(b => scene.remove(b));
  obstacles.length = 0;
  boosts.length = 0;

  const lanes = [-4.5, -1.5, 1.5, 4.5];

  for (let z = -50; z > -ROAD_LENGTH * 3; z -= 35) {
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const isBoost = Math.random() < 0.3;

    if (isBoost) {
      const b = new THREE.Mesh(boostGeo, boostMat);
      b.position.set(lane, 0.05, z);
      scene.add(b);
      boosts.push(b);
    } else {
      const obs = new THREE.Mesh(obstacleGeo, obstacleMat);
      obs.position.set(lane, 0.7, z);
      scene.add(obs);
      obstacles.push(obs);
    }
  }
}

spawnTrackObjects();

// --- INPUT EVENT LISTENERS ---
window.addEventListener('keydown', (e) => {
  sounds.init();
  if (!state.running && !state.gameOver && (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'Enter')) {
    document.getElementById('start-modal').classList.remove('active');
    state.running = true;
  }
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      state.keys.up = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      state.keys.down = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      state.keys.left = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      state.keys.right = true;
      break;
    case 'Space':
      state.keys.drift = true;
      break;
    case 'KeyR':
      restartGame();
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyW':
    case 'ArrowUp':
      state.keys.up = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      state.keys.down = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      state.keys.left = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      state.keys.right = false;
      break;
    case 'Space':
      state.keys.drift = false;
      break;
  }
});

// UI Buttons & Click to Start
container.addEventListener('click', () => {
  sounds.init();
  if (!state.running && !state.gameOver) {
    document.getElementById('start-modal').classList.remove('active');
    state.running = true;
  }
});

document.getElementById('start-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  sounds.init();
  document.getElementById('start-modal').classList.remove('active');
  state.running = true;
});

document.getElementById('restart-btn').addEventListener('click', () => {
  restartGame();
});

function restartGame() {
  document.getElementById('gameover-modal').classList.remove('active');
  document.getElementById('start-modal').classList.remove('active');
  state.running = true;
  state.gameOver = false;
  state.speed = 0.4;
  state.carX = 0;
  state.carSteerVelocity = 0;
  state.carRoll = 0;
  state.distance = 0;
  state.score = 0;
  state.shield = 100;
  state.boostTimer = 0;
  playerCar.position.set(0, 0, 0);
  spawnTrackObjects();
}

function triggerGameOver() {
  state.running = false;
  state.gameOver = true;
  sounds.playCrash();

  document.getElementById('final-score').innerText = Math.floor(state.score).toLocaleString();
  document.getElementById('final-distance').innerText = Math.floor(state.distance) + 'm';
  document.getElementById('gameover-modal').classList.add('active');
}

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- MAIN GAME LOOP ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  if (state.running) {
    // 1. Acceleration / Braking
    const currentMax = state.boostTimer > 0 ? state.maxSpeed * 1.4 : state.maxSpeed;

    if (state.boostTimer > 0) {
      state.boostTimer -= delta;
      state.speed = Math.min(state.speed + state.acceleration * 2.5, currentMax);
    } else if (state.keys.up) {
      state.speed = Math.min(state.speed + state.acceleration, currentMax);
    } else if (state.keys.down) {
      state.speed = Math.max(state.speed - state.braking, 0);
    } else {
      state.speed = Math.max(state.speed - state.friction, 0);
    }

    // Auto cruise minimum speed once started
    if (state.speed < 0.25) state.speed = 0.25;

    // 2. Steering & Drifting
    const steerSpeed = state.keys.drift ? 18 : 13;
    let targetSteer = 0;

    if (state.keys.left) targetSteer -= 1;
    if (state.keys.right) targetSteer += 1;

    state.carSteerVelocity += (targetSteer * steerSpeed - state.carSteerVelocity) * 0.15;
    state.carX += state.carSteerVelocity * delta;

    // Road boundary collision
    const halfRoad = ROAD_WIDTH / 2 - 1.2;
    if (state.carX < -halfRoad) {
      state.carX = -halfRoad;
      state.carSteerVelocity *= -0.5;
    } else if (state.carX > halfRoad) {
      state.carX = halfRoad;
      state.carSteerVelocity *= -0.5;
    }

    playerCar.position.x = state.carX;

    // Visual roll banking on car
    const targetRoll = -state.carSteerVelocity * 0.04;
    state.carRoll += (targetRoll - state.carRoll) * 0.2;
    playerCar.rotation.z = state.carRoll;
    playerCar.rotation.y = -state.carSteerVelocity * 0.03;

    // Wheel spin
    playerCar.wheels.forEach(w => {
      w.rotation.x -= state.speed * 0.6;
    });

    // 3. Move Road & Infinite Recycle
    const moveDist = state.speed * 85 * delta;
    state.distance += moveDist;
    const speedKmH = Math.floor(state.speed * 140);
    state.score += (speedKmH * 0.1) * (state.boostTimer > 0 ? 2.5 : 1.0);

    roadSegments.forEach(seg => {
      seg.position.z += moveDist;
      if (seg.position.z > segmentLength) {
        seg.position.z -= ROAD_LENGTH;
      }
    });

    // Move Obstacles and Boosts towards player
    obstacles.forEach(obs => {
      obs.position.z += moveDist;
      // Collision test
      if (Math.abs(obs.position.z) < 2.0 && Math.abs(obs.position.x - playerCar.position.x) < 1.8) {
        // Hit obstacle!
        sounds.playCrash();
        state.shield -= 35;
        state.speed *= 0.4;
        obs.position.z = 20; // push past

        // Screen flash shake
        camera.position.x += (Math.random() - 0.5) * 0.8;
        camera.position.y += (Math.random() - 0.5) * 0.8;

        if (state.shield <= 0) {
          state.shield = 0;
          triggerGameOver();
        }
      }

      // Recycle obstacle behind camera
      if (obs.position.z > 20) {
        obs.position.z = -ROAD_LENGTH * 2.5 - Math.random() * 50;
        const lanes = [-4.5, -1.5, 1.5, 4.5];
        obs.position.x = lanes[Math.floor(Math.random() * lanes.length)];
      }
    });

    boosts.forEach(b => {
      b.position.z += moveDist;
      // Boost pad pickup
      if (Math.abs(b.position.z) < 2.5 && Math.abs(b.position.x - playerCar.position.x) < 1.6) {
        sounds.playBoost();
        state.boostTimer = 3.0; // 3 seconds nitro
        state.score += 250;
        b.position.z = 20;
      }

      if (b.position.z > 20) {
        b.position.z = -ROAD_LENGTH * 2.5 - Math.random() * 80;
        const lanes = [-4.5, -1.5, 1.5, 4.5];
        b.position.x = lanes[Math.floor(Math.random() * lanes.length)];
      }
    });

    // Regenerate shield slowly
    if (state.shield < 100 && state.shield > 0) {
      state.shield = Math.min(100, state.shield + delta * 2);
    }

    // Audio update
    sounds.updateEngine(state.speed / state.maxSpeed);

    // 4. Update HUD
    document.getElementById('hud-speed').innerText = speedKmH;
    document.getElementById('hud-distance').innerText = Math.floor(state.distance) + 'm';
    document.getElementById('hud-score').innerText = Math.floor(state.score).toLocaleString();
    const shieldBar = document.getElementById('shield-bar');
    shieldBar.style.width = state.shield + '%';
    if (state.shield < 35) {
      shieldBar.style.background = '#f43f5e';
    } else if (state.shield < 65) {
      shieldBar.style.background = '#f59e0b';
    } else {
      shieldBar.style.background = 'linear-gradient(90deg, #06b6d4, #10b981)';
    }

    // Camera chase logic
    camera.position.x = playerCar.position.x * 0.4;
    camera.position.y = 4.0;
    camera.position.z = 6.5;
    camera.lookAt(playerCar.position.x * 0.7, 1.2, -15);
  }

  renderer.render(scene, camera);
}

animate();
