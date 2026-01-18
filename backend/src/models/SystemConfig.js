import dbManager from '../config/database.js';

export class SystemConfig {
  constructor() {
    this.db = null;
  }

  getDb() {
    if (!this.db) {
      this.db = dbManager.getDb();
    }
    return this.db;
  }

  // 获取配置值
  get(key) {
    const stmt = this.getDb().prepare('SELECT config_value FROM system_config WHERE config_key = ?');
    const row = stmt.get(key);
    return row ? row.config_value : null;
  }

  // 设置配置值
  set(key, value, description = null) {
    const stmt = this.getDb().prepare(`
      INSERT INTO system_config (config_key, config_value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(config_key) DO UPDATE SET
        config_value = excluded.config_value,
        description = COALESCE(excluded.description, description),
        updated_at = CURRENT_TIMESTAMP
    `);
    return stmt.run(key, value, description);
  }

  // 删除配置
  delete(key) {
    const stmt = this.getDb().prepare('DELETE FROM system_config WHERE config_key = ?');
    return stmt.run(key);
  }

  // 获取所有配置（可选按前缀筛选）
  getAll(prefix = null) {
    let stmt;
    if (prefix) {
      stmt = this.getDb().prepare('SELECT * FROM system_config WHERE config_key LIKE ? ORDER BY config_key');
      return stmt.all(`${prefix}%`);
    } else {
      stmt = this.getDb().prepare('SELECT * FROM system_config ORDER BY config_key');
      return stmt.all();
    }
  }

  // 获取 AI 配置
  getAiConfig() {
    return {
      apiUrl: this.get('ai_api_url') || '',
      apiKey: this.get('ai_api_key') || '',
      model: this.get('ai_model') || 'gpt-3.5-turbo'
    };
  }

  // 设置 AI 配置
  setAiConfig(apiUrl, apiKey, model) {
    this.set('ai_api_url', apiUrl, 'OpenAI API 地址');
    this.set('ai_api_key', apiKey, 'OpenAI API Key');
    this.set('ai_model', model, 'AI 模型名称');
  }

  // 检查 AI 是否已配置
  isAiConfigured() {
    const config = this.getAiConfig();
    return config.apiUrl && config.apiKey && config.model;
  }
}

export default new SystemConfig();
