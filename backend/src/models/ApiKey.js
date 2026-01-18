import dbManager from '../config/database.js';
import crypto from 'crypto';

class ApiKey {
  generateKey() {
    // 生成 32 字节的随机密钥，转换为 base64
    return 'qak_' + crypto.randomBytes(32).toString('base64url');
  }

  create(userId, name = null) {
    const db = dbManager.getDb();
    const keyValue = this.generateKey();
    const stmt = db.prepare(
      'INSERT INTO api_keys (user_id, key_value, name) VALUES (?, ?, ?)'
    );
    const result = stmt.run(userId, keyValue, name);
    return {
      id: result.lastInsertRowid,
      user_id: userId,
      key_value: keyValue,
      name,
      is_active: 1,
      created_at: new Date().toISOString()
    };
  }

  getByUserId(userId) {
    const db = dbManager.getDb();
    const stmt = db.prepare(
      `SELECT id, user_id, key_value, name, is_active, last_used_at, created_at
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`
    );
    return stmt.all(userId);
  }

  getByKeyValue(keyValue) {
    const db = dbManager.getDb();
    const stmt = db.prepare(
      `SELECT ak.*, u.username, u.is_admin
       FROM api_keys ak
       JOIN users u ON ak.user_id = u.id
       WHERE ak.key_value = ? AND ak.is_active = 1`
    );
    return stmt.get(keyValue);
  }

  getById(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare(
      'SELECT * FROM api_keys WHERE id = ?'
    );
    return stmt.get(id);
  }

  updateLastUsed(id) {
    const db = dbManager.getDb();
    const stmt = db.prepare(
      'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(id);
  }

  toggleActive(id, userId) {
    const db = dbManager.getDb();
    const key = this.getById(id);
    if (!key || key.user_id !== userId) {
      return null;
    }
    const newStatus = key.is_active ? 0 : 1;
    const stmt = db.prepare(
      'UPDATE api_keys SET is_active = ? WHERE id = ?'
    );
    stmt.run(newStatus, id);
    return { ...key, is_active: newStatus };
  }

  delete(id, userId) {
    const db = dbManager.getDb();
    const key = this.getById(id);
    if (!key || key.user_id !== userId) {
      return false;
    }
    const stmt = db.prepare('DELETE FROM api_keys WHERE id = ?');
    stmt.run(id);
    return true;
  }

  rename(id, userId, newName) {
    const db = dbManager.getDb();
    const key = this.getById(id);
    if (!key || key.user_id !== userId) {
      return null;
    }
    const stmt = db.prepare(
      'UPDATE api_keys SET name = ? WHERE id = ?'
    );
    stmt.run(newName, id);
    return { ...key, name: newName };
  }

  // 验证 API KEY 并返回用户信息
  validate(keyValue) {
    const keyInfo = this.getByKeyValue(keyValue);
    if (keyInfo) {
      this.updateLastUsed(keyInfo.id);
      return {
        userId: keyInfo.user_id,
        username: keyInfo.username,
        isAdmin: keyInfo.is_admin === 1,
        keyId: keyInfo.id
      };
    }
    return null;
  }
}

export default new ApiKey();
