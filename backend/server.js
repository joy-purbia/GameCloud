const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local development to allow embedded Three.js/Canvas iframes
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve static assets if any
app.use('/assets', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

// Thumbnail Generator dev helper
const fs = require('fs');
app.post('/api/dev/save-thumbnail', (req, res) => {
  try {
    const { name, jpgData, pngData } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const thumbDir = path.resolve(__dirname, '../frontend/public/images/thumbnails');
    if (jpgData) {
      const base64Data = jpgData.replace(/^data:image\/jpeg;base64,/, '');
      fs.writeFileSync(path.join(thumbDir, `${name}.jpg`), base64Data, 'base64');
    }
    if (pngData) {
      const base64Data = pngData.replace(/^data:image\/png;base64,/, '');
      fs.writeFileSync(path.join(thumbDir, `${name}.png`), base64Data, 'base64');
    }
    res.json({ success: true, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Root fallback
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to GameCloud API Server',
    docs: '/api/health',
    version: '1.0.0'
  });
});

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 GameCloud Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Game API:     http://localhost:${PORT}/api/games`);
  console.log(`====================================================`);
});

module.exports = { app, server };
