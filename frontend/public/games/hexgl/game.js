import * as THREE from '../common/three.module.js';

class HexGLGame {
  constructor() {
    this.canvas = document.getElementById('glcanvas');
    this.speedValEl = document.getElementById('speed-val');
    this.lapTimeEl = document.getElementById('lap-time');
    this.lapValEl = document.getElementById('lap-val');
    this.shieldValEl = document.getElementById('shield-val');
    this.shieldBarEl = document.getElementById('shield-bar-fill');
    this.brakeLEl = document.getElementById('brake-l');
    this.brakeREl = document.getElementById('brake-r');
    this.overlay = document.getElementById('overlay');
    this.btnStart = document.getElementById('btn-start');

    this.isPlaying = false;
    this.isGameOver = false;

    // Physics & Ship State
    this.speed = 0;
    this.maxSpeed = 380;
    this.boostMaxSpeed = 560;
    this.acceleration = 180;
    this.friction = 40;
    this.turnSpeed = 2.4;
    this.shipPos = { x: 0, y: 1.5, z: 0 };
    this.shipRot = { x: 0, y: 0, z: 0 };
    this.shipRoll = 0;
    this.trackWidth = 24;
    this.shield = 100;
    this.currentLap = 1;
    this.totalLaps = 3;
    this.lapStartTime = 0;
    this.trackLength = 2400;
    this.distanceTraveled = 0;

    // Controls
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      airbrakeL: false,
      airbrakeR: false
    };

    // Audio
    this.audioCtx = null;
    this.engineGain = null;
    this.engineOsc = null;

    this.initThree();
    this.createTrack();
    this.createShip();
    this.createBoostPads();
    this.setupEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x05050e, 0.0035);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0x221133, 1.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xec4899, 2.0);
    dirLight.position.set(0, 50, -50);
    this.scene.add(dirLight);

    const cyanLight = new THREE.PointLight(0x06b6d4, 3.0, 100);
    cyanLight.position.set(0, 10, -10);
    this.scene.add(cyanLight);
    this.shipPointLight = cyanLight;

    // Cyberpunk Grid Skybox / Horizon
    const skyGeo = new THREE.SphereGeometry(1200, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x050510,
      side: THREE.BackSide
    });
    this.sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.sky);

    // Distant Neon Towers
    this.createCitySkyline();
  }

  createCitySkyline() {
    const group = new THREE.Group();
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const colors = [0xec4899, 0x8b5cf6, 0x06b6d4, 0x1e1b4b];

    for (let i = 0; i < 120; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        wireframe: Math.random() > 0.4
      });
      const tower = new THREE.Mesh(boxGeo, mat);
      const h = 50 + Math.random() * 250;
      const w = 15 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      const dist = 300 + Math.random() * 500;
      tower.position.set(Math.cos(angle) * dist, h / 2 - 20, Math.sin(angle) * dist);
      tower.scale.set(w, h, w);
      group.add(tower);
    }
    this.scene.add(group);
  }

  createTrack() {
    this.trackGroup = new THREE.Group();
    this.trackSegments = [];

    // Track surface
    const trackGeo = new THREE.PlaneGeometry(this.trackWidth, this.trackLength, 20, 200);
    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.2,
      metalness: 0.8
    });
    const trackMesh = new THREE.Mesh(trackGeo, trackMat);
    trackMesh.rotation.x = -Math.PI / 2;
    trackMesh.position.z = -this.trackLength / 2;
    this.trackGroup.add(trackMesh);

    // Glowing Neon Rails (Left & Right)
    const railGeo = new THREE.BoxGeometry(0.8, 1.2, this.trackLength);
    const leftRailMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    const rightRailMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const leftRail = new THREE.Mesh(railGeo, leftRailMat);
    leftRail.position.set(-this.trackWidth / 2, 0.6, -this.trackLength / 2);
    this.trackGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, rightRailMat);
    rightRail.position.set(this.trackWidth / 2, 0.6, -this.trackLength / 2);
    this.trackGroup.add(rightRail);

    // Track centerline dashes
    const dashGroup = new THREE.Group();
    const dashGeo = new THREE.PlaneGeometry(0.5, 6);
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let z = 0; z > -this.trackLength; z -= 14) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.05, z);
      dashGroup.add(dash);
    }
    this.trackGroup.add(dashGroup);

    // Neon Arches / Speed Gates
    for (let z = -100; z > -this.trackLength; z -= 180) {
      const arch = this.createArch();
      arch.position.set(0, 0, z);
      this.trackGroup.add(arch);
    }

    this.scene.add(this.trackGroup);
  }

  createArch() {
    const archGroup = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });

    const postGeo = new THREE.BoxGeometry(1, 10, 1);
    const p1 = new THREE.Mesh(postGeo, mat);
    p1.position.set(-this.trackWidth / 2 - 1, 5, 0);
    archGroup.add(p1);

    const p2 = new THREE.Mesh(postGeo, mat);
    p2.position.set(this.trackWidth / 2 + 1, 5, 0);
    archGroup.add(p2);

    const topGeo = new THREE.BoxGeometry(this.trackWidth + 3, 1, 1);
    const top = new THREE.Mesh(topGeo, mat);
    top.position.set(0, 10, 0);
    archGroup.add(top);

    return archGroup;
  }

  createBoostPads() {
    this.boostPads = [];
    const padGeo = new THREE.PlaneGeometry(6, 12);
    const padMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      side: THREE.DoubleSide
    });

    for (let z = -80; z > -this.trackLength + 100; z -= 250) {
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.rotation.x = -Math.PI / 2;
      const lane = (Math.random() - 0.5) * (this.trackWidth - 10);
      pad.position.set(lane, 0.06, z);
      this.scene.add(pad);
      this.boostPads.push(pad);
    }
  }

  createShip() {
    this.ship = new THREE.Group();

    // Central Cockpit Fuselage (Hexagonal sleek anti-grav body)
    const bodyGeo = new THREE.ConeGeometry(1.6, 6, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      roughness: 0.1,
      metalness: 0.9
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    this.ship.add(body);

    // Glowing Canopy
    const canopyGeo = new THREE.SphereGeometry(0.8, 16, 8);
    const canopyMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 0.4, 0.5);
    canopy.scale.set(0.7, 0.5, 1.8);
    this.ship.add(canopy);

    // Left Wing
    const wingGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, -1,
      -3.2, -0.2, 1.8,
      0, 0, 1.8
    ]);
    wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    wingGeo.computeVertexNormals();
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      side: THREE.DoubleSide,
      metalness: 0.8
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    this.ship.add(leftWing);

    // Right Wing
    const rightWing = leftWing.clone();
    rightWing.scale.x = -1;
    this.ship.add(rightWing);

    // Twin Thruster Glow
    const thrusterGeo = new THREE.CylinderGeometry(0.35, 0.45, 1, 16);
    const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

    const tL = new THREE.Mesh(thrusterGeo, thrusterMat);
    tL.rotation.x = Math.PI / 2;
    tL.position.set(-0.8, 0.1, 2.8);
    this.ship.add(tL);

    const tR = tL.clone();
    tR.position.x = 0.8;
    this.ship.add(tR);

    this.ship.position.set(0, 1.4, 0);
    this.scene.add(this.ship);
  }

  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (e.code === 'KeyQ') {
        this.keys.airbrakeL = true;
        this.brakeLEl.classList.add('active');
      }
      if (e.code === 'KeyE') {
        this.keys.airbrakeR = true;
        this.brakeREl.classList.add('active');
      }
      if (e.code === 'KeyR') this.restart();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (e.code === 'KeyQ') {
        this.keys.airbrakeL = false;
        this.brakeLEl.classList.remove('active');
      }
      if (e.code === 'KeyE') {
        this.keys.airbrakeR = false;
        this.brakeREl.classList.remove('active');
      }
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.btnStart.addEventListener('click', () => {
      this.start();
    });
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.engineOsc = this.audioCtx.createOscillator();
      this.engineGain = this.audioCtx.createGain();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.audioCtx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.audioCtx.destination);
      this.engineOsc.start();
    } catch (err) {
      console.warn('Audio not initialized', err);
    }
  }

  playBeep(freq, duration, type = 'sine') {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  start() {
    this.overlay.classList.add('hidden');
    this.isPlaying = true;
    this.isGameOver = false;
    this.lapStartTime = performance.now();
    this.initAudio();
  }

  restart() {
    this.shipPos = { x: 0, y: 1.5, z: 0 };
    this.speed = 0;
    this.shield = 100;
    this.currentLap = 1;
    this.distanceTraveled = 0;
    this.lapStartTime = performance.now();
    this.isGameOver = false;
    this.shieldBarEl.style.width = '100%';
    this.shieldValEl.textContent = '100%';
    this.lapValEl.textContent = '1';
    this.overlay.classList.add('hidden');
    this.isPlaying = true;
  }

  updatePhysics(delta) {
    if (!this.isPlaying || this.isGameOver) return;

    // Acceleration & Braking
    if (this.keys.up) {
      this.speed = Math.min(this.speed + this.acceleration * delta, this.maxSpeed);
    } else if (this.keys.down) {
      this.speed = Math.max(this.speed - this.acceleration * 1.5 * delta, -60);
    } else {
      if (this.speed > 0) this.speed = Math.max(0, this.speed - this.friction * delta);
      else if (this.speed < 0) this.speed = Math.min(0, this.speed + this.friction * delta);
    }

    // Steering & Airbrakes
    let steerRate = 0;
    if (this.keys.left) steerRate -= 1;
    if (this.keys.right) steerRate += 1;
    if (this.keys.airbrakeL) steerRate -= 1.4;
    if (this.keys.airbrakeR) steerRate += 1.4;

    this.shipPos.x += steerRate * this.turnSpeed * (Math.abs(this.speed) / 100 + 0.3) * delta * 12;

    // Boundary Wall Collision
    const wallLimit = this.trackWidth / 2 - 1.8;
    if (Math.abs(this.shipPos.x) > wallLimit) {
      this.shipPos.x = Math.sign(this.shipPos.x) * wallLimit;
      this.speed *= 0.85;
      this.shield = Math.max(0, this.shield - 18 * delta);
      this.playBeep(120, 0.08, 'sawtooth');
      this.shieldBarEl.style.width = `${Math.round(this.shield)}%`;
      this.shieldValEl.textContent = `${Math.round(this.shield)}%`;

      if (this.shield <= 0) {
        this.triggerGameOver('SHIP DESTROYED — SHIELD DEPLETED');
      }
    }

    // Forward Movement & Lap progress
    const moveDist = (this.speed / 3.6) * delta * 2.5;
    this.shipPos.z -= moveDist;
    this.distanceTraveled += moveDist;

    // Check Boost Pads
    for (const pad of this.boostPads) {
      const distZ = Math.abs(this.shipPos.z - pad.position.z);
      const distX = Math.abs(this.shipPos.x - pad.position.x);
      if (distZ < 4 && distX < 3.2) {
        this.speed = this.boostMaxSpeed;
        this.playBeep(880, 0.3, 'sine');
      }
    }

    // Lap Loop
    if (this.shipPos.z < -this.trackLength) {
      this.shipPos.z = 0;
      this.currentLap++;
      this.lapValEl.textContent = this.currentLap;
      this.playBeep(600, 0.4, 'triangle');
      if (this.currentLap > this.totalLaps) {
        this.triggerGameOver('COURSE CLEARED! HYPER-SPEED VICTORY!');
      }
    }

    // Dynamic Hover / Bank Roll
    const targetRoll = -steerRate * 0.45;
    this.shipRoll += (targetRoll - this.shipRoll) * 0.15;
    const hoverFloat = Math.sin(performance.now() * 0.008) * 0.12;

    this.ship.position.set(this.shipPos.x, this.shipPos.y + hoverFloat, this.shipPos.z);
    this.ship.rotation.z = this.shipRoll;
    this.ship.rotation.y = -steerRate * 0.2;

    // Dynamic Camera Tracking
    const camTargetZ = this.shipPos.z + 12;
    const camTargetX = this.shipPos.x * 0.65;
    const camTargetY = this.shipPos.y + 4.2;

    this.camera.position.x += (camTargetX - this.camera.position.x) * 0.15;
    this.camera.position.y += (camTargetY - this.camera.position.y) * 0.15;
    this.camera.position.z += (camTargetZ - this.camera.position.z) * 0.2;
    this.camera.lookAt(this.shipPos.x, this.shipPos.y + 1, this.shipPos.z - 25);

    // Audio Engine pitch
    if (this.engineOsc && this.audioCtx) {
      const pitch = 60 + Math.abs(this.speed) * 0.9;
      this.engineOsc.frequency.setValueAtTime(pitch, this.audioCtx.currentTime);
    }

    // Update HUD
    this.speedValEl.textContent = Math.round(this.speed);
    const elapsedMs = performance.now() - this.lapStartTime;
    const mins = Math.floor(elapsedMs / 60000).toString().padStart(2, '0');
    const secs = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');
    const ms = Math.floor((elapsedMs % 1000) / 10).toString().padStart(2, '0');
    this.lapTimeEl.textContent = `${mins}:${secs}.${ms}`;
  }

  triggerGameOver(msg) {
    this.isGameOver = true;
    this.isPlaying = false;
    this.overlay.classList.remove('hidden');
    this.overlay.querySelector('.subtitle').textContent = msg;
    this.btnStart.textContent = 'RACE AGAIN';
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const delta = Math.min((time - (this.lastTime || time)) / 1000, 0.1);
    this.lastTime = time;

    this.updatePhysics(delta);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new HexGLGame();
});
