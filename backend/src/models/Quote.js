import { BaseModel } from './BaseModel.js';

export class Quote extends BaseModel {
  constructor() {
    super('quotes');
  }

  findByRepositoryId(repositoryId) {
    const stmt = this.db.prepare('SELECT * FROM quotes WHERE repository_id = ?');
    return stmt.all(repositoryId);
  }

  createQuote(repositoryId, content) {
    return this.create({ repository_id: repositoryId, content });
  }

  incrementUsageCount(id) {
    const stmt = this.db.prepare(
      'UPDATE quotes SET usage_count = usage_count + 1 WHERE id = ?'
    );
    return stmt.run(id);
  }

  incrementPageViews(id) {
    const stmt = this.db.prepare(
      'UPDATE quotes SET page_views = page_views + 1 WHERE id = ?'
    );
    return stmt.run(id);
  }

  getRandomByRepositoryId(repositoryId) {
    const stmt = this.db.prepare(
      'SELECT * FROM quotes WHERE repository_id = ? ORDER BY RANDOM() LIMIT 1'
    );
    return stmt.get(repositoryId);
  }

  getRandomByRepoName(repoName) {
    const stmt = this.db.prepare(`
      SELECT q.* FROM quotes q
      INNER JOIN repositories r ON q.repository_id = r.id
      WHERE r.name = ?
      ORDER BY RANDOM() LIMIT 1
    `);
    return stmt.get(repoName);
  }
}
