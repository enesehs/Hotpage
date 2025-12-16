import { useState, useEffect } from 'react';
import { weatherIcons, getWeatherIconKey } from '../../data/icons';
import { getTranslations } from '../../data/translations';
import { logger } from '../../utils/logger';
import './Weather.css';

interface WeatherData {
  temperature: number;
  feelsLike?: number;
  tempMin?: number;
  tempMax?: number;
  condition: string;
  iconKey: string;
  location: string;
  humidity?: number;
  windSpeed?: number;
  pressure?: number;
  uvIndex?: number;
  visibility?: number;
}

interface WeatherProps {
  locale?: string;
  manualLocation?: string;
  refreshMinutes?: number;
}

const getWeatherCondition = (code: number | string, locale: string): string => {
  const codeNum = typeof code === 'string' ? parseInt(code) : code;
  const t = getTranslations(locale);

  if (codeNum === 0) return t.weather.conditions.clear;
  if (codeNum === 1) return t.weather.conditions.mostlyClear;
  if (codeNum === 2) return t.weather.conditions.partlyCloudy;
  if (codeNum === 3) return t.weather.conditions.overcast;
  if (codeNum >= 45 && codeNum <= 48) return t.weather.conditions.foggy;
  if (codeNum >= 51 && codeNum <= 55) return t.weather.conditions.drizzle;
  if (codeNum >= 56 && codeNum <= 57) return t.weather.conditions.freezingDrizzle;
  if (codeNum >= 61 && codeNum <= 65) return t.weather.conditions.rainy;
  if (codeNum >= 66 && codeNum <= 67) return t.weather.conditions.freezingRain;
  if (codeNum >= 71 && codeNum <= 77) return t.weather.conditions.snowy;
  if (codeNum >= 80 && codeNum <= 82) return t.weather.conditions.showers;
  if (codeNum >= 85 && codeNum <= 86) return t.weather.conditions.snowShowers;
  if (codeNum >= 95 && codeNum <= 99) return t.weather.conditions.thunderstorm;

  return t.weather.conditions.unknown;
};

export const Weather = ({ locale = 'en-US', manualLocation, refreshMinutes = 10 }: WeatherProps) => {
  const t = getTranslations(locale);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [debouncedLocation, setDebouncedLocation] = useState(manualLocation);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(manualLocation);
    }, 800);

    return () => clearTimeout(timer);
  }, [manualLocation]);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      if (debouncedLocation && debouncedLocation.trim()) {
        logger.info('Weather', `Manual location set: ${debouncedLocation}`);
        try {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedLocation)}&format=json&limit=1&accept-language=${locale}`
          );
          const geoData = await geoResponse.json();

          if (geoData && geoData.length > 0) {
            const { lat, lon } = geoData[0];
            logger.success('Weather', `Geocoded ${debouncedLocation} to ${lat}, ${lon}`);
            await fetchOpenMeteoWeather(parseFloat(lat), parseFloat(lon), debouncedLocation.trim());
            return;
          } else {
            logger.warning('Weather', `No results for location: ${debouncedLocation}`);
          }
        } catch (err) {
          logger.error('Weather', 'Geocoding failed', err);
        }
      }

      try {
        logger.debug('Weather', 'Attempting geolocation...');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const { latitude, longitude } = position.coords;
        logger.success('Weather', `Geolocation: ${latitude}, ${longitude}`);
        await fetchOpenMeteoWeather(latitude, longitude);
      } catch (geoErr) {
        logger.debug('Weather', 'Geolocation failed, trying IP-based location');
        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();

          if (ipData.latitude && ipData.longitude) {
            logger.success('Weather', `IP-based location: ${ipData.city}, ${ipData.country}`);
            await fetchOpenMeteoWeather(ipData.latitude, ipData.longitude);
          } else {
            throw new Error('Could not determine location');
          }
        } catch (ipErr) {
          logger.error('Weather', 'All location methods failed', ipErr);
          setError(locale === 'tr' ? 'Konum alınamadı' : 'Could not get location');
          setLoading(false);
        }
      }
    };

    const fetchOpenMeteoWeather = async (lat: number, lon: number, overrideLocationName?: string) => {
      try {
        logger.debug('Weather', `Fetching weather for ${lat}, ${lon}`);
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure,is_day&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`
        );

        if (!response.ok) throw new Error('Weather fetch failed');

        const data = await response.json();
        const current = data.current;
        const daily = data.daily;

        let locationName = overrideLocationName || '';
        if (!locationName) {
          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${locale}`
            );
            const geoData = await geoResponse.json();
            locationName = geoData.address?.city ||
              geoData.address?.town ||
              geoData.address?.village ||
              geoData.address?.county ||
              geoData.address?.state || '';
            logger.debug('Weather', `Reverse geocoded to: ${locationName}`);
          } catch (geoErr) {
            logger.warning('Weather', 'Reverse geocoding failed', geoErr);
            locationName = t.weather.conditions.unknown + ' Location';
          }
        }

        const weatherData = {
          temperature: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          tempMin: daily?.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : undefined,
          tempMax: daily?.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : undefined,
          condition: getWeatherCondition(current.weather_code, locale),
          iconKey: getWeatherIconKey(current.weather_code, current.is_day === 1),
          location: locationName,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          pressure: current.surface_pressure ? Math.round(current.surface_pressure) : undefined,
        };

        logger.success('Weather', `Weather data loaded: ${weatherData.temperature}°C in ${locationName}`);
        setWeather(weatherData);
        setLastUpdated(new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        logger.error('Weather', 'Failed to fetch weather data', err);
        setError(t.weather.error);
      }
      setLoading(false);
    };

    fetchWeather();

    const minutes = Math.max(5, refreshMinutes || 10);
    const interval = setInterval(fetchWeather, minutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [locale, debouncedLocation, refreshMinutes]);

  if (loading) {
    return (
      <div className="weather-widget loading">
        <div className="widget-header">
          <div className="widget-title">
            <svg className="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span>{locale === 'tr' ? 'Hava Durumu' : 'Weather'}</span>
          </div>
        </div>
        <div className="widget-loading">
          <div className="loading-bar">
            <div className="loading-bar-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-widget error">
        <svg className="weather-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="weather-error-text">{error || t.weather.error}</span>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="weather-widget">
      <div className="widget-header">
        <div className="widget-title">
          <svg className="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span>{t.weather.title}</span>
        </div>
        {lastUpdated && (
          <span className="weather-last-updated">{lastUpdated}</span>
        )}
      </div>
      <div className="weather-content">
        <div className="weather-left">
          <span className="weather-icon" dangerouslySetInnerHTML={{ __html: weatherIcons[weather.iconKey] || weatherIcons['default'] }} />
          <div className="weather-temp-section">
            <span className="weather-temp">{weather.temperature}°C</span>
            {weather.feelsLike !== undefined && (
              <span className="weather-feels-like">
                {t.weather.feelsLike} {weather.feelsLike}°
              </span>
            )}
          </div>
        </div>

        <div className="weather-center">
          <span className="weather-condition">{weather.condition}</span>
          <span className="weather-location">
            <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {weather.location}
          </span>
          {(weather.tempMin !== undefined && weather.tempMax !== undefined) && (
            <span className="weather-minmax">
              <svg className="minmax-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              {weather.tempMin}° /
              <svg className="minmax-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {weather.tempMax}°
            </span>
          )}
        </div>

        <div className="weather-right">
          {weather.humidity !== undefined && (
            <div className="weather-stat">
              <svg className="weather-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
              <span className="weather-stat-value">{weather.humidity}%</span>
              <span className="weather-stat-label">{t.weather.humidity}</span>
            </div>
          )}
          {weather.windSpeed !== undefined && (
            <div className="weather-stat">
              <svg className="weather-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
                <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
                <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
              </svg>
              <span className="weather-stat-value">{weather.windSpeed}</span>
              <span className="weather-stat-label">km/h</span>
            </div>
          )}
          {weather.pressure !== undefined && (
            <div className="weather-stat">
              <svg className="weather-stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20" />
                <path d="M8 6h8" />
                <path d="M8 18h8" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <span className="weather-stat-value">{weather.pressure}</span>
              <span className="weather-stat-label">hPa</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
