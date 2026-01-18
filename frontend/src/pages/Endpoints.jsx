import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { endpointApi } from '../api';
import { formatBeijingDate } from '../utils/timeUtils';
import './Endpoints.css';

const Endpoints = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      const response = await endpointApi.getUserEndpoints();
      setEndpoints(response.data || []);
    } catch (err) {
      console.error('加载端口失败:', err);
      alert('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await endpointApi.toggle(id);
      loadEndpoints();
    } catch (err) {
      alert('操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个端口吗？')) {
      try {
        await endpointApi.delete(id);
        loadEndpoints();
      } catch (err) {
        alert('删除失败');
      }
    }
  };

  const copyApiUrl = (name) => {
    const url = `${window.location.origin}/endpoints/run/${name}`;
    navigator.clipboard.writeText(url);
    alert('API地址已复制到剪贴板');
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="endpoints-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>我的端口</h1>
            <p className="subtitle">通过编程组合多个仓库API，创建自定义接口</p>
          </div>
          <button onClick={() => navigate('/endpoints/new')} className="btn btn-primary">
            创建新端口
          </button>
        </div>

        {endpoints.length === 0 ? (
          <div className="empty-state card">
            <h3>还没有端口</h3>
            <p>端口允许你使用Python编写自定义逻辑，组合多个仓库API</p>
            <button onClick={() => navigate('/endpoints/new')} className="btn btn-primary">
              创建第一个端口
            </button>
          </div>
        ) : (
          <div className="endpoints-grid">
            {endpoints.map((endpoint) => (
              <div key={endpoint.id} className="endpoint-card card">
                <div className="endpoint-header">
                  <h3>{endpoint.name}</h3>
                  <div className="endpoint-status">
                    <span className={`status-badge ${endpoint.is_active ? 'active' : 'inactive'}`}>
                      {endpoint.is_active ? '启用' : '禁用'}
                    </span>
                  </div>
                </div>

                <p className="endpoint-description">
                  {endpoint.description || '暂无描述'}
                </p>

                <div className="endpoint-stats">
                  <div className="stat">
                    <span className="stat-label">调用次数</span>
                    <span className="stat-value">{endpoint.call_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">创建时间</span>
                    <span className="stat-value">
                      {formatBeijingDate(endpoint.created_at)}
                    </span>
                  </div>
                </div>

                <div className="endpoint-api">
                  <label>API地址</label>
                  <div className="api-url-box">
                    <code className="api-url">
                      /endpoints/run/{endpoint.name}
                    </code>
                    <button
                      onClick={() => copyApiUrl(endpoint.name)}
                      className="btn btn-secondary btn-sm"
                    >
                      复制
                    </button>
                  </div>
                </div>

                <div className="endpoint-actions">
                  <Link to={`/endpoints/edit/${endpoint.id}`} className="btn btn-secondary">
                    编辑
                  </Link>
                  <button
                    onClick={() => handleToggle(endpoint.id)}
                    className="btn btn-secondary"
                  >
                    {endpoint.is_active ? '禁用' : '启用'}
                  </button>
                  <button
                    onClick={() => handleDelete(endpoint.id)}
                    className="btn btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Endpoints;
