import { useState, useEffect } from 'react';
import { getRandomQuote, type Quote } from '../../data/quotes/index.js';
import './Quotes.css';

interface QuotesProps {
  locale?: string;
}

export const Quotes = ({ locale = 'en' }: QuotesProps) => {
  const [currentQuote, setCurrentQuote] = useState<Quote>({ text: '', author: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh is always enabled
  const refreshInterval = 30; // minutes

  // Load initial quote
  useEffect(() => {
    refreshQuote();
  }, [locale]);

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuote();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [locale]);

  const refreshQuote = () => {
    setIsRefreshing(true);
    const quote = getRandomQuote(locale);
    setCurrentQuote(quote);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  };

  return (
    <div className="quotes-widget">
      <button
        className="refresh-btn"
        onClick={refreshQuote}
        disabled={isRefreshing}
        title="Get new quote"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isRefreshing ? 'spinning' : ''}
        >
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
      </button>
      
      <div className={`quote-content ${isRefreshing ? 'refreshing' : ''}`}>
        {currentQuote.text && (
          <>
            <blockquote className="quote-text">
              "{currentQuote.text}"
            </blockquote>
            <p className="quote-author">— {currentQuote.author}</p>
          </>
        )}
      </div>
    </div>
  );
};
