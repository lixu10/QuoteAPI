import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../api';
import './QuoteDetail.css';

const QuoteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const quoteTextRef = useRef(null);

  useEffect(() => {
    loadQuote();
  }, [id]);

  useEffect(() => {
    if (quote && quoteTextRef.current) {
      adjustFontSize();
    }

    // 监听窗口大小变化
    const handleResize = () => {
      if (quote && quoteTextRef.current) {
        adjustFontSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [quote]);

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

  const adjustFontSize = () => {
    const element = quoteTextRef.current;
    if (!element) return;

    // 获取语句的行
    const lines = quote.content.split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));

    // 检查是否为移动端
    const isMobile = window.innerWidth <= 768;

    // 根据最长行的字符数动态调整字号
    let fontSize;
    if (maxLineLength <= 20) {
      fontSize = isMobile ? 28 : 42; // 短句用大字
    } else if (maxLineLength <= 40) {
      fontSize = isMobile ? 24 : 36;
    } else if (maxLineLength <= 60) {
      fontSize = isMobile ? 20 : 30;
    } else if (maxLineLength <= 80) {
      fontSize = isMobile ? 18 : 26;
    } else if (maxLineLength <= 100) {
      fontSize = isMobile ? 16 : 22;
    } else if (maxLineLength <= 150) {
      fontSize = isMobile ? 14 : 18;
    } else {
      fontSize = isMobile ? 13 : 16; // 超长句用小字
    }

    element.style.fontSize = `${fontSize}px`;
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
          <p ref={quoteTextRef} className="quote-text">{quote.content}</p>
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
