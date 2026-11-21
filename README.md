# GameCloud — Browser-Based Cloud Gaming Platform

GameCloud is a centralized web-based gaming platform developed from scratch for Windows localhost. It allows users to browse, search, and launch browser games instantly without downloading or installing individual clients.

---

## 🌟 Key Features

- **Mode 1: Browser-Based Execution**:
  - **Neon Racer 3D**: High-speed synthwave racing game developed from scratch using **Three.js** and **WebGL**, featuring procedural highways, vehicle acceleration/braking/drifting, obstacle collision, sound synthesizer (Web Audio API), and responsive viewport.
  - **2048 Cyber Grid**: Complete 4x4 sliding puzzle game built with custom cyberpunk styling, swipe/arrow key detection, sound effects, and persistent high score.
- **RESTful Backend API**:
  - Modular Express.js architecture with JWT authentication, bcrypt hashing, and role-based permissions (`admin` / `user`).
  - Active game session lifecycle management (`/api/sessions`) recording start/stop timestamps and duration into MySQL.
  - Play history and favourites synchronization.
- **Relational MySQL Database**:
  - Fully normalized schema (`users`, `games`, `categories`, `favourites`, `game_sessions`, `play_history`).
  - One-command automated database migration and seeding runner.
- **Modern AMOLED Cyberpunk UI**:
  - Dark AMOLED aesthetics (`#07090e`), neon cyan and purple glows, responsive grid layouts, and glassmorphism headers.
  - Dedicated pages: Home, Game Library with search and multi-criteria filters, Game Details with controls mapping, Game Player viewport, User Dashboard, and Admin Control Panel.
- **Transparent Catalogue Labelling**:
  - Clear availability badges (`Playable`, `Coming Soon`, `Experimental`). No fake play buttons or misleading claims.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Three.js 0.164, Lucide React, React Router 6.
- **Backend**: Node.js v22, Express.js 4, `mysql2/promise`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `morgan`.
- **Database**: MySQL Server 8.0 on `localhost:3306`.
- **Audio**: Web Audio API (Synthesizers).

---

## 🚀 Quick Start (Localhost)

### 1. Prerequisites
Ensure MySQL 8.0 is running on port 3306.

### 2. Install & Setup Database
```bash
# Install root, backend, and frontend packages
npm run install:all

# Create MySQL database and seed games & admin
npm run setup:db
```

### 3. Run Application
```bash
npm run dev
```

- **Website Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5055/api](http://localhost:5055/api)
- **Health Check**: [http://localhost:5055/api/health](http://localhost:5055/api/health)

### 4. Default Credentials
| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` / `admin@gamecloud.local` | `Joy@2006` |
| **Demo Player** | `player1` / `player1@gamecloud.local` | `Joy@2006` |

---

## 🧪 Automated Verification Suite

Run the full end-to-end integration and API test suite:
```bash
node test-platform.js
```
Verifies 16 critical subsystems:
- MySQL connection and health endpoint.
- Games catalogue seeding and status flags.
- Admin login, JWT issuance, and role authentication.
- User registration and password hashing.
- Game session initialization and duration calculation.
- Play history and favourites sync.
- Presence of Three.js modules and game assets.
- Production build validation.

---

## 📁 Project Structure

```text
E:\GameCloud\
│
├── frontend/
│   ├── public/
│   │   ├── games/
│   │   │   ├── neon-racer/    # 3D Three.js WebGL Racing Game
│   │   │   │   ├── index.html
│   │   │   │   ├── game.js
│   │   │   │   ├── style.css
│   │   │   │   └── three.module.js
│   │   │   └── 2048/          # 2048 Cyber Grid Puzzle Game
│   │   │       ├── index.html
│   │   │       ├── game.js
│   │   │       └── style.css
│   │   ├── images/thumbnails/ # High-res game artwork
│   │   └── logo.svg           # Platform branding
│   ├── src/
│   │   ├── components/        # Navbar, Footer, GameCard, GamePlayer, ProtectedRoute
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Home, Library, Details, Play, Dashboard, Admin, Login, Register
│   │   ├── services/          # Centralized API fetch wrapper
│   │   ├── styles/            # Tailwind and Cyberpunk CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── config/                # MySQL connection pool
│   ├── controllers/           # Auth, Games, Sessions, Users
│   ├── middleware/            # JWT auth, role guard, error handler
│   ├── routes/                # Express API routes
│   ├── server.js              # Express server on port 5055
│   ├── .env                   # Local configuration
│   └── package.json
│
├── database/
│   ├── seeds/                 # 001_seed_data.sql
│   ├── schema.sql             # MySQL DDL schema
│   └── setup.js               # Automated migration and seeding script
│
├── docs/                      # Technical Documentation
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   ├── installation.md
│   ├── game-integration.md
│   └── webrtc.md
│
├── test-platform.js           # 16-point automated verification test suite
├── package.json               # Root workspace script runner
├── .gitignore
└── README.md
```

---

## 📜 Documentation Directory
- [Architecture Blueprint](file:///E:/GameCloud/docs/architecture.md)
- [Database Schema & ERD](file:///E:/GameCloud/docs/database.md)
- [REST API Reference](file:///E:/GameCloud/docs/api.md)
- [Game Integration & Feasibility](file:///E:/GameCloud/docs/game-integration.md)
- [WebRTC Streaming Blueprint](file:///E:/GameCloud/docs/webrtc.md)
- [Installation Guide](file:///E:/GameCloud/docs/installation.md)
