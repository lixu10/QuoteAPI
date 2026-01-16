import { Quote } from '../models/Quote.js';
import { Repository } from '../models/Repository.js';

export class QuoteService {
  constructor() {
    this.quoteModel = new Quote();
    this.repoModel = new Repository();
  }

  createQuote(repositoryId, userId, content) {
    const repo = this.repoModel.findById(repositoryId);
    if (!repo) {
      throw new Error('仓库不存在');
    }
    if (repo.user_id !== userId) {
      throw new Error('无权限向此仓库添加语句');
    }
    return this.quoteModel.createQuote(repositoryId, content);
  }

  getQuotesByRepository(repositoryId) {
    return this.quoteModel.findByRepositoryId(repositoryId);
  }

  getQuoteById(id) {
    return this.quoteModel.findById(id);
  }

  updateQuote(id, userId, content) {
    const quote = this.quoteModel.findById(id);
    if (!quote) {
      throw new Error('语句不存在');
    }
    const repo = this.repoModel.findById(quote.repository_id);
    if (repo.user_id !== userId) {
      throw new Error('无权限修改此语句');
    }
    return this.quoteModel.update(id, { content });
  }

  deleteQuote(id, userId) {
    const quote = this.quoteModel.findById(id);
    if (!quote) {
      throw new Error('语句不存在');
    }
    const repo = this.repoModel.findById(quote.repository_id);
    if (repo.user_id !== userId) {
      throw new Error('无权限删除此语句');
    }
    return this.quoteModel.delete(id);
  }
}
