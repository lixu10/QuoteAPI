import React, { useState, useEffect } from 'react';
import { statsApi } from '../api';
import { formatBeijingDateTime } from '../utils/timeUtils';
import './RepositoryStats.css';

const RepositoryStats = ({ repositoryId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    loadStats();
  }, [repositoryId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await statsApi.getRepositoryStats(repositoryId);
      setStats(response.data);
      setError('');
    } catch (err) {
      setError('加载统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">加载统计数据...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!stats) return null;

  return (
    <div className="repository-stats">
      <div className="stats-header">
        <h2>访问统计</h2>
        <button onClick={loadStats} className="btn btn-secondary btn-sm">
          刷新数据
        </button>
      </div>

      {/* 统计概览 */}
      <div className="stats-overview card">
        <div className="stat-card">
          <div className="stat-label">总调用次数</div>
          <div className="stat-value">{stats.summary.totalCalls}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">近30天调用</div>
          <div className="stat-value">{stats.summary.recentCalls}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">独立访客</div>
          <div className="stat-value">{stats.summary.uniqueIps}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">近30天独立访客</div>
          <div className="stat-value">{stats.summary.recentUniqueIps}</div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="stats-tabs">
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          访问趋势
        </button>
        <button
          className={`tab ${activeTab === 'ips' ? 'active' : ''}`}
          onClick={() => setActiveTab('ips')}
        >
          Top IP
        </button>
        <button
          className={`tab ${activeTab === 'referers' ? 'active' : ''}`}
          onClick={() => setActiveTab('referers')}
        >
          来源网站
        </button>
        <button
          className={`tab ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          设备分布
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          访问日志
        </button>
      </div>

      {/* 访问趋势 */}
      {activeTab === 'summary' && (
        <div className="stats-content">
          <div className="card">
            <h3>近7天访问趋势</h3>
            {stats.dailyTrend.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>访问次数</th>
                    <th>独立IP</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyTrend.map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>{item.count}</td>
                      <td>{item.unique_ips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-hint">暂无数据</p>
            )}
          </div>

          <div className="card">
            <h3>24小时访问分布</h3>
            {stats.hourlyTrend.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>小时</th>
                    <th>访问次数</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.hourlyTrend.map((item) => (
                    <tr key={item.hour}>
                      <td>{item.hour}:00</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-hint">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {/* Top IP */}
      {activeTab === 'ips' && (
        <div className="stats-content">
          <div className="card">
            <h3>访问次数最多的IP地址</h3>
            {stats.topIps.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>IP地址</th>
                    <th>访问次数</th>
                    <th>最后访问</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topIps.map((item, index) => (
                    <tr key={item.ip_address}>
                      <td>{index + 1}</td>
                      <td className="monospace">{item.ip_address}</td>
                      <td>{item.count}</td>
                      <td>{formatBeijingDateTime(item.last_access)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-hint">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {/* 来源网站 */}
      {activeTab === 'referers' && (
        <div className="stats-content">
          <div className="card">
            <h3>访问来源统计</h3>
            {stats.topReferers.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>排名</th>
                    <th>来源</th>
                    <th>访问次数</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topReferers.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="referer-cell">{item.referer}</td>
                      <td>{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-hint">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {/* 设备分布 */}
      {activeTab === 'devices' && (
        <div className="stats-content">
          <div className="card">
            <h3>设备/浏览器分布</h3>
            {stats.userAgentStats.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>类型</th>
                    <th>访问次数</th>
                    <th>占比</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.userAgentStats.map((item) => {
                    const total = stats.userAgentStats.reduce((sum, i) => sum + i.count, 0);
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <tr key={item.category}>
                        <td>{item.category}</td>
                        <td>{item.count}</td>
                        <td>{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="empty-hint">暂无数据</p>
            )}
          </div>
        </div>
      )}

      {/* 访问日志 */}
      {activeTab === 'logs' && (
        <div className="stats-content">
          <div className="card">
            <h3>最近访问记录（最多20条）</h3>
            {stats.recentLogs.length > 0 ? (
              <div className="logs-list">
                {stats.recentLogs.map((log) => (
                  <div key={log.id} className="log-item">
                    <div className="log-header">
                      <span className="log-ip monospace">{log.ip_address || '未知IP'}</span>
                      <span className="log-time">{formatBeijingDateTime(log.accessed_at)}</span>
                    </div>
                    {log.quote_content && (
                      <div className="log-quote">{log.quote_content.substring(0, 50)}...</div>
                    )}
                    {log.referer && (
                      <div className="log-referer">来源: {log.referer}</div>
                    )}
                    {log.user_agent && (
                      <div className="log-ua">{log.user_agent}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-hint">暂无访问记录</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryStats;
