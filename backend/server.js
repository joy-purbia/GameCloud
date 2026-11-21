const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment config
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5055;

// Security and middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allows embedded Three.js / Canvas WebGL games in iframes
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true, // Allow same-origin and development cross-origin
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve backend static assets if any
app.use('/assets', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/users', userRoutes);

// Production Static Frontend Serving
const distPath = path.resolve(__dirname, '../frontend/dist');
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  console.log(`[Static] Serving frontend from ${distPath}`);
  app.use(express.static(distPath));

  // SPA fallback: Return index.html for any client navigation route that is not /api
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development fallback when dist is not built
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to GameCloud API Server',
      docs: '/api/health',
      version: '1.0.0',
      status: 'healthy'
    });
  });
}

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 GameCloud Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🎮 Game API:     http://localhost:${PORT}/api/games`);
  if (hasDist) {
    console.log(`🌐 Web UI:       http://localhost:${PORT}`);
  }
  console.log(`====================================================`);
});

module.exports = { app, server };
