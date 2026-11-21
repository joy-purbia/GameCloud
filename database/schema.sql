-- ===================================================
-- GameCloud Platform - Database Schema (MySQL 8.0+)
-- ===================================================

CREATE DATABASE IF NOT EXISTS gamecloud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE gamecloud;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. GAMES TABLE
CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  genre VARCHAR(50) NOT NULL,
  thumbnail VARCHAR(255),
  icon VARCHAR(255),
  color VARCHAR(50) DEFAULT '#06b6d4',
  launch_type VARCHAR(50) DEFAULT 'browser_webgl',
  launch_url VARCHAR(255) NOT NULL,
  status ENUM('playable', 'coming_soon', 'experimental') DEFAULT 'playable',
  controls JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. FAVOURITES TABLE
CREATE TABLE IF NOT EXISTS favourites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_fav (user_id, game_id)
) ENGINE=InnoDB;

-- 5. GAME SESSIONS TABLE
CREATE TABLE IF NOT EXISTS game_sessions (
  session_id VARCHAR(64) PRIMARY KEY,
  user_id INT NULL,
  game_id INT NOT NULL,
  status ENUM('active', 'ended', 'crashed') DEFAULT 'active',
  execution_type VARCHAR(50) DEFAULT 'browser',
  container_id VARCHAR(100) NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  stopped_at TIMESTAMP NULL,
  duration_seconds INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. PLAY HISTORY TABLE
CREATE TABLE IF NOT EXISTS play_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  last_played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_play_time_seconds INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_history (user_id, game_id)
) ENGINE=InnoDB;

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_genre ON games(genre);
CREATE INDEX idx_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_history_user ON play_history(user_id);
