import { Quote } from '../models/Quote.js';
import { Repository } from '../models/Repository.js';
import { AccessLog } from '../models/AccessLog.js';

export class ApiService {
  constructor() {
    this.quoteModel = new Quote();
    this.repoModel = new Repository();
    this.logModel = new AccessLog();
  }

  getRandomQuote(repoName, referer, ipAddress, userAgent) {
    const repo = this.repoModel.findByName(repoName);
    if (!repo) {
      throw new Error('仓库不存在');
    }

    const quote = this.quoteModel.getRandomByRepositoryId(repo.id);
    if (!quote) {
      throw new Error('仓库中没有语句');
    }

    this.quoteModel.incrementUsageCount(quote.id);
    this.repoModel.incrementApiCalls(repo.id);
    this.logModel.createLog(repo.id, quote.id, referer, ipAddress, userAgent);

    return {
      content: quote.content,
      link: `/quote/${quote.id}`
    };
  }

  getQuoteDetails(id, ipAddress, userAgent) {
    const quote = this.quoteModel.findById(id);
    if (!quote) {
      throw new Error('语句不存在');
    }

    this.quoteModel.incrementPageViews(id);
    const repo = this.repoModel.findById(quote.repository_id);

    this.logModel.createLog(repo.id, quote.id, null, ipAddress, userAgent);

    return {
      ...quote,
      repository: repo
    };
  }

  getRepositoryStats(repoId) {
    const logs = this.logModel.getLogsByRepository(repoId);
    const refererStats = this.logModel.getRefererStats(repoId);

    return {
      logs,
      refererStats
    };
  }
}
