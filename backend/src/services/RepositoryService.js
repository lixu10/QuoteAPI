import { Repository } from '../models/Repository.js';
import { Quote } from '../models/Quote.js';

export class RepositoryService {
  constructor() {
    this.repoModel = new Repository();
    this.quoteModel = new Quote();
  }

  createRepository(name, userId, description) {
    const existing = this.repoModel.findByName(name);
    if (existing) {
      throw new Error('仓库名已存在');
    }
    return this.repoModel.createRepository(name, userId, description);
  }

  getUserRepositories(userId) {
    return this.repoModel.findByUserId(userId);
  }

  getRepositoryByName(name) {
    return this.repoModel.findByName(name);
  }

  getRepositoryWithStats(id) {
    return this.repoModel.getWithStats(id);
  }

  updateRepository(id, userId, data) {
    const repo = this.repoModel.findById(id);
    if (!repo) {
      throw new Error('仓库不存在');
    }
    if (repo.user_id !== userId) {
      throw new Error('无权限修改此仓库');
    }
    return this.repoModel.update(id, data);
  }

  deleteRepository(id, userId) {
    const repo = this.repoModel.findById(id);
    if (!repo) {
      throw new Error('仓库不存在');
    }
    if (repo.user_id !== userId) {
      throw new Error('无权限删除此仓库');
    }
    return this.repoModel.delete(id);
  }

  getAllRepositories() {
    return this.repoModel.findAll();
  }
}
