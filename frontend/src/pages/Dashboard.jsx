import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { repositoryApi } from '../api';
import './Dashboard.css';

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newRepo, setNewRepo] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    try {
      const response = await repositoryApi.getUserRepos();
      setRepositories(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('加载仓库失败:', err);
      setError('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await repositoryApi.create(newRepo);
      setShowModal(false);
      setNewRepo({ name: '', description: '' });
      loadRepositories();
    } catch (err) {
      alert(err.response?.data?.error || '创建失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个仓库吗？')) {
      try {
        await repositoryApi.delete(id);
        loadRepositories();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>我的仓库</h1>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            创建仓库
          </button>
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
                  管理
                </Link>
                <button onClick={() => handleDelete(repo.id)} className="btn btn-danger">
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>

        {repositories.length === 0 && (
          <div className="empty-state">
            <p>还没有仓库，点击上方按钮创建第一个仓库</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>创建新仓库</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>仓库名</label>
                <input
                  type="text"
                  className="input"
                  value={newRepo.name}
                  onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  className="textarea"
                  value={newRepo.description}
                  onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button type="submit" className="btn btn-primary">创建</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
