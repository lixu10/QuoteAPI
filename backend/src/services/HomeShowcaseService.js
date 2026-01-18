import { HomeShowcase } from '../models/HomeShowcase.js';
import { Repository } from '../models/Repository.js';
import { Quote } from '../models/Quote.js';
import { Endpoint } from '../models/Endpoint.js';
import { EndpointService } from './EndpointService.js';

export class HomeShowcaseService {
  constructor() {
    this.showcaseModel = new HomeShowcase();
    this.repoModel = new Repository();
    this.quoteModel = new Quote();
    this.endpointModel = new Endpoint();
    this.endpointService = new EndpointService();
  }

  // 获取当前展示配置
  getShowcaseConfig() {
    return this.showcaseModel.getActiveShowcase();
  }

  // 获取所有配置
  getAllConfigs() {
    return this.showcaseModel.getAll();
  }

  // 设置展示配置
  setShowcase(sourceType, sourceName) {
    let sourceId = null;

    if (sourceType === 'repository') {
      const repo = this.repoModel.findByName(sourceName);
      if (!repo) {
        throw new Error('仓库不存在');
      }
      sourceId = repo.id;
    } else if (sourceType === 'endpoint') {
      const endpoint = this.endpointModel.findByName(sourceName);
      if (!endpoint) {
        throw new Error('端口不存在');
      }
      if (!endpoint.is_active) {
        throw new Error('端口未启用');
      }
      sourceId = endpoint.id;
    } else {
      throw new Error('无效的来源类型');
    }

    return this.showcaseModel.setShowcase(sourceType, sourceId, sourceName);
  }

  // 清除展示
  clearShowcase() {
    return this.showcaseModel.clearShowcase();
  }

  // 获取展示数据（公开API）
  async getShowcaseData(requestData = {}) {
    const config = this.showcaseModel.getActiveShowcase();

    if (!config) {
      return {
        hasShowcase: false,
        content: null
      };
    }

    try {
      if (config.source_type === 'repository') {
        // 从仓库获取随机语句
        const quote = this.quoteModel.getRandomByRepoName(config.source_name);
        if (quote) {
          return {
            hasShowcase: true,
            sourceType: 'repository',
            sourceName: config.source_name,
            content: quote.content,
            quoteId: quote.id
          };
        }
      } else if (config.source_type === 'endpoint') {
        // 执行端点获取数据
        const result = await this.endpointService.executeEndpoint(config.source_name, requestData);
        return {
          hasShowcase: true,
          sourceType: 'endpoint',
          sourceName: config.source_name,
          content: result.content || result.text || JSON.stringify(result),
          data: result
        };
      }
    } catch (error) {
      console.error('获取展示数据失败:', error);
      return {
        hasShowcase: true,
        sourceType: config.source_type,
        sourceName: config.source_name,
        content: null,
        error: error.message
      };
    }

    return {
      hasShowcase: false,
      content: null
    };
  }

  // 获取可用的仓库列表
  getAvailableRepositories() {
    const repos = this.repoModel.findAll();
    return repos.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description
    }));
  }

  // 获取可用的端口列表
  getAvailableEndpoints() {
    const endpoints = this.endpointModel.findAll();
    return endpoints
      .filter(e => e.is_active)
      .map(e => ({
        id: e.id,
        name: e.name,
        description: e.description
      }));
  }
}
