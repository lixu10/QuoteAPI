import { BaseModel } from './BaseModel.js';

export class Endpoint extends BaseModel {
  constructor() {
    super('endpoints');
  }

  findByName(name) {
    const stmt = this.db.prepare('SELECT * FROM endpoints WHERE name = ?');
    return stmt.get(name);
  }

  findByUserId(userId) {
    const stmt = this.db.prepare('SELECT * FROM endpoints WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  }

  createEndpoint(name, userId, description, code, visibility = 'public') {
    return this.create({
      name,
      user_id: userId,
      description,
      code,
      visibility,
      is_active: 1,
      call_count: 0
    });
  }

  updateEndpoint(id, data) {
    // 使用东八区时间（UTC+8）
    const now = new Date();
    const chinaTime = new Date(now.getTime() + (8 * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));

    const updateData = {
      ...data,
      updated_at: chinaTime.toISOString()
    };
    return this.update(id, updateData);
  }

  incrementCallCount(id) {
    const stmt = this.db.prepare('UPDATE endpoints SET call_count = call_count + 1 WHERE id = ?');
    return stmt.run(id);
  }

  toggleActive(id) {
    const endpoint = this.findById(id);
    if (!endpoint) return null;

    const stmt = this.db.prepare('UPDATE endpoints SET is_active = ? WHERE id = ?');
    return stmt.run(endpoint.is_active ? 0 : 1, id);
  }
}
