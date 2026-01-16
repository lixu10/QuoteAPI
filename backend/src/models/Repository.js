import { BaseModel } from './BaseModel.js';

export class Repository extends BaseModel {
  constructor() {
    super('repositories');
  }

  findByName(name) {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE name = ?');
    return stmt.get(name);
  }

  findByUserId(userId) {
    const stmt = this.db.prepare('SELECT * FROM repositories WHERE user_id = ?');
    return stmt.all(userId);
  }

  createRepository(name, userId, description = '') {
    return this.create({ name, user_id: userId, description });
  }

  incrementApiCalls(id) {
    const stmt = this.db.prepare(
      'UPDATE repositories SET api_calls = api_calls + 1 WHERE id = ?'
    );
    return stmt.run(id);
  }

  getWithStats(id) {
    const stmt = this.db.prepare(`
      SELECT r.*, u.username,
             COUNT(DISTINCT q.id) as quote_count
      FROM repositories r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quotes q ON r.id = q.repository_id
      WHERE r.id = ?
      GROUP BY r.id
    `);
    return stmt.get(id);
  }
}
