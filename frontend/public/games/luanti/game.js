import * as THREE from '../common/three.module.js';

class VoxelWorldGame {
  constructor() {
    this.canvas = document.getElementById('glcanvas');
    this.minedCountEl = document.getElementById('mined-count');
    this.overlay = document.getElementById('overlay');
    this.btnStart = document.getElementById('btn-start');
    this.hotbarSlots = document.querySelectorAll('.slot');

    this.isPlaying = false;
    this.minedCount = 0;
    this.selectedBlockType = 1; // 1: Grass, 2: Dirt, 3: Stone, 4: Wood, 5: Cyber, 6: Leaf

    // Block Materials
    this.materials = {
      1: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 }), // Grass
      2: new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9 }), // Dirt
      3: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 }), // Stone
      4: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 }), // Wood
      5: new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.6 }), // Cyber Ore
      6: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 })  // Leaf
    };
    this.boxGeo = new THREE.BoxGeometry(1, 1, 1);

    // Player State
    this.playerPos = new THREE.Vector3(8, 6, 8);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isGrounded = false;
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ');

    this.keys = { forward: false, backward: false, left: false, right: false, jump: false };
    this.blocks = new Map(); // "x,y,z" -> Mesh
    this.blockObjects = []; // array for raycasting

    this.audioCtx = null;

    this.initThree();
    this.generateTerrain();
    this.setupEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.FogExp2(0x38bdf8, 0.02);

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambLight);

    const sun = new THREE.DirectionalLight(0xfffaed, 1.4);
    sun.position.set(50, 80, 40);
    this.scene.add(sun);

    this.raycaster = new THREE.Raycaster();
  }

  generateTerrain() {
    const size = 16;
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        // Natural rolling height
        const height = Math.floor(Math.sin(x * 0.4) * 1.5 + Math.cos(z * 0.4) * 1.5) + 3;

        for (let y = 0; y <= height; y++) {
          let type = 3; // Stone
          if (y === height) type = 1; // Grass
          else if (y > height - 2) type = 2; // Dirt
          else if (Math.random() < 0.08) type = 5; // Cyber Ore

          this.addBlock(x, y, z, type);
        }
      }
    }

    // Spawn a couple of trees
    this.spawnTree(4, 5, 4);
    this.spawnTree(11, 5, 11);
  }

  spawnTree(tx, ty, tz) {
    for (let y = 0; y < 4; y++) {
      this.addBlock(tx, ty + y, tz, 4); // Wood trunk
    }
    for (let lx = -1; lx <= 1; lx++) {
      for (let lz = -1; lz <= 1; lz++) {
        for (let ly = 3; ly <= 5; ly++) {
          if (lx === 0 && lz === 0 && ly === 3) continue;
          this.addBlock(tx + lx, ty + ly, tz + lz, 6); // Leaves
        }
      }
    }
  }

  addBlock(x, y, z, type) {
    const key = `${x},${y},${z}`;
    if (this.blocks.has(key)) return;

    const mesh = new THREE.Mesh(this.boxGeo, this.materials[type]);
    mesh.position.set(x, y, z);
    mesh.userData = { x, y, z, type };
    this.scene.add(mesh);
    this.blocks.set(key, mesh);
    this.blockObjects.push(mesh);
  }

  removeBlock(mesh) {
    const { x, y, z } = mesh.userData;
    const key = `${x},${y},${z}`;
    this.scene.remove(mesh);
    this.blocks.delete(key);
    const idx = this.blockObjects.indexOf(mesh);
    if (idx > -1) this.blockObjects.splice(idx, 1);
  }

  setupEvents() {
    window.addEventListener('keydown', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = true;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = true;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = true;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = true;
      if (e.code === 'Space') this.keys.jump = true;

      if (e.code >= 'Digit1' && e.code <= 'Digit6') {
        const num = parseInt(e.code.replace('Digit', ''));
        this.selectSlot(num);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['KeyW', 'ArrowUp'].includes(e.code)) this.keys.forward = false;
      if (['KeyS', 'ArrowDown'].includes(e.code)) this.keys.backward = false;
      if (['KeyA', 'ArrowLeft'].includes(e.code)) this.keys.left = false;
      if (['KeyD', 'ArrowRight'].includes(e.code)) this.keys.right = false;
      if (e.code === 'Space') this.keys.jump = false;
    });

    // Mouse Look PointerLock
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
      const movementX = e.movementX || 0;
      const movementY = e.movementY || 0;

      this.euler.y -= movementX * 0.0025;
      this.euler.x -= movementY * 0.0025;
      this.euler.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.euler.x));
      this.camera.quaternion.setFromEuler(this.euler);
    });

    // Mouse Clicks: Left = Mine, Right = Place
    this.canvas.addEventListener('mousedown', (e) => {
      if (!this.isLocked) return;
      this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
      const intersects = this.raycaster.intersectObjects(this.blockObjects);

      if (intersects.length > 0 && intersects[0].distance < 7) {
        const hit = intersects[0];
        if (e.button === 0) {
          // Left click: Break block
          this.removeBlock(hit.object);
          this.minedCount++;
          this.minedCountEl.textContent = this.minedCount;
          this.playSound(200, 0.08, 'sawtooth');
        } else if (e.button === 2) {
          // Right click: Place block adjacent to face normal
          const normal = hit.face.normal;
          const px = Math.round(hit.object.position.x + normal.x);
          const py = Math.round(hit.object.position.y + normal.y);
          const pz = Math.round(hit.object.position.z + normal.z);
          this.addBlock(px, py, pz, this.selectedBlockType);
          this.playSound(450, 0.05, 'triangle');
        }
      }
    });

    // Context menu prevent default (so right click works smoothly)
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    // Hotbar click events
    this.hotbarSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const type = parseInt(slot.getAttribute('data-type'));
        this.selectSlot(type);
      });
    });

    this.btnStart.addEventListener('click', () => this.start());

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  selectSlot(type) {
    this.selectedBlockType = type;
    this.hotbarSlots.forEach(slot => {
      slot.classList.toggle('active', parseInt(slot.getAttribute('data-type')) === type);
    });
  }

  initAudio() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    } catch (e) {}
  }

  playSound(freq, dur, type = 'sine') {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
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
    this.initAudio();
  }

  updatePhysics(delta) {
    if (!this.isPlaying) return;

    // Movement vectors
    const moveVector = new THREE.Vector3();
    if (this.keys.forward) moveVector.z -= 1;
    if (this.keys.backward) moveVector.z += 1;
    if (this.keys.left) moveVector.x -= 1;
    if (this.keys.right) moveVector.x += 1;
    moveVector.normalize();

    // Rotate movement relative to camera yaw
    moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.euler.y);

    const speed = 7.5;
    this.playerPos.x += moveVector.x * speed * delta;
    this.playerPos.z += moveVector.z * speed * delta;

    // Gravity & Ground collision
    const floorY = 5.2; // Base ground height
    if (this.playerPos.y > floorY) {
      this.velocity.y -= 22 * delta; // Gravity
    } else {
      this.playerPos.y = floorY;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    if (this.keys.jump && this.isGrounded) {
      this.velocity.y = 8.5;
      this.isGrounded = false;
      this.playSound(350, 0.1, 'sine');
    }

    this.playerPos.y += this.velocity.y * delta;
    this.camera.position.copy(this.playerPos);
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
  new VoxelWorldGame();
});
