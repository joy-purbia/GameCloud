# GameCloud — Installation & Localhost Setup Guide

This guide describes how to run GameCloud from scratch on Windows localhost.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18+ (tested on Node.js v22.18)
- **npm**: v9+ (tested on npm 10.9)
- **MySQL**: 8.0+ running on `localhost:3306`

---

## 2. Fast Automated Setup

From the root project directory (`E:\GameCloud`):

```bash
# 1. Install all dependencies across root, backend, and frontend
npm run install:all

# 2. Run automated MySQL database migrations and seeding
npm run setup:db
```

This will automatically:
- Connect to your local MySQL on port 3306.
- Create the `gamecloud` database.
- Execute all tables (`users`, `games`, `categories`, `favourites`, `game_sessions`, `play_history`).
- Seed initial users (`admin` / `Joy@2006`, `player1` / `Joy@2006`).
- Seed 6 catalogue games including **Neon Racer 3D** and **2048**.

---

## 3. Starting the Platform

To start both the Express backend and the Vite frontend simultaneously:

```bash
npm run dev
# or
npm start
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5055/api](http://localhost:5055/api)
- **Health Check**: [http://localhost:5055/api/health](http://localhost:5055/api/health)

---

## 4. Running Verification Test Suite

To verify all database queries, API endpoints, authentication, session recording, and frontend builds:

```bash
node test-platform.js
```
Expected output: `16 / 16 Tests Passed (100%)`.
