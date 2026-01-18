import { useState, useEffect } from 'react';
import { apiKeyApi } from '../api';
import './ApiKeys.css';

function ApiKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const response = await apiKeyApi.getAll();
      setKeys(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      const response = await apiKeyApi.create(newKeyName.trim());
      setNewlyCreatedKey(response.data.key);
      setNewKeyName('');
      fetchKeys();
    } catch (error) {
      alert(error.response?.data?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await apiKeyApi.toggle(id);
      fetchKeys();
    } catch (error) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个 API KEY 吗？')) return;

    try {
      await apiKeyApi.delete(id);
      fetchKeys();
    } catch (error) {
      alert(error.response?.data?.message || '删除失败');
    }
  };

  const handleRename = async (id) => {
    if (!editName.trim()) return;

    try {
      await apiKeyApi.rename(id, editName.trim());
      setEditingId(null);
      setEditName('');
      fetchKeys();
    } catch (error) {
      alert(error.response?.data?.message || '重命名失败');
    }
  };

  const startEdit = (key) => {
    setEditingId(key.id);
    setEditName(key.name || '');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('已复制到剪贴板');
  };

  if (loading) {
    return (
      <div className="apikeys-page">
        <div className="container">
          <div className="loading-state">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="apikeys-page">
      <div className="container">
        <div className="page-header">
          <h1>API KEY 管理</h1>
          <p className="page-description">
            创建和管理您的 API KEY，用于访问受限的仓库和端口
          </p>
        </div>

        {/* 新创建的 KEY 提示 */}
        {newlyCreatedKey && (
          <div className="new-key-notice">
            <div className="notice-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>请保存您的 API KEY</span>
            </div>
            <p className="notice-text">
              这是您唯一一次看到完整的 API KEY，请妥善保存。
            </p>
            <div className="key-display">
              <code>{newlyCreatedKey.key_value}</code>
              <button
                className="btn-copy"
                onClick={() => copyToClipboard(newlyCreatedKey.key_value)}
              >
                复制
              </button>
            </div>
            <button
              className="btn-dismiss"
              onClick={() => setNewlyCreatedKey(null)}
            >
              我已保存，关闭提示
            </button>
          </div>
        )}

        {/* 创建新 KEY */}
        <div className="create-key-section">
          <h2>创建新的 API KEY</h2>
          <form onSubmit={handleCreate} className="create-form">
            <input
              type="text"
              placeholder="输入 KEY 名称（用于识别）"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="input-field"
            />
            <button
              type="submit"
              disabled={creating || !newKeyName.trim()}
              className="btn btn-primary"
            >
              {creating ? '创建中...' : '创建 API KEY'}
            </button>
          </form>
        </div>

        {/* KEY 列表 */}
        <div className="keys-section">
          <h2>已有的 API KEY</h2>
          {keys.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <p>您还没有创建任何 API KEY</p>
            </div>
          ) : (
            <div className="keys-list">
              {keys.map((key) => (
                <div key={key.id} className={`key-item ${!key.is_active ? 'disabled' : ''}`}>
                  <div className="key-main">
                    <div className="key-info">
                      {editingId === key.id ? (
                        <div className="edit-name-form">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field-sm"
                            autoFocus
                          />
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => handleRename(key.id)}
                          >
                            保存
                          </button>
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => setEditingId(null)}
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="key-name">{key.name || '未命名'}</span>
                          <button
                            className="btn-icon"
                            onClick={() => startEdit(key)}
                            title="重命名"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                    <code className="key-value">{key.key_value}</code>
                    <div className="key-meta">
                      <span className={`status-badge ${key.is_active ? 'active' : 'inactive'}`}>
                        {key.is_active ? '已启用' : '已禁用'}
                      </span>
                      <span className="key-date">
                        创建于 {new Date(key.created_at).toLocaleDateString('zh-CN')}
                      </span>
                      {key.last_used_at && (
                        <span className="key-date">
                          最后使用 {new Date(key.last_used_at).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="key-actions">
                    <button
                      className={`btn-action ${key.is_active ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggle(key.id)}
                    >
                      {key.is_active ? '禁用' : '启用'}
                    </button>
                    <button
                      className="btn-action btn-danger"
                      onClick={() => handleDelete(key.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="usage-section">
          <h2>使用方法</h2>
          <div className="usage-content">
            <div className="usage-item">
              <h3>通过 Header 传递</h3>
              <code>X-API-Key: your_api_key_here</code>
            </div>
            <div className="usage-item">
              <h3>通过 Query 参数传递</h3>
              <code>?api_key=your_api_key_here</code>
            </div>
            <div className="usage-example">
              <h3>示例请求</h3>
              <pre>{`curl -H "X-API-Key: qak_xxx..." \\
  https://quoteapi.2b.gs/api/random/my-repo

# 或者
curl "https://quoteapi.2b.gs/api/random/my-repo?api_key=qak_xxx..."`}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeys;
