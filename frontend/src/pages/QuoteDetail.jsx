import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
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
      const response = await apiService.getQuoteDetails(id);
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
        <div className="loading">加载中...</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="quote-detail-page">
        <div className="error-container">
          <div className="error-message">{error || '语句不存在'}</div>
          <button onClick={() => navigate(-1)} className="back-btn">
            ← 返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quote-detail-page">
      <div className="quote-container">
        <div className="quote-content">
          <div className="quotation-mark left">"</div>
          <p className="quote-text">{quote.content}</p>
          <div className="quotation-mark right">"</div>
        </div>

        <div className="quote-meta">
          <button
            onClick={() => navigate(`/repository/${quote.repository_id}`)}
            className="repo-link"
          >
            {quote.repository_name || `仓库 #${quote.repository_id}`}
          </button>
        </div>

        <button onClick={() => navigate(-1)} className="back-btn-bottom">
          ← 返回
        </button>
      </div>
    </div>
  );
};

export default QuoteDetail;
