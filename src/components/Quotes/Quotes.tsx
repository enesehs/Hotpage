import { useState, useEffect, useCallback } from 'react';
import { getRandomQuote, type Quote } from '../../data/quotes/index.js';
import './Quotes.css';

interface QuotesProps {
  locale?: string;
  scale?: number;
  onScaleChange?: (scale: number) => void;
  onHide?: () => void;
}

export const Quotes = ({ locale = 'en', scale = 1, onScaleChange, onHide }: QuotesProps) => {
  const [currentQuote, setCurrentQuote] = useState<Quote>({ text: '', author: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshInterval = 30;

  const refreshQuote = useCallback(() => {
    setIsRefreshing(true);
    const quote = getRandomQuote(locale);
    setCurrentQuote(quote);

    setTimeout(() => {
      setIsRefreshing(false);
    }, 300);
  }, [locale]);

  useEffect(() => {
    refreshQuote();
  }, [refreshQuote]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshQuote();
    }, refreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshQuote]);



  const handleZoomIn = () => onScaleChange?.(Math.min((scale || 1) + 0.1, 2));
  const handleZoomOut = () => onScaleChange?.(Math.max((scale || 1) - 0.1, 0.5));

  return (
    <div
      className="quotes-widget-wrapper"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
    >
      <div className="widget-controls">
        <button onClick={handleZoomIn} title="Zoom In">+</button>
        <button onClick={handleZoomOut} title="Zoom Out">-</button>
        <button onClick={onHide} title="Hide Widget">×</button>
      </div>

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
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
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
    </div>
  );
};
