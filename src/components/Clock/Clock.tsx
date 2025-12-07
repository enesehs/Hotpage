import { useState, useEffect } from 'react';
import './Clock.css';

interface ClockProps {
  locale?: string;
}

export const Clock = ({ locale = 'system' }: ClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLocale = () => {
    if (!locale || locale === 'system') {
      return undefined; // Browser will use system default
    }
    return locale;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(getLocale(), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(getLocale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="clock">
      <div className="clock-time">{formatTime(time)}</div>
      <div className="clock-date">{formatDate(time)}</div>
    </div>
  );
};
