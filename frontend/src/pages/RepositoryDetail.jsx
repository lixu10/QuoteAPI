import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { repositoryApi, quoteApi, apiService } from '../api';
import './RepositoryDetail.css';

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [newQuote, setNewQuote] = useState('');
  const [bulkImport, setBulkImport] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [repoRes, quotesRes, statsRes] = await Promise.all([
        repositoryApi.getById(id),
        quoteApi.getByRepository(id),
        apiService.getStats(id)
      ]);
      setRepo(repoRes.data);
      setQuotes(quotesRes.data);
      setStats(statsRes.data);
    } catch (err) {
      alert('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!newQuote.trim()) return;

    try {
      await quoteApi.create({ repositoryId: id, content: newQuote });
      setNewQuote('');
      loadData();
    } catch (err) {
      alert('添加失败');
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkImport.trim()) return;

    const lines = bulkImport.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      alert('请输入至少一条语句');
      return;
    }

    try {
      await Promise.all(
        lines.map(line => quoteApi.create({ repositoryId: id, content: line.trim() }))
      );
      setBulkImport('');
      setShowBulkImport(false);
      loadData();
      alert(`成功导入 ${lines.length} 条语句`);
    } catch (err) {
      alert('批量导入失败');
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (window.confirm('确定要删除这条语句吗？')) {
      try {
        await quoteApi.delete(quoteId);
        loadData();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (!repo) return <div className="error">仓库不存在</div>;

  const apiUrl = `${window.location.origin}/api/random/${repo.name}`;

  return (
    <div className="repo-detail">
      <div className="container">
        <div className="repo-info card">
          <h1>{repo.name}</h1>
          <p>{repo.description}</p>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-label">语句数量</span>
              <span className="stat-value">{repo.quote_count || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">API调用</span>
              <span className="stat-value">{repo.api_calls}</span>
            </div>
          </div>
          <div className="api-info">
            <label>API地址</label>
            <code className="api-url">{apiUrl}</code>
          </div>
        </div>

        <div className="add-quote-section card">
          <h2>添加语句</h2>
          <form onSubmit={handleAddQuote} className="add-quote-form">
            <textarea
              className="textarea"
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              placeholder="输入语句内容，支持换行"
              rows={4}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                添加语句
              </button>
              <button
                type="button"
                onClick={() => setShowBulkImport(!showBulkImport)}
                className="btn btn-secondary"
              >
                {showBulkImport ? '关闭批量导入' : '批量导入'}
              </button>
            </div>
          </form>

          {showBulkImport && (
            <form onSubmit={handleBulkImport} className="bulk-import-form">
              <h3>批量导入</h3>
              <p className="hint">每行一条语句，不支持换行（如需换行请单独添加）</p>
              <textarea
                className="textarea"
                value={bulkImport}
                onChange={(e) => setBulkImport(e.target.value)}
                placeholder="每行输入一条语句"
                rows={8}
              />
              <button type="submit" className="btn btn-primary">
                确认导入
              </button>
            </form>
          )}
        </div>

        <div className="quotes-section">
          <h2>语句列表 ({quotes.length})</h2>
          <div className="quotes-list">
            {quotes.map((quote) => (
              <div key={quote.id} className="quote-item card">
                <p className="quote-content">{quote.content}</p>
                <div className="quote-footer">
                  <div className="quote-stats">
                    <span>使用 {quote.usage_count} 次</span>
                    <span>访问 {quote.page_views} 次</span>
                  </div>
                  <button onClick={() => handleDeleteQuote(quote.id)} className="btn btn-danger btn-sm">
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>

          {quotes.length === 0 && (
            <div className="empty-state">
              <p>还没有语句，使用上方表单添加第一条语句</p>
            </div>
          )}
        </div>

        {stats?.refererStats && stats.refererStats.length > 0 && (
          <div className="referer-stats card">
            <h3>来源统计</h3>
            <table>
              <thead>
                <tr>
                  <th>来源</th>
                  <th>访问次数</th>
                </tr>
              </thead>
              <tbody>
                {stats.refererStats.map((item, index) => (
                  <tr key={index}>
                    <td>{item.referer || '直接访问'}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepositoryDetail;
