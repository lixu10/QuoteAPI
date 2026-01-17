import { AccessLog } from '../models/AccessLog.js';

export class StatsService {
  constructor() {
    this.accessLogModel = new AccessLog();
  }

  // 获取仓库的访问统计汇总
  getRepositoryStats(repositoryId, days = 30) {
    const db = this.accessLogModel.db;

    // 总调用次数
    const totalCalls = db.prepare(
      'SELECT COUNT(*) as count FROM access_logs WHERE repository_id = ?'
    ).get(repositoryId);

    // 最近N天的调用次数
    const recentCalls = db.prepare(
      `SELECT COUNT(*) as count FROM access_logs
       WHERE repository_id = ?
       AND accessed_at >= datetime('now', '-' || ? || ' days')`
    ).get(repositoryId, days);

    // 独立IP数量
    const uniqueIps = db.prepare(
      `SELECT COUNT(DISTINCT ip_address) as count FROM access_logs
       WHERE repository_id = ?`
    ).get(repositoryId);

    // 最近N天独立IP
    const recentUniqueIps = db.prepare(
      `SELECT COUNT(DISTINCT ip_address) as count FROM access_logs
       WHERE repository_id = ?
       AND accessed_at >= datetime('now', '-' || ? || ' days')`
    ).get(repositoryId, days);

    return {
      totalCalls: totalCalls.count,
      recentCalls: recentCalls.count,
      uniqueIps: uniqueIps.count,
      recentUniqueIps: recentUniqueIps.count,
      days
    };
  }

  // 按IP统计访问次数（Top N）
  getTopIps(repositoryId, limit = 10) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT ip_address, COUNT(*) as count,
       MAX(accessed_at) as last_access
       FROM access_logs
       WHERE repository_id = ? AND ip_address IS NOT NULL
       GROUP BY ip_address
       ORDER BY count DESC
       LIMIT ?`
    ).all(repositoryId, limit);

    return result;
  }

  // 按来源网站统计（Referer）
  getTopReferers(repositoryId, limit = 10) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT
         CASE
           WHEN referer IS NULL OR referer = '' THEN '直接访问'
           ELSE referer
         END as referer,
         COUNT(*) as count
       FROM access_logs
       WHERE repository_id = ?
       GROUP BY referer
       ORDER BY count DESC
       LIMIT ?`
    ).all(repositoryId, limit);

    return result;
  }

  // 按日期统计访问趋势
  getDailyTrend(repositoryId, days = 7) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT
         DATE(accessed_at) as date,
         COUNT(*) as count,
         COUNT(DISTINCT ip_address) as unique_ips
       FROM access_logs
       WHERE repository_id = ?
       AND accessed_at >= datetime('now', '-' || ? || ' days')
       GROUP BY DATE(accessed_at)
       ORDER BY date DESC`
    ).all(repositoryId, days);

    return result;
  }

  // 按小时统计（24小时内）
  getHourlyTrend(repositoryId) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT
         strftime('%H', accessed_at) as hour,
         COUNT(*) as count
       FROM access_logs
       WHERE repository_id = ?
       AND accessed_at >= datetime('now', '-1 day')
       GROUP BY hour
       ORDER BY hour`
    ).all(repositoryId);

    return result;
  }

  // 获取最近的访问记录
  getRecentLogs(repositoryId, limit = 50) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT
         al.id,
         al.ip_address,
         al.referer,
         al.user_agent,
         al.accessed_at,
         q.content as quote_content
       FROM access_logs al
       LEFT JOIN quotes q ON al.quote_id = q.id
       WHERE al.repository_id = ?
       ORDER BY al.accessed_at DESC
       LIMIT ?`
    ).all(repositoryId, limit);

    return result;
  }

  // 按User Agent分类统计
  getUserAgentStats(repositoryId) {
    const db = this.accessLogModel.db;

    const result = db.prepare(
      `SELECT
         CASE
           WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN '移动设备'
           WHEN user_agent LIKE '%Bot%' OR user_agent LIKE '%Spider%' OR user_agent LIKE '%Crawler%' THEN '爬虫/机器人'
           WHEN user_agent LIKE '%Chrome%' THEN 'Chrome浏览器'
           WHEN user_agent LIKE '%Firefox%' THEN 'Firefox浏览器'
           WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari浏览器'
           WHEN user_agent LIKE '%Edge%' THEN 'Edge浏览器'
           ELSE '其他'
         END as category,
         COUNT(*) as count
       FROM access_logs
       WHERE repository_id = ? AND user_agent IS NOT NULL
       GROUP BY category
       ORDER BY count DESC`
    ).all(repositoryId);

    return result;
  }

  // 综合统计数据
  getComprehensiveStats(repositoryId) {
    return {
      summary: this.getRepositoryStats(repositoryId, 30),
      topIps: this.getTopIps(repositoryId, 10),
      topReferers: this.getTopReferers(repositoryId, 10),
      dailyTrend: this.getDailyTrend(repositoryId, 7),
      hourlyTrend: this.getHourlyTrend(repositoryId),
      userAgentStats: this.getUserAgentStats(repositoryId),
      recentLogs: this.getRecentLogs(repositoryId, 20)
    };
  }
}
