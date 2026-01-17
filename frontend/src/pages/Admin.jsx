import React, { useState, useEffect } from 'react';
import { authApi } from '../api';
import { formatBeijingDateTime } from '../utils/timeUtils';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await authApi.getUsers();
      setUsers(response.data);
    } catch (err) {
      alert('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个用户吗？')) {
      try {
        await authApi.deleteUser(id);
        loadUsers();
      } catch (err) {
        alert(err.response?.data?.error || '删除失败');
      }
    }
  };

  if (loading) return <div className="loading">加载中...</div>;

  return (
    <div className="admin">
      <div className="container">
        <h1>用户管理</h1>
        <div className="users-table card">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>管理员</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.is_admin ? '是' : '否'}</td>
                  <td>{formatBeijingDateTime(user.created_at)}</td>
                  <td>
                    {user.id !== 1 && (
                      <button onClick={() => handleDelete(user.id)} className="btn btn-danger btn-sm">
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
