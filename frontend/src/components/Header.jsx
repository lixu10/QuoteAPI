import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link to="/" className="logo">QuoteAPI</Link>
          <div className="nav-links">
            <Link to="/repositories" className="nav-link">仓库列表</Link>
            <Link to="/api-docs" className="nav-link">API文档</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">我的仓库</Link>
                {!!user.isAdmin && <Link to="/admin" className="nav-link">用户管理</Link>}
                <Link to="/change-password" className="nav-link">修改密码</Link>
                <span className="user-name">{user.username}</span>
                <button onClick={logout} className="btn btn-secondary">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">登录</Link>
                <Link to="/register">
                  <button className="btn btn-primary">注册</button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
