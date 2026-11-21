import * as THREE from '../common/three.module.js';

class SuperTuxKartGame {
  constructor() {
    this.canvas = document.getElementById('glcanvas');
    this.speedValEl = document.getElementById('speed-val');
    this.timeValEl = document.getElementById('time-val');
    this.lapValEl = document.getElementById('lap-val');
    this.posValEl = document.getElementById('pos-val');
    this.itemIconEl = document.getElementById('item-icon');
    this.overlay = document.getElementById('overlay');
    this.btnStart = document.getElementById('btn-start');

    this.isPlaying = false;
    this.isGameOver = false;

    // Player Kart State
    this.speed = 0;
    this.maxSpeed = 160;
    this.accel = 120;
    this.friction = 40;
    this.steer = 0;
    this.kartPos = { x: 0, y: 0.5, z: 0 };
    this.kartRot = 0;
    this.trackWidth = 26;
    this.lap = 1;
    this.totalLaps = 3;
    this.totalDistance = 0;
    this.trackLength = 2200;
    this.currentItem = null; // 'NITRO' or 'ROCKET'

    this.keys = { up: false, down: false, left: false, right: false, space: false };

    // AI Rivals (3 karts)
    this.rivals = [
      { id: 1, name: 'Hex Bot', color: 0xef4444, z: -30, x: -5, speed: 135, distance: 30 },
      { id: 2, name: 'Tux Rival', color: 0x10b981, z: -60, x: 5, speed: 142, distance: 60 },
      { id: 3, name: 'Cyber Cat', color: 0xa855f7, z: -90, x: 0, speed: 130, distance: 90 }
    ];

    this.audioCtx = null;
    this.engineOsc = null;

    this.initThree();
    this.createCircuit();
    this.createPlayerKart();
    this.createRivals();
    this.createItemBoxes();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.003);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1500);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambLight);

    const sun = new THREE.DirectionalLight(0xfef08a, 1.8);
    sun.position.set(50, 100, 50);
    this.scene.add(sun);

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(1000, 3000);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -1500;
    this.scene.add(ground);
  }

  createCircuit() {
    // Asphalt Track
    const roadGeo = new THREE.PlaneGeometry(this.trackWidth, this.trackLength);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.z = -this.trackLength / 2;
    this.scene.add(road);

    // Checkered Finish Line
    const finishGeo = new THREE.PlaneGeometry(this.trackWidth, 10);
    const finishMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const finish = new THREE.Mesh(finishGeo, finishMat);
    finish.rotation.x = -Math.PI / 2;
    finish.position.set(0, 0.05, -5);
    this.scene.add(finish);

    // Track Curbs (Red & White Alternating Stripes)
    const curbGeo = new THREE.BoxGeometry(1.2, 0.4, 10);
    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const whiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (let z = 0; z > -this.trackLength; z -= 10) {
      const mat = (Math.abs(z) % 20 === 0) ? redMat : whiteMat;
      const leftCurb = new THREE.Mesh(curbGeo, mat);
      leftCurb.position.set(-this.trackWidth / 2 - 0.6, 0.2, z);
      this.scene.add(leftCurb);

      const rightCurb = new THREE.Mesh(curbGeo, mat);
      rightCurb.position.set(this.trackWidth / 2 + 0.6, 0.2, z);
      this.scene.add(rightCurb);
    }
  }

  createPlayerKart() {
    this.kart = this.buildKartMesh(0xf59e0b);
    this.kart.position.set(0, 0.5, 0);
    this.scene.add(this.kart);
  }

  createRivals() {
    this.rivalMeshes = [];
    for (const rival of this.rivals) {
      const mesh = this.buildKartMesh(rival.color);
      mesh.position.set(rival.x, 0.5, rival.z);
      this.scene.add(mesh);
      this.rivalMeshes.push(mesh);
    }
  }

  buildKartMesh(color) {
    const group = new THREE.Group();

    // Chassis body
    const bodyGeo = new THREE.BoxGeometry(2.4, 0.8, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    group.add(body);

    // Spoiler
    const spoilerGeo = new THREE.BoxGeometry(2.8, 0.15, 0.8);
    const spoilerMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const spoiler = new THREE.Mesh(spoilerGeo, spoilerMat);
    spoiler.position.set(0, 1.4, 1.7);
    group.add(spoiler);

    // Tux Driver Mascot (Spherical Body + Beak)
    const tuxBodyGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const tuxMat = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const tux = new THREE.Mesh(tuxBodyGeo, tuxMat);
    tux.position.set(0, 1.1, -0.2);
    group.add(tux);

    const beakGeo = new THREE.ConeGeometry(0.2, 0.4, 8);
    const beakMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const beak = new THREE.Mesh(beakGeo, beakMat);
    beak.rotation.x = -Math.PI / 2;
    beak.position.set(0, 1.1, -0.9);
    group.add(beak);

    // 4 Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
    const wheelPositions = [
      [-1.4, 0.5, -1.3],
      [1.4, 0.5, -1.3],
      [-1.4, 0.5, 1.3],
      [1.4, 0.5, 1.3]
    ];
    for (const [wx, wy, wz] of wheelPositions) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, wy, wz);
      group.add(w);
    }

    return group;
  }

  createItemBoxes() {
    this.itemBoxes = [];
    const boxGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, wireframe: false });

    for (let z = -120; z > -this.trackLength + 100; z -= 300) {
      for (let x = -8; x <= 8; x += 8) {
        const box = new THREE.Mesh(boxGeo, boxMat);
        box.position.set(x, 1.5, z);
        this.scene.add(box);
        this.itemBoxes.push(box);
      }
    }
  }

  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = true;
      if (e.code === 'Space') this.useItem();
      if (e.code === 'KeyR') this.restart();
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
    });

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    this.btnStart.addEventListener('click', () => this.start());
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.engineOsc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
      this.engineOsc.connect(gain);
      gain.connect(this.audioCtx.destination);
      this.engineOsc.start();
    } catch (e) {}
  }

  playSound(freq, dur, type = 'sine') {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + dur);
    } catch (e) {}
  }

  start() {
    this.overlay.classList.add('hidden');
    this.isPlaying = true;
    this.startTime = performance.now();
    this.initAudio();
  }

  restart() {
    this.kartPos = { x: 0, y: 0.5, z: 0 };
    this.speed = 0;
    this.lap = 1;
    this.totalDistance = 0;
    this.currentItem = null;
    this.isGameOver = false;
    this.updateItemUI();
    this.overlay.classList.add('hidden');
    this.isPlaying = true;
  }

  useItem() {
    if (!this.currentItem) return;

    if (this.currentItem === 'NITRO') {
      this.speed = 220;
      this.playSound(700, 0.4, 'triangle');
    } else if (this.currentItem === 'ROCKET') {
      this.playSound(250, 0.5, 'sawtooth');
      // Slow down the leading rival
      for (const rival of this.rivals) {
        if (rival.z < this.kartPos.z) {
          rival.speed = Math.max(40, rival.speed - 60);
          break;
        }
      }
    }

    this.currentItem = null;
    this.updateItemUI();
  }

  updateItemUI() {
    if (!this.currentItem) {
      this.itemIconEl.textContent = 'EMPTY';
      this.itemIconEl.className = 'item-none';
    } else if (this.currentItem === 'NITRO') {
      this.itemIconEl.textContent = '⚡ NITRO';
      this.itemIconEl.className = 'item-nitro';
    } else if (this.currentItem === 'ROCKET') {
      this.itemIconEl.textContent = '🚀 ROCKET';
      this.itemIconEl.className = 'item-rocket';
    }
  }

  update(delta) {
    if (!this.isPlaying || this.isGameOver) return;

    // Player Physics
    if (this.keys.up) this.speed = Math.min(this.speed + this.accel * delta, this.maxSpeed);
    else if (this.keys.down) this.speed = Math.max(this.speed - this.accel * delta, -40);
    else {
      if (this.speed > 0) this.speed = Math.max(0, this.speed - this.friction * delta);
      else if (this.speed < 0) this.speed = Math.min(0, this.speed + this.friction * delta);
    }

    let steerDelta = 0;
    if (this.keys.left) steerDelta -= 1;
    if (this.keys.right) steerDelta += 1;

    this.kartPos.x += steerDelta * 14 * delta;
    const boundary = this.trackWidth / 2 - 2;
    this.kartPos.x = Math.max(-boundary, Math.min(boundary, this.kartPos.x));

    const moveZ = (this.speed / 3.6) * delta * 2.2;
    this.kartPos.z -= moveZ;
    this.totalDistance += moveZ;

    // Check Item Box pickups
    for (const box of this.itemBoxes) {
      box.rotation.y += delta * 2;
      box.rotation.x += delta;
      if (Math.abs(this.kartPos.z - box.position.z) < 3 && Math.abs(this.kartPos.x - box.position.x) < 2.5) {
        if (!this.currentItem) {
          this.currentItem = Math.random() > 0.5 ? 'NITRO' : 'ROCKET';
          this.updateItemUI();
          this.playSound(800, 0.2, 'sine');
        }
      }
    }

    // AI Rivals movement
    for (let i = 0; i < this.rivals.length; i++) {
      const r = this.rivals[i];
      const m = this.rivalMeshes[i];
      const rivalMove = (r.speed / 3.6) * delta * 2.2;
      r.z -= rivalMove;
      r.distance += rivalMove;
      if (r.z < -this.trackLength) r.z = 0;
      m.position.set(r.x + Math.sin(performance.now() * 0.002 + i) * 2, 0.5, r.z);
    }

    // Rank Calculation
    let rank = 1;
    for (const r of this.rivals) {
      if (r.distance > this.totalDistance) rank++;
    }
    const suffixes = ['1st', '2nd', '3rd', '4th'];
    this.posValEl.textContent = suffixes[rank - 1] || `${rank}th`;

    // Lap Loop
    if (this.kartPos.z < -this.trackLength) {
      this.kartPos.z = 0;
      this.lap++;
      this.lapValEl.textContent = this.lap;
      this.playSound(600, 0.4, 'triangle');
      if (this.lap > this.totalLaps) {
        this.triggerFinish(rank);
      }
    }

    // Update kart mesh position & camera
    this.kart.position.set(this.kartPos.x, this.kartPos.y, this.kartPos.z);
    this.kart.rotation.y = -steerDelta * 0.15;

    this.camera.position.set(this.kartPos.x * 0.7, this.kartPos.y + 4.5, this.kartPos.z + 10);
    this.camera.lookAt(this.kartPos.x, this.kartPos.y + 1, this.kartPos.z - 20);

    // Audio pitch
    if (this.engineOsc && this.audioCtx) {
      this.engineOsc.frequency.setValueAtTime(50 + Math.abs(this.speed) * 0.8, this.audioCtx.currentTime);
    }

    // HUD
    this.speedValEl.textContent = Math.round(this.speed);
    const ms = performance.now() - (this.startTime || performance.now());
    const m = Math.floor(ms / 60000).toString().padStart(2, '0');
    const s = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    this.timeValEl.textContent = `${m}:${s}`;
  }

  triggerFinish(rank) {
    this.isGameOver = true;
    this.isPlaying = false;
    this.overlay.classList.remove('hidden');
    this.overlay.querySelector('.subtitle').textContent = `RACE FINISHED! YOU PLACED ${this.posValEl.textContent}!`;
    this.btnStart.textContent = 'PLAY AGAIN';
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const delta = Math.min((time - (this.lastTime || time)) / 1000, 0.1);
    this.lastTime = time;

    this.update(delta);
    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SuperTuxKartGame();
});
