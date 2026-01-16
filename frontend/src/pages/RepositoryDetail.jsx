import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { repositoryApi, quoteApi, apiService } from '../api';
import './RepositoryDetail.css';

const RepositoryDetail = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newQuote, setNewQuote] = useState('');
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
    try {
      await quoteApi.create({ repositoryId: id, content: newQuote });
      setNewQuote('');
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('添加失败');
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

        <div className="section-header">
          <h2>语句列表</h2>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            添加语句
          </button>
        </div>

        <div className="quotes-list">
          {quotes.map((quote) => (
            <div key={quote.id} className="quote-item card">
              <p className="quote-content">{quote.content}</p>
              <div className="quote-stats">
                <span>使用次数: {quote.usage_count}</span>
                <span>页面访问: {quote.page_views}</span>
              </div>
              <button onClick={() => handleDeleteQuote(quote.id)} className="btn btn-danger btn-sm">
                删除
              </button>
            </div>
          ))}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>添加语句</h2>
            <form onSubmit={handleAddQuote}>
              <div className="form-group">
                <label>内容</label>
                <textarea
                  className="textarea"
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="输入语句内容，支持换行"
                  required
                  style={{ minHeight: '150px' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">添加</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryDetail;
