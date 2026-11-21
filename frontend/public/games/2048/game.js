// --- SOUND SYNTHESIS ---
class SoundEffects {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playMove() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(380, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  playMerge() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playWin() {
    this.init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      setTimeout(() => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
      }, idx * 100);
    });
  }

  playGameOver() {
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.4);
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.45);
  }
}

const sfx = new SoundEffects();

// --- GAME LOGIC ---
const SIZE = 4;
let grid = [];
let score = 0;
let bestScore = parseInt(localStorage.getItem('gamecloud_2048_best') || '0', 10);
let hasWon = false;
let keepPlaying = false;
let gameOver = false;

const boardEl = document.getElementById('grid-board');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('best-score');
const modalEl = document.getElementById('game-modal');
const modalTitleEl = document.getElementById('modal-title');
const modalDescEl = document.getElementById('modal-desc');
const modalActionBtn = document.getElementById('btn-modal-action');
const keepGoingBtn = document.getElementById('btn-keep-going');

bestScoreEl.innerText = bestScore;

function initGame() {
  grid = Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));
  score = 0;
  hasWon = false;
  keepPlaying = false;
  gameOver = false;
  scoreEl.innerText = score;
  modalEl.classList.remove('active');
  keepGoingBtn.style.display = 'none';

  spawnRandomTile();
  spawnRandomTile();
  renderGrid();
}

function spawnRandomTile() {
  const emptyCells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) emptyCells.push({ r, c });
    }
  }

  if (emptyCells.length > 0) {
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    return { r, c };
  }
  return null;
}

function getTileClass(val) {
  if (val === 0) return '';
  if (val > 2048) return 'tile-super';
  return `tile-${val}`;
}

function renderGrid(newTileCoord = null) {
  // Clear non-overlay elements
  const children = Array.from(boardEl.children);
  children.forEach(child => {
    if (child.id !== 'game-modal') {
      boardEl.removeChild(child);
    }
  });

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      const cell = document.createElement('div');
      cell.className = 'grid-cell';

      if (val > 0) {
        cell.innerText = val;
        cell.classList.add(getTileClass(val));
        if (newTileCoord && newTileCoord.r === r && newTileCoord.c === c) {
          cell.classList.add('tile-new');
        }
      }

      boardEl.insertBefore(cell, modalEl);
    }
  }

  scoreEl.innerText = score;
  if (score > bestScore) {
    bestScore = score;
    bestScoreEl.innerText = bestScore;
    localStorage.setItem('gamecloud_2048_best', bestScore);
  }
}

// Slide & merge row
function slide(row) {
  let arr = row.filter(val => val !== 0);
  let mergedScore = 0;

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      mergedScore += arr[i];
      arr[i + 1] = 0;
      if (arr[i] === 2048 && !hasWon && !keepPlaying) {
        hasWon = true;
      }
    }
  }

  arr = arr.filter(val => val !== 0);
  while (arr.length < SIZE) {
    arr.push(0);
  }

  return { row: arr, scoreGained: mergedScore };
}

function move(direction) {
  if (gameOver) return;

  let moved = false;
  let totalGained = 0;
  const oldGrid = JSON.stringify(grid);

  if (direction === 'LEFT') {
    for (let r = 0; r < SIZE; r++) {
      const { row, scoreGained } = slide(grid[r]);
      grid[r] = row;
      totalGained += scoreGained;
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < SIZE; r++) {
      const { row, scoreGained } = slide(grid[r].slice().reverse());
      grid[r] = row.reverse();
      totalGained += scoreGained;
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < SIZE; c++) {
      let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
      const { row, scoreGained } = slide(col);
      for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
      totalGained += scoreGained;
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < SIZE; c++) {
      let col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
      const { row, scoreGained } = slide(col);
      row.reverse();
      for (let r = 0; r < SIZE; r++) grid[r][c] = row[r];
      totalGained += scoreGained;
    }
  }

  if (oldGrid !== JSON.stringify(grid)) {
    moved = true;
    score += totalGained;
    if (totalGained > 0) {
      sfx.playMerge();
    } else {
      sfx.playMove();
    }

    const newTile = spawnRandomTile();
    renderGrid(newTile);

    // Check Win
    if (hasWon && !keepPlaying) {
      showWinModal();
    } else if (checkGameOver()) {
      showGameOverModal();
    }
  }
}

function checkGameOver() {
  // Check empty cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return false;
    }
  }
  // Check adjacent equal cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = grid[r][c];
      if (r < SIZE - 1 && grid[r + 1][c] === val) return false;
      if (c < SIZE - 1 && grid[r][c + 1] === val) return false;
    }
  }
  return true;
}

function showWinModal() {
  sfx.playWin();
  modalTitleEl.innerText = 'YOU REACHED 2048!';
  modalTitleEl.className = 'modal-title win';
  modalDescEl.innerText = `Sensational! Final Score: ${score}`;
  modalActionBtn.innerText = 'NEW GAME';
  keepGoingBtn.style.display = 'inline-block';
  modalEl.classList.add('active');
}

function showGameOverModal() {
  gameOver = true;
  sfx.playGameOver();
  modalTitleEl.innerText = 'GAME OVER';
  modalTitleEl.className = 'modal-title lose';
  modalDescEl.innerText = `No more valid moves! Final Score: ${score}`;
  modalActionBtn.innerText = 'TRY AGAIN';
  keepGoingBtn.style.display = 'none';
  modalEl.classList.add('active');
}

// Event Listeners
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'ArrowUp':
    case 'KeyW':
      e.preventDefault();
      move('UP');
      break;
    case 'ArrowDown':
    case 'KeyS':
      e.preventDefault();
      move('DOWN');
      break;
    case 'ArrowLeft':
    case 'KeyA':
      e.preventDefault();
      move('LEFT');
      break;
    case 'ArrowRight':
    case 'KeyD':
      e.preventDefault();
      move('RIGHT');
      break;
    case 'KeyR':
      initGame();
      break;
  }
});

// Swipe detection for touch / trackpads
let touchStartX = 0;
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (!touchStartX || !touchStartY) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 30) {
      if (dx > 0) move('RIGHT');
      else move('LEFT');
    }
  } else {
    if (Math.abs(dy) > 30) {
      if (dy > 0) move('DOWN');
      else move('UP');
    }
  }
  touchStartX = 0;
  touchStartY = 0;
}, { passive: true });

document.getElementById('btn-new-game').addEventListener('click', initGame);
modalActionBtn.addEventListener('click', initGame);
keepGoingBtn.addEventListener('click', () => {
  keepPlaying = true;
  modalEl.classList.remove('active');
});

// Start game
initGame();
