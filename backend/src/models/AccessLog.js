import { BaseModel } from './BaseModel.js';

export class AccessLog extends BaseModel {
  constructor() {
    super('access_logs');
  }

  createLog(repositoryId, quoteId, referer, ipAddress, userAgent) {
    return this.create({
      repository_id: repositoryId,
      quote_id: quoteId,
      referer,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  getLogsByRepository(repositoryId, limit = 100) {
    const stmt = this.db.prepare(`
      SELECT * FROM access_logs
      WHERE repository_id = ?
      ORDER BY accessed_at DESC
      LIMIT ?
    `);
    return stmt.all(repositoryId, limit);
  }

  getRefererStats(repositoryId) {
    const stmt = this.db.prepare(`
      SELECT referer, COUNT(*) as count
      FROM access_logs
      WHERE repository_id = ? AND referer IS NOT NULL
      GROUP BY referer
      ORDER BY count DESC
      LIMIT 10
    `);
    return stmt.all(repositoryId);
  }
}
