import React, { useState } from 'react';
import { authApi } from '../api';
import './ChangePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('新密码和确认密码不一致');
      return;
    }

    if (formData.newPassword.length < 3) {
      setError('新密码长度至少为3个字符');
      return;
    }

    try {
      await authApi.changePassword(formData.oldPassword, formData.newPassword);
      setSuccess(true);
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.error || '修改失败');
    }
  };

  return (
    <div className="change-password-page">
      <div className="container">
        <div className="change-password-card card">
          <h1>修改密码</h1>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">密码修改成功</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>原密码</label>
              <input
                type="password"
                className="input"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>新密码</label>
              <input
                type="password"
                className="input"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>确认新密码</label>
              <input
                type="password"
                className="input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              确认修改
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
