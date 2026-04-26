const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'data.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS task_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_id TEXT NOT NULL,
    date TEXT NOT NULL,
    completed_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, task_id, date)
  );

  CREATE TABLE IF NOT EXISTS prize_redemptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    prize_id TEXT NOT NULL,
    redeemed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, prize_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS eco_problems (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    photo_data TEXT,
    reporter_id INTEGER NOT NULL,
    reporter_username TEXT NOT NULL,
    claimer_id INTEGER,
    claimer_username TEXT,
    resolver_id INTEGER,
    resolver_username TEXT,
    status TEXT NOT NULL DEFAULT 'reported',
    created_at TEXT DEFAULT (datetime('now')),
    claimed_at TEXT,
    resolved_at TEXT,
    FOREIGN KEY (reporter_id) REFERENCES users(id)
  );
`);

try { db.exec(`ALTER TABLE eco_problems ADD COLUMN resolution_photo TEXT`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE eco_problems ADD COLUMN lat REAL`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE eco_problems ADD COLUMN lng REAL`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE users ADD COLUMN is_private INTEGER DEFAULT 0`); } catch { /* exists */ }
try { db.exec(`ALTER TABLE users ADD COLUMN phone_number TEXT`); } catch { /* exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS followers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    follower_id INTEGER NOT NULL,
    following_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(follower_id, following_id),
    FOREIGN KEY (follower_id) REFERENCES users(id),
    FOREIGN KEY (following_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    actor_id INTEGER,
    actor_username TEXT,
    ref_id INTEGER,
    data TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);
try { db.exec(`ALTER TABLE followers ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`); } catch { /* exists */ }

db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    photo_data TEXT,
    leaf_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS post_leaves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );

  CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (post_id) REFERENCES posts(id)
  );
`);

module.exports = db;
