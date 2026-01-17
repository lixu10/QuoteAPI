import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { repositoryApi, quoteApi, apiService } from '../api';
import { useAuth } from '../AuthContext';
import RepositoryStats from '../components/RepositoryStats';
import './RepositoryDetail.css';

const QUOTES_PER_PAGE = 10;

const RepositoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [repo, setRepo] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [stats, setStats] = useState(null);
  const [newQuote, setNewQuote] = useState('');
  const [bulkImport, setBulkImport] = useState('');
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

      if (user && repoRes.data.user_id === user.id) {
        setIsOwner(true);
      }
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

  // 分页逻辑
  const totalPages = Math.ceil(quotes.length / QUOTES_PER_PAGE);
  const startIndex = (currentPage - 1) * QUOTES_PER_PAGE;
  const endIndex = startIndex + QUOTES_PER_PAGE;
  const currentQuotes = quotes.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="repo-detail">
      <div className="container">
        <div className="repo-header">
          <h1>{repo.name}</h1>
          <p className="repo-description">{repo.description}</p>

          <div className="repo-stats">
            <div className="stat-box">
              <div className="stat-number">{repo.quote_count || 0}</div>
              <div className="stat-label">语句数量</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{repo.api_calls}</div>
              <div className="stat-label">API调用</div>
            </div>
          </div>

          <div className="api-box">
            <label>API 调用地址</label>
            <div className="api-url-container">
              <code>{apiUrl}</code>
              <button
                onClick={() => navigator.clipboard.writeText(apiUrl)}
                className="copy-btn"
              >
                复制
              </button>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="add-section">
            <h2>添加语句</h2>
            <form onSubmit={handleAddQuote}>
              <textarea
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="输入语句内容，支持换行..."
                rows={3}
              />
              <div className="form-actions">
                <button type="submit" className="btn-add">
                  添加语句
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkImport(!showBulkImport)}
                  className="btn-bulk"
                >
                  {showBulkImport ? '取消批量导入' : '批量导入'}
                </button>
              </div>
            </form>

            {showBulkImport && (
              <form onSubmit={handleBulkImport} className="bulk-form">
                <p className="hint">每行一条语句（不支持单条换行，如需换行请单独添加）</p>
                <textarea
                  value={bulkImport}
                  onChange={(e) => setBulkImport(e.target.value)}
                  placeholder="每行输入一条语句..."
                  rows={6}
                />
                <button type="submit" className="btn-add">
                  确认导入
                </button>
              </form>
            )}
          </div>
        )}

        <div className="quotes-section">
          <div className="section-header">
            <h2>语句列表</h2>
            <span className="quote-count">{quotes.length} 条</span>
          </div>

          {currentQuotes.length > 0 ? (
            <>
              <div className="quotes-grid">
                {currentQuotes.map((quote) => (
                  <div key={quote.id} className="quote-card">
                    <div
                      className="quote-text"
                      onClick={() => navigate(`/quote/${quote.id}`)}
                    >
                      {quote.content}
                    </div>
                    <div className="quote-meta">
                      <div className="quote-info">
                        <span>使用 {quote.usage_count || 0} 次</span>
                        <span>•</span>
                        <span>访问 {quote.page_views || 0} 次</span>
                        <span>•</span>
                        <a
                          href={`/quote/${quote.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            navigate(`/quote/${quote.id}`);
                          }}
                          className="view-link"
                        >
                          查看详情
                        </a>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="delete-btn"
                        >
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-btn"
                  >
                    上一页
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`page-number ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="page-btn"
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>还没有语句，{isOwner ? '使用上方表单添加第一条语句' : '敬请期待'}</p>
            </div>
          )}
        </div>

        {isOwner && <RepositoryStats repositoryId={id} />}
      </div>
    </div>
  );
};

export default RepositoryDetail;
