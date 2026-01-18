import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // 路由变化时关闭菜单
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // 菜单打开时禁止body滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <div className="nav-brand">
            <Link to="/" className="logo">QuoteAPI</Link>
            <a
              href="https://github.com/lixu10/QuoteAPI"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
              title="GitHub"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>

          {/* 桌面端导航 */}
          <div className="nav-links desktop-nav">
            <Link to="/repositories" className="nav-link">仓库</Link>
            <Link to="/endpoint-list" className="nav-link">端口</Link>
            <Link to="/api-docs" className="nav-link">文档</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">我的仓库</Link>
                <Link to="/endpoints" className="nav-link">我的端口</Link>
                <Link to="/api-keys" className="nav-link">API KEY</Link>
                {!!user.isAdmin && <Link to="/admin" className="nav-link">管理</Link>}
                <div className="nav-divider"></div>
                <Link to="/change-password" className="nav-link">密码</Link>
                <span className="user-name">{user.username}</span>
                <button onClick={logout} className="btn btn-secondary btn-sm">退出</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">登录</Link>
                <Link to="/register">
                  <button className="btn btn-primary btn-sm">注册</button>
                </Link>
              </>
            )}
          </div>

          {/* 移动端汉堡按钮 */}
          <button
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="菜单"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </nav>
      </div>

      {/* 移动端侧边菜单 */}
      <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}></div>
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">菜单</span>
          <button className="mobile-menu-close" onClick={toggleMenu}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            <span className="mobile-menu-section-title">导航</span>
            <Link to="/" className="mobile-menu-link">首页</Link>
            <Link to="/repositories" className="mobile-menu-link">仓库列表</Link>
            <Link to="/endpoint-list" className="mobile-menu-link">端口列表</Link>
            <Link to="/api-docs" className="mobile-menu-link">API 文档</Link>
          </div>

          {user ? (
            <>
              <div className="mobile-menu-section">
                <span className="mobile-menu-section-title">我的</span>
                <Link to="/dashboard" className="mobile-menu-link">我的仓库</Link>
                <Link to="/endpoints" className="mobile-menu-link">我的端口</Link>
                <Link to="/api-keys" className="mobile-menu-link">API KEY</Link>
                <Link to="/change-password" className="mobile-menu-link">修改密码</Link>
                {!!user.isAdmin && <Link to="/admin" className="mobile-menu-link">管理后台</Link>}
              </div>
              <div className="mobile-menu-section">
                <div className="mobile-menu-user">
                  <span className="mobile-menu-username">{user.username}</span>
                  <button onClick={handleLogout} className="btn btn-secondary btn-block">退出登录</button>
                </div>
              </div>
            </>
          ) : (
            <div className="mobile-menu-section">
              <span className="mobile-menu-section-title">账户</span>
              <Link to="/login" className="mobile-menu-link">登录</Link>
              <Link to="/register" className="btn btn-primary btn-block">注册账户</Link>
            </div>
          )}

          <div className="mobile-menu-footer">
            <a
              href="https://github.com/lixu10/QuoteAPI"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-github-link"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub 仓库</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
