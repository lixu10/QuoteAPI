import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quoteApi } from '../api';
import './QuoteDetail.css';

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await quoteApi.getQuoteDetails(id);
      setQuote(response.data);
    } catch (err) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="quote-detail-page">
        <div className="container">
          <div className="loading">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quote-detail-page">
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="quote-detail-page">
        <div className="container">
          <div className="error-message">语句不存在</div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-detail-page">
      <div className="quote-hero">
        <div className="quote-hero-content">
          <div className="quote-decorations">
            <div className="quote-mark quote-mark-left">"</div>
            <div className="quote-text-wrapper">
              <div className="quote-main-text">
                {quote.content}
              </div>
            </div>
            <div className="quote-mark quote-mark-right">"</div>
          </div>
        </div>
      </div>

      <div className="quote-info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon">📊</div>
              <div className="info-label">使用次数</div>
              <div className="info-value">{quote.use_count || 0}</div>
            </div>
            <div className="info-card">
              <div className="info-icon">📚</div>
              <div className="info-label">所属仓库</div>
              <div className="info-value clickable" onClick={() => navigate(`/repository/${quote.repository_id}`)}>
                {quote.repository_name || `仓库 #${quote.repository_id}`}
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">🆔</div>
              <div className="info-label">语句编号</div>
              <div className="info-value">#{quote.id}</div>
            </div>
            <div className="info-card">
              <div className="info-icon">📅</div>
              <div className="info-label">创建时间</div>
              <div className="info-value">{new Date(quote.created_at).toLocaleDateString('zh-CN')}</div>
            </div>
          </div>

          <div className="action-section">
            <button
              onClick={() => navigate(`/repository/${quote.repository_id}`)}
              className="btn-premium btn-primary"
            >
              <span>探索更多</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="btn-premium btn-secondary"
            >
              <span>返回</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetail;
