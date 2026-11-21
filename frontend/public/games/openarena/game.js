import * as THREE from '../common/three.module.js';

class OpenArenaFPS {
  constructor() {
    this.canvas = document.getElementById('glcanvas');
    this.fragCountEl = document.getElementById('frag-count');
    this.matchTimeEl = document.getElementById('match-time');
    this.healthValEl = document.getElementById('health-val');
    this.healthBarEl = document.getElementById('health-bar-fill');
    this.ammoValEl = document.getElementById('ammo-val');
    this.overlay = document.getElementById('overlay');
    this.btnStart = document.getElementById('btn-start');

    this.isPlaying = false;
    this.isLocked = false;
    this.frags = 0;
    this.health = 100;
    this.ammo = 30;
    this.maxAmmo = 30;
    this.isReloading = false;

    // Movement & Camera
    this.playerPos = new THREE.Vector3(0, 2.0, 15);
    this.velocity = new THREE.Vector3();
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
    this.isGrounded = false;

    this.keys = { forward: false, backward: false, left: false, right: false, jump: false };
    this.projectiles = [];
    this.targets = [];

    this.audioCtx = null;

    this.initThree();
    this.createArena();
    this.createBlasterViewmodel();
    this.spawnTargets();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0a14, 0.012);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0x221133, 1.4);
    this.scene.add(ambLight);

    const redLight = new THREE.PointLight(0xef4444, 2, 50);
    redLight.position.set(0, 15, 0);
    this.scene.add(redLight);

    const blueLight = new THREE.PointLight(0x38bdf8, 2, 50);
    blueLight.position.set(-15, 10, -15);
    this.scene.add(blueLight);
  }

  createArena() {
    // Floor
    const floorGeo = new THREE.PlaneGeometry(80, 80);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    // Arena Outer Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1b4b, metalness: 0.6 });
    const wallGeo = new THREE.BoxGeometry(80, 16, 2);

    const w1 = new THREE.Mesh(wallGeo, wallMat);
    w1.position.set(0, 8, -40);
    this.scene.add(w1);

    const w2 = new THREE.Mesh(wallGeo, wallMat);
    w2.position.set(0, 8, 40);
    this.scene.add(w2);

    const w3 = new THREE.Mesh(wallGeo, wallMat);
    w3.rotation.y = Math.PI / 2;
    w3.position.set(-40, 8, 0);
    this.scene.add(w3);

    const w4 = new THREE.Mesh(wallGeo, wallMat);
    w4.rotation.y = Math.PI / 2;
    w4.position.set(40, 8, 0);
    this.scene.add(w4);

    // Center Pillars & Platforms
    const pillarGeo = new THREE.CylinderGeometry(2, 2, 14, 16);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });

    for (const [px, pz] of [[-15, -15], [15, -15], [-15, 15], [15, 15]]) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(px, 7, pz);
      this.scene.add(p);
    }

    // Jump Pad in center
    const padGeo = new THREE.CylinderGeometry(3, 3, 0.4, 16);
    const padMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    this.jumpPad = new THREE.Mesh(padGeo, padMat);
    this.jumpPad.position.set(0, 0.2, 0);
    this.scene.add(this.jumpPad);
  }

  createBlasterViewmodel() {
    this.gun = new THREE.Group();

    const barrelGeo = new THREE.BoxGeometry(0.12, 0.12, 0.8);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
    const barrel = new THREE.Mesh(barrelGeo, gunMat);
    this.gun.add(barrel);

    const coreGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.4, 8);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.rotation.x = Math.PI / 2;
    core.position.set(0, 0.08, -0.1);
    this.gun.add(core);

    this.gun.position.set(0.35, -0.3, -0.6);
    this.camera.add(this.gun);
    this.scene.add(this.camera);
  }

  spawnTargets() {
    const droneGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const droneMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.7 });
    const eyeGeo = new THREE.SphereGeometry(0.4, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    for (let i = 0; i < 6; i++) {
      const drone = new THREE.Group();
      const body = new THREE.Mesh(droneGeo, droneMat);
      drone.add(body);

      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(0, 0, 1.0);
      drone.add(eye);

      const ringGeo = new THREE.TorusGeometry(1.6, 0.1, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      drone.add(ring);

      const angle = (i / 6) * Math.PI * 2;
      const dist = 18 + Math.random() * 12;
      drone.position.set(Math.cos(angle) * dist, 3 + Math.random() * 4, Math.sin(angle) * dist);
      drone.userData = { angle, dist, speed: 0.6 + Math.random() * 0.5 };

      this.scene.add(drone);
      this.targets.push(drone);
    }
  }

  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = true;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = true;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = true;
      if (e.code === 'Space') this.keys.jump = true;
      if (e.code === 'KeyR') this.reload();
    });

    window.addEventListener('keyup', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = false;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = false;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = false;
      if (e.code === 'Space') this.keys.jump = false;
    });

    document.addEventListener('pointerlockchange', () => {
      this.isLocked = (document.pointerLockElement === this.canvas);
    });

    this.canvas.addEventListener('click', () => {
      if (!this.isPlaying) return;
      if (!this.isLocked) {
        this.canvas.requestPointerLock();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isLocked) return;
      this.euler.y -= (e.movementX || 0) * 0.0022;
      this.euler.x -= (e.movementY || 0) * 0.0022;
      this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.isLocked || !this.isPlaying) return;
      if (e.button === 0) this.shoot();
    });

    this.btnStart.addEventListener('click', () => this.start());

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {}
  }

  playSound(freq, dur, type = 'sine', sweepTo = null) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      if (sweepTo) {
        osc.frequency.exponentialRampToValueAtTime(sweepTo, this.audioCtx.currentTime + dur);
      }
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
    this.canvas.requestPointerLock();
    this.startTime = performance.now();
    this.initAudio();
  }

  shoot() {
    if (this.ammo <= 0 || this.isReloading) {
      this.playSound(180, 0.08, 'sawtooth');
      return;
    }

    this.ammo--;
    this.ammoValEl.textContent = this.ammo;
    this.playSound(950, 0.12, 'sawtooth', 200);

    // Gun recoil
    this.gun.position.z += 0.1;
    setTimeout(() => { this.gun.position.z = -0.6; }, 60);

    // Spawn Projectile
    const boltGeo = new THREE.SphereGeometry(0.2, 8, 8);
    const boltMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const bolt = new THREE.Mesh(boltGeo, boltMat);

    // Direction vector from camera
    const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    bolt.position.copy(this.camera.position).add(dir.clone().multiplyScalar(0.8));
    bolt.userData = { velocity: dir.multiplyScalar(65), life: 2.0 };

    this.scene.add(bolt);
    this.projectiles.push(bolt);
  }

  reload() {
    if (this.isReloading || this.ammo === this.maxAmmo) return;
    this.isReloading = true;
    this.ammoValEl.textContent = '...';
    this.playSound(400, 0.3, 'sine', 800);

    setTimeout(() => {
      this.ammo = this.maxAmmo;
      this.ammoValEl.textContent = this.ammo;
      this.isReloading = false;
      this.playSound(600, 0.1, 'triangle');
    }, 1000);
  }

  updatePhysics(delta) {
    if (!this.isPlaying) return;

    // Movement
    const move = new THREE.Vector3();
    if (this.keys.forward) move.z -= 1;
    if (this.keys.backward) move.z += 1;
    if (this.keys.left) move.x -= 1;
    if (this.keys.right) move.x += 1;
    move.normalize();
    move.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const speed = 14;
    this.playerPos.x += move.x * speed * delta;
    this.playerPos.z += move.z * speed * delta;

    // Arena boundary clamp
    this.playerPos.x = Math.max(-36, Math.min(36, this.playerPos.x));
    this.playerPos.z = Math.max(-36, Math.min(36, this.playerPos.z));

    // Jump pad detection
    const distToPad = Math.hypot(this.playerPos.x - this.jumpPad.position.x, this.playerPos.z - this.jumpPad.position.z);
    if (distToPad < 3.2 && this.playerPos.y <= 2.2) {
      this.velocity.y = 20;
      this.playSound(300, 0.4, 'triangle', 900);
    }

    // Gravity
    if (this.playerPos.y > 2.0) {
      this.velocity.y -= 26 * delta;
      this.isGrounded = false;
    } else {
      this.playerPos.y = 2.0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = 11;
      this.isGrounded = false;
      this.playSound(400, 0.15, 'sine');
    }

    this.playerPos.y += this.velocity.y * delta;
    this.camera.position.copy(this.playerPos);

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const bolt = this.projectiles[i];
      bolt.position.addScaledVector(bolt.userData.velocity, delta);
      bolt.userData.life -= delta;

      // Check hit with drones
      let hit = false;
      for (const target of this.targets) {
        if (bolt.position.distanceTo(target.position) < 1.6) {
          hit = true;
          this.frags++;
          this.fragCountEl.textContent = this.frags;
          this.playSound(140, 0.3, 'sawtooth');

          // Respawn target elsewhere
          target.position.set(
            (Math.random() - 0.5) * 60,
            2.5 + Math.random() * 5,
            (Math.random() - 0.5) * 60
          );
          break;
        }
      }

      if (hit || bolt.userData.life <= 0) {
        this.scene.remove(bolt);
        this.projectiles.splice(i, 1);
      }
    }

    // Drone animations
    for (const target of this.targets) {
      target.userData.angle += target.userData.speed * delta;
      target.position.x = Math.cos(target.userData.angle) * target.userData.dist;
      target.position.z = Math.sin(target.userData.angle) * target.userData.dist;
      target.position.y += Math.sin(performance.now() * 0.003 + target.userData.angle) * 0.01;
      target.lookAt(this.playerPos.x, this.playerPos.y, this.playerPos.z);
    }

    // Match Time HUD
    const elapsed = performance.now() - (this.startTime || performance.now());
    const m = Math.floor(elapsed / 60000).toString().padStart(2, '0');
    const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    this.matchTimeEl.textContent = `${m}:${s}`;
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
  new OpenArenaFPS();
});
