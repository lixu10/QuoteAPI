import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { homeShowcaseApi } from '../api';
import './Home.css';

const QuoteShowcase = () => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchQuote = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      setFadeIn(false);
    }

    try {
      const response = await homeShowcaseApi.getData();
      if (response.data.hasShowcase && response.data.content) {
        setQuote(response.data);
        setTimeout(() => setFadeIn(true), 50);
      } else {
        setQuote(null);
      }
    } catch (err) {
      console.error('获取展示数据失败:', err);
      setQuote(null);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleRefresh = () => {
    if (!isRefreshing) {
      fetchQuote(true);
    }
  };

  if (loading) {
    return (
      <section className="showcase-section">
        <div className="showcase-container">
          <div className="showcase-skeleton">
            <div className="skeleton-line skeleton-line-1"></div>
            <div className="skeleton-line skeleton-line-2"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <section className="showcase-section">
      <div className="showcase-container">
        <div className={`showcase-card ${fadeIn ? 'fade-in' : ''}`}>
          <div className="showcase-quote-mark">"</div>
          <blockquote className="showcase-content">
            {quote.content}
          </blockquote>
          <div className="showcase-footer">
            <span className="showcase-source">
              — {quote.sourceType === 'repository' ? '仓库' : '端口'}: {quote.sourceName}
            </span>
            <button
              className={`showcase-refresh ${isRefreshing ? 'refreshing' : ''}`}
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="换一句"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
        </div>
        <div className="showcase-decoration">
          <div className="decoration-line"></div>
          <span className="decoration-text">每日一言</span>
          <div className="decoration-line"></div>
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <QuoteShowcase />

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
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>简单易用</h3>
              <p>一个API调用，即可获取随机语句</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3>完全免费</h3>
              <p>开源项目，永久免费使用</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
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
