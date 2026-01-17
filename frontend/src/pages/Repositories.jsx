import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repositoryApi } from '../api';
import './Repositories.css';

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const response = await repositoryApi.getAll();
      setRepositories(response.data);
    } catch (err) {
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="repositories-page">
      <div className="container">
        <div className="page-header">
          <h1>公开仓库</h1>
          <p className="subtitle">浏览所有可用的语句仓库</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="repo-grid">
          {repositories.map((repo) => (
            <div key={repo.id} className="repo-card card">
              <h3>{repo.name}</h3>
              <p className="repo-description">{repo.description || '暂无描述'}</p>
              <div className="repo-stats">
                <span>调用次数: {repo.api_calls}</span>
              </div>
              <div className="repo-actions">
                <Link to={`/repository/${repo.id}`} className="btn btn-secondary">
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>

        {repositories.length === 0 && (
          <div className="empty-state">
            <p>暂无仓库</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Repositories;
