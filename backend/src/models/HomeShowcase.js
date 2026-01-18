import { BaseModel } from './BaseModel.js';

export class HomeShowcase extends BaseModel {
  constructor() {
    super('home_showcase');
  }

  // 获取当前激活的展示配置
  getActiveShowcase() {
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName} WHERE is_active = 1 LIMIT 1
    `);
    return stmt.get();
  }

  // 获取所有展示配置
  getAll() {
    const stmt = this.db.prepare(`
      SELECT * FROM ${this.tableName} ORDER BY created_at DESC
    `);
    return stmt.all();
  }

  // 设置新的展示配置（只保留一个激活的配置）
  setShowcase(sourceType, sourceId, sourceName) {
    // 先将所有配置设为不激活
    this.db.prepare(`UPDATE ${this.tableName} SET is_active = 0`).run();

    // 检查是否已有相同配置
    const existing = this.db.prepare(`
      SELECT id FROM ${this.tableName}
      WHERE source_type = ? AND source_name = ?
    `).get(sourceType, sourceName);

    if (existing) {
      // 更新现有配置
      this.db.prepare(`
        UPDATE ${this.tableName}
        SET is_active = 1, source_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(sourceId, existing.id);
      return existing.id;
    } else {
      // 创建新配置
      const result = this.db.prepare(`
        INSERT INTO ${this.tableName} (source_type, source_id, source_name, is_active)
        VALUES (?, ?, ?, 1)
      `).run(sourceType, sourceId, sourceName);
      return result.lastInsertRowid;
    }
  }

  // 清除展示配置
  clearShowcase() {
    this.db.prepare(`UPDATE ${this.tableName} SET is_active = 0`).run();
  }

  // 删除配置
  deleteShowcase(id) {
    this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`).run(id);
  }
}
