import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import config from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DatabaseManager {
  constructor() {
    this.db = null;
  }

  async initialize() {
    const dbDir = dirname(config.dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(config.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.createTables();
    await this.initDefaultAdmin();
  }

  createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS repositories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        description TEXT,
        api_calls INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        repository_id INTEGER,
        quote_id INTEGER,
        referer TEXT,
        ip_address TEXT,
        user_agent TEXT,
        accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories(id) ON DELETE CASCADE,
        FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_repos_user ON repositories(user_id);
      CREATE INDEX IF NOT EXISTS idx_quotes_repo ON quotes(repository_id);
      CREATE INDEX IF NOT EXISTS idx_logs_repo ON access_logs(repository_id);
      CREATE INDEX IF NOT EXISTS idx_logs_ip ON access_logs(ip_address);
      CREATE INDEX IF NOT EXISTS idx_logs_time ON access_logs(accessed_at);
    `);
  }

  async initDefaultAdmin() {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?');
    const result = stmt.get('admin');

    if (result.count === 0) {
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.default.hash('admin', 10);
      const insert = this.db.prepare(
        'INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)'
      );
      insert.run('admin', hashedPassword);
      console.log('Default admin user created');
    }
  }

  getDb() {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default new DatabaseManager();
