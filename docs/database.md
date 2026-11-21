# GameCloud — Database Specification

## 1. Overview

Database Engine: **MySQL 8.0**  
Character Set: `utf8mb4`  
Collation: `utf8mb4_unicode_ci`  
Database Name: `gamecloud`

---

## 2. Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ favourites : saves
    users ||--o{ game_sessions : plays
    users ||--o{ play_history : records
    games ||--o{ favourites : receives
    games ||--o{ game_sessions : hosts
    games ||--o{ play_history : tracked_in
    categories ||--o{ games : categorizes

    users {
        int id PK
        string username UK
        string email UK
        string password_hash
        enum role
        timestamp created_at
    }

    categories {
        int id PK
        string name UK
        string slug UK
        text description
        timestamp created_at
    }

    games {
        int id PK
        string name
        string slug UK
        text description
        string genre
        string thumbnail
        string icon
        string color
        string launch_type
        string launch_url
        enum status
        json controls
        timestamp created_at
        timestamp updated_at
    }

    favourites {
        int id PK
        int user_id FK
        int game_id FK
        timestamp created_at
    }

    game_sessions {
        string session_id PK
        int user_id FK
        int game_id FK
        enum status
        string execution_type
        string container_id
        timestamp started_at
        timestamp stopped_at
        int duration_seconds
    }

    play_history {
        int id PK
        int user_id FK
        int game_id FK
        timestamp last_played_at
        int total_play_time_seconds
    }
```

---

## 3. Table Details

1. **`users`**:
   - Stores user credentials, email, and platform role (`user` or `admin`).
2. **`categories`**:
   - Stores game genres (Racing, Puzzle, Action, Sandbox, Arcade).
3. **`games`**:
   - Stores game metadata, launch type (`browser_canvas`, `browser_webgl`, `browser_wasm`, `remote_container`), launch URL, availability status (`playable`, `coming_soon`, `experimental`), and keyboard controls JSON.
4. **`favourites`**:
   - Relates user IDs to game IDs with a unique constraint `(user_id, game_id)`.
5. **`game_sessions`**:
   - Primary key is a unique session token (`sess_<timestamp>_<random>`). Tracks start timestamp, stop timestamp, and duration.
6. **`play_history`**:
   - Aggregates total play time per game per user, updating on session conclusion.
