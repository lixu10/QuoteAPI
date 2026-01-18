import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { endpointApi } from '../api';
import { formatBeijingDateTime } from '../utils/timeUtils';
import './EndpointList.css';

function EndpointList() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchEndpoints = useCallback(async () => {
    setLoading(true);
    try {
      const response = await endpointApi.getAll({
        search,
        page: pagination.page,
        limit: pagination.limit
      });
      setEndpoints(response.data.data || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
      setEndpoints([]);
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchEndpoints();
  }, [fetchEndpoints]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getVisibilityLabel = (visibility) => {
    const labels = {
      public: '公开',
      restricted: '受限',
      private: '私有'
    };
    return labels[visibility] || '公开';
  };

  return (
    <div className="endpoint-list-page">
      <div className="container">
        <div className="page-header">
          <div className="header-content">
            <h1>端口列表</h1>
            <p className="page-description">
              浏览所有公开的端口，可以直接调用获取动态内容
            </p>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="搜索端口名称、描述或创建者..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary">搜索</button>
          </form>
          {search && (
            <div className="search-result-info">
              搜索 "{search}" 找到 {pagination.total} 个结果
            </div>
          )}
        </div>

        {/* 端口列表 */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>加载中...</p>
          </div>
        ) : endpoints.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <h3>暂无端口</h3>
            <p>{search ? '没有找到匹配的端口，请尝试其他关键词' : '还没有公开的端口'}</p>
          </div>
        ) : (
          <>
            <div className="endpoint-grid">
              {endpoints.map((endpoint) => (
                <div key={endpoint.id} className="endpoint-card">
                  <div className="card-header">
                    <h3 className="endpoint-name">{endpoint.name}</h3>
                    <span className={`visibility-badge visibility-${endpoint.visibility || 'public'}`}>
                      {getVisibilityLabel(endpoint.visibility)}
                    </span>
                  </div>
                  <p className="endpoint-desc">
                    {endpoint.description || '暂无描述'}
                  </p>
                  <div className="endpoint-meta">
                    <span className="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      {endpoint.username}
                    </span>
                    <span className="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                      {endpoint.call_count || 0} 次调用
                    </span>
                  </div>
                  <div className="endpoint-footer">
                    <span className="created-date">
                      {formatBeijingDateTime(endpoint.created_at)}
                    </span>
                    <div className="card-actions">
                      <a
                        href={`/endpoints/run/${endpoint.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-secondary"
                      >
                        调用
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 分页 */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page === 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="11 17 6 12 11 7"/>
                    <polyline points="18 17 13 12 18 7"/>
                  </svg>
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        className={`page-num ${pagination.page === pageNum ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
                <button
                  className="page-btn"
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="13 17 18 12 13 7"/>
                    <polyline points="6 17 11 12 6 7"/>
                  </svg>
                </button>
              </div>
            )}

            <div className="pagination-info">
              第 {pagination.page} 页，共 {pagination.totalPages} 页（{pagination.total} 个端口）
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EndpointList;
