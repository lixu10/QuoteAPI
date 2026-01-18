import dbManager from '../config/database.js';

export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  get db() {
    return dbManager.getDb();
  }

  findById(id) {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName} WHERE id = ?`);
    return stmt.get(id);
  }

  findAll() {
    const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
    return stmt.all();
  }

  create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`
    );
    const result = stmt.run(...values);
    return result.lastInsertRowid;
  }

  update(id, data) {
    // 过滤掉 undefined 和 null 的字段
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    if (Object.keys(filteredData).length === 0) {
      return { changes: 0 };
    }

    const keys = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`
    );
    return stmt.run(...values, id);
  }

  delete(id) {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    return stmt.run(id);
  }
}
