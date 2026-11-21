# GameCloud — REST API Reference

Base URL: `http://localhost:5055/api` (proxied via Vite frontend at `/api`)

---

## 1. Health

### `GET /api/health`
Returns system status, MySQL connectivity, and server uptime.

**Response (200 OK):**
```json
{
  "status": "ok",
  "platform": "GameCloud Localhost Gaming Platform",
  "timestamp": "2026-11-21T11:04:24.000Z",
  "uptimeSeconds": 12,
  "database": {
    "type": "MySQL 8.0",
    "status": "connected"
  },
  "version": "1.0.0"
}
```

---

## 2. Authentication

### `POST /api/auth/register`
Creates a new user account.
- **Request Body**: `{ "username": "pilot1", "email": "pilot1@example.com", "password": "Password123" }`
- **Response (201 Created)**: Returns `{ token, user }`.

### `POST /api/auth/login`
Authenticates user by username or email.
- **Request Body**: `{ "identifier": "admin", "password": "Joy@2006" }`
- **Response (200 OK)**: Returns `{ token, user }`.

### `GET /api/auth/me`
*Requires `Authorization: Bearer <token>`*  
Returns logged in user details, role, and gaming statistics.

---

## 3. Games Catalogue

### `GET /api/games`
Query parameters:
- `search`: Case-insensitive substring match on name/description.
- `genre`: Filter by category (e.g. `Racing`, `Puzzle`).
- `status`: Filter by status (`playable`, `coming_soon`, `experimental`).
- `sort`: `popular`, `newest`, `name_asc`, `name_desc`.

### `GET /api/games/:idOrSlug`
Returns single game metadata with keyboard controls and play statistics.

### `GET /api/games/categories`
Returns list of genres with game counts.

### `POST /api/games` *(Admin Only)*
Creates a new game entry in catalogue.

### `PUT /api/games/:id` *(Admin Only)*
Updates game details, status, or controls mapping.

### `DELETE /api/games/:id` *(Admin Only)*
Deletes game entry from database.

---

## 4. Sessions & Play Tracking

### `POST /api/sessions`
Initializes a new game session.
- **Request Body**: `{ "gameId": 1, "executionType": "browser" }`
- **Response (201 Created)**: `{ sessionId: "sess_...", status: "active" }`

### `PATCH /api/sessions/:id/stop`
Concludes a game session and records duration.
- **Request Body**: `{ "durationSeconds": 180 }`
- **Response (200 OK)**: `{ sessionId: "sess_...", durationSeconds: 180, status: "ended" }`

### `GET /api/sessions` *(Authenticated User)*
Returns user's recent sessions.

### `GET /api/sessions/all` *(Admin Only)*
Returns platform-wide session logs.

---

## 5. User Profile & Favourites

### `GET /api/users/profile`
Returns aggregate statistics for the authenticated user.

### `GET /api/users/favourites`
Returns list of games bookmarked by user.

### `POST /api/users/favourites`
- **Request Body**: `{ "gameId": 1 }`

### `DELETE /api/users/favourites/:gameId`
Removes game from favourites.

### `GET /api/users/history`
Returns user's play history ordered by most recent.

### `GET /api/users/all` *(Admin Only)*
Returns registered user list with play metrics.
