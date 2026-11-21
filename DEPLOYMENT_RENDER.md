# 🚀 Deploying GameCloud on Render (render.com)

This guide walks you through deploying **GameCloud** to [Render](https://render.com) completely **free of charge** (zero credit card required).

---

## 🏗️ Architecture Overview

GameCloud is configured as a **unified production service**:
- **Frontend + Games**: Vite compiles the React SPA and 6 WebGL / Canvas games into `frontend/dist`.
- **Backend**: Express serves the compiled frontend, all game assets, and the REST API (`/api/*`) on a single port.
- **Benefits**:
  - Fits 100% inside Render's **Free Web Service** tier.
  - Zero CORS configuration issues.
  - No cold-start desynchronization between frontend and backend.
  - All 6 games are bundled and immediately playable in any browser.

---

## ⚡ Option A: Fast Deploy with Blueprint (`render.yaml`)

1. **Push your code to GitHub**:
   Ensure your changes are committed and pushed to your GitHub repository:
   ```bash
   git push origin main
   ```

2. **Log into Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com) and log in with GitHub.

3. **Deploy Blueprint**:
   - Click **"Blueprints"** in the top navigation bar.
   - Click **"New Blueprint Instance"**.
   - Select your repository: `joy-purbia/GameCloud`.
   - Render will automatically detect `render.yaml`.
   - Click **"Apply"**.

4. Render will run:
   - Build: `npm run build:render`
   - Start: `npm run start:render`
   - Within 2-3 minutes, your live site URL will be ready (e.g., `https://gamecloud-xxxx.onrender.com`).

---

## 🛠️ Option B: Manual Web Service Setup

If you prefer to configure manually via the Render dashboard:

1. Click **"New +"** in the top right and select **"Web Service"**.
2. Connect your GitHub repository: `joy-purbia/GameCloud`.
3. Configure the service settings:
   - **Name**: `gamecloud`
   - **Region**: Any (e.g. `Oregon (US West)` or `Singapore`)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm run build:render`
   - **Start Command**: `npm run start:render`
   - **Instance Type**: `Free`
4. Expand **"Advanced"** and add Environment Variables:
   | Key | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production caching |
   | `PORT` | `10000` | Render default web service port |
   | `JWT_SECRET` | *(Random 32+ character string)* | Used to sign user login tokens |
   | `DB_SSL` | `true` | Required for secure cloud DB connections |
   | `DATABASE_URL` | *(Optional - see below)* | Cloud MySQL connection string |

5. Click **"Deploy Web Service"**.

---

## 🗄️ Database Setup (Free Forever Cloud MySQL)

Render provides free PostgreSQL, but GameCloud runs on standard MySQL. You can use any of the following **100% free cloud MySQL** providers:

### Recommended: TiDB Cloud Serverless (5GB Free Forever, No Credit Card)
1. Sign up for free at [tidbcloud.com](https://tidbcloud.com).
2. Click **Create Cluster** -> Select **Serverless** (Free 5GB).
3. Once created, click **Connect** -> Select **General** connection method.
4. Copy the connection string format:
   ```text
   mysql://<username>:<password>@<host>:4000/<database>?ssl={"rejectUnauthorized":true}
   ```
5. In Render -> Your GameCloud Service -> **Environment**:
   - Add/Edit `DATABASE_URL` and paste your TiDB connection URI.
   - Click **Save Changes**.

> 💡 **Auto-Migration Included**: When GameCloud starts with a valid `DATABASE_URL`, it automatically creates all tables (`users`, `games`, `categories`, `favourites`, `game_sessions`, `play_history`) and seeds the default admin (`admin` / `Joy@2006`) and catalogue. No manual SQL imports are required!

> 💡 **Demo / Offline Mode**: If you do not configure `DATABASE_URL`, GameCloud automatically starts in demo mode. All 6 browser games remain **100% playable** using client-side fallback data.

---

## 🎮 Verifying Your Live Deployment

Once Render finishes deploying:
1. Open your Render URL: `https://gamecloud-xxxx.onrender.com`.
2. Verify API Health: `https://gamecloud-xxxx.onrender.com/api/health` (should return `"status": "ok"`).
3. Check the games catalogue on the homepage and click **Play Now** on any game:
   - **Neon Racer** (3D WebGL Synthwave Racer)
   - **2048 Cyber Grid** (Canvas 4x4 Puzzle)
   - **HexGL** (3D WebGL 500+ km/h Hovercraft Racer)
   - **SuperTuxKart** (3D WebGL Arcade Kart Racer)
   - **Luanti** (3D WebGL Voxel Sandbox)
   - **OpenArena** (3D WebGL FPS Combat Arena)
4. If connected to MySQL:
   - Log in with `admin` / `Joy@2006` or `player1` / `Joy@2006` (or register a new user).
   - Play any game and visit the **Dashboard -> Play History** to see your recorded play sessions and duration.

---

## ⏱️ Render Free Tier Notes
- Render's free tier spins down inactive web services after 15 minutes of inactivity.
- When a user visits the URL after spin-down, Render automatically wakes up the service in ~40-50 seconds (cold start).
- Because GameCloud is served as a unified service, the frontend and API wake up together, preventing API disconnects.
