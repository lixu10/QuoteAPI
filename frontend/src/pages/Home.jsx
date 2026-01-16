import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">简洁优雅的语句API服务</h1>
          <p className="hero-subtitle">为您的网站和应用提供随机语句、诗词、名言</p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard">
                <button className="btn btn-primary btn-large">进入控制台</button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <button className="btn btn-primary btn-large">开始使用</button>
                </Link>
                <Link to="/repositories">
                  <button className="btn btn-secondary btn-large">浏览仓库</button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="feature-grid">
            <div className="feature-card">
              <h3>简单易用</h3>
              <p>一个API调用，即可获取随机语句</p>
            </div>
            <div className="feature-card">
              <h3>完全免费</h3>
              <p>开源项目，永久免费使用</p>
            </div>
            <div className="feature-card">
              <h3>数据统计</h3>
              <p>详细的调用统计和访问分析</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
