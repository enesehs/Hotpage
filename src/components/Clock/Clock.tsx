import { useState, useEffect } from 'react';
import './Clock.css';

interface ClockProps {
  locale?: string;
}

export const Clock = ({ locale = 'system' }: ClockProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const syncWithSystemTime = () => {
      setTime(new Date());

      const msUntilNextSecond = 1000 - (Date.now() % 1000);

      const syncTimeout = setTimeout(() => {
        setTime(new Date());
        const timer = setInterval(() => {
          setTime(new Date());
        }, 1000);

        (syncWithSystemTime as any).intervalId = timer;
      }, msUntilNextSecond);

      return syncTimeout;
    };

    const timeoutId = syncWithSystemTime();

    return () => {
      clearTimeout(timeoutId);
      if ((syncWithSystemTime as any).intervalId) {
        clearInterval((syncWithSystemTime as any).intervalId);
      }
    };
  }, []);

  const getLocale = () => {
    if (!locale || locale === 'system') {
      return undefined;
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
