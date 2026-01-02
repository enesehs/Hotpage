import { useState, useEffect, useCallback } from 'react';
import { currencyIcons, cryptoIcons } from '../../data/icons';
import { getTranslations } from '../../data/translations';
import { logger } from '../../utils/logger';
import './Currency.css';

interface CurrencyData {
  code: string;
  name: string;
  rate: number;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  lastUpdated: string;
}

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changeDirection: 'up' | 'down' | 'neutral';
  sparkline?: number[];
  lastUpdated: string;
}

interface CurrencyProps {
  locale?: string;
  settings?: {
    baseCurrency?: string;
    activeTab?: 'currency' | 'crypto';
    enabledCurrencies?: string[];
    enabledCryptos?: string[];
    showSparkline?: boolean;
    refreshMinutes?: number;
  };
  onSettingsChange?: (settings: Record<string, unknown>) => void;
}



const currencyInfo: Record<string, { symbol: string; name: string; nameTr: string }> = {
  USD: { symbol: '$', name: 'US Dollar', nameTr: 'Amerikan Doları' },
  EUR: { symbol: '€', name: 'Euro', nameTr: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound', nameTr: 'İngiliz Sterlini' },
  JPY: { symbol: '¥', name: 'Japanese Yen', nameTr: 'Japon Yeni' },
  TRY: { symbol: '₺', name: 'Turkish Lira', nameTr: 'Türk Lirası' },
  XAU: { symbol: 'Au', name: 'Gold (Gram)', nameTr: 'Gram Altın' },
};

const WarningIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="warning-icon">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const Currency = ({ locale = 'en-US', settings, onSettingsChange }: CurrencyProps) => {
  const t = getTranslations(locale);
  const isTurkish = locale === 'tr-TR' || locale === 'tr';
  const baseCurrency = settings?.baseCurrency || (isTurkish ? 'TRY' : 'USD');
  const enabledCurrencies = settings?.enabledCurrencies || (isTurkish ? ['USD', 'EUR', 'GBP', 'XAU'] : ['EUR', 'GBP', 'JPY']);
  const enabledCryptos = settings?.enabledCryptos || ['bitcoin', 'ethereum', 'avalanche', 'polkadot'];
  const showSparkline = settings?.showSparkline ?? false;
  const refreshMinutes = settings?.refreshMinutes ?? 15;

  const hasCurrencies = enabledCurrencies.length > 0;
  const hasCryptos = enabledCryptos.length > 0;
  const hasAnySelection = hasCurrencies || hasCryptos;

  if (!hasAnySelection) {
    return null;
  }

  const getInitialTab = (): 'currency' | 'crypto' => {
    if (settings?.activeTab) {
      if (settings.activeTab === 'currency' && !hasCurrencies) return 'crypto';
      if (settings.activeTab === 'crypto' && !hasCryptos) return 'currency';
      return settings.activeTab;
    }
    return hasCurrencies ? 'currency' : 'crypto';
  };

  const [activeTab, setActiveTab] = useState<'currency' | 'crypto'>(getInitialTab());
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    if (!hasCurrencies && activeTab === 'currency' && hasCryptos) {
      setActiveTab('crypto');
      onSettingsChange?.({ activeTab: 'crypto' });
    }
    if (!hasCryptos && activeTab === 'crypto' && hasCurrencies) {
      setActiveTab('currency');
      onSettingsChange?.({ activeTab: 'currency' });
    }
  }, [hasCurrencies, hasCryptos, activeTab, onSettingsChange]);

  const fetchCurrencies = useCallback(async () => {
    try {
      logger.debug('Currency', `Fetching exchange rates for base: ${baseCurrency}`);
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (!response.ok) throw new Error('Currency fetch failed');

      const data = await response.json();
      logger.success('Currency', `Exchange rates fetched for ${baseCurrency}`);

      const currencyData: CurrencyData[] = [];

      for (const code of enabledCurrencies) {
        if (code === baseCurrency) continue;

        let rate: number;
        let name: string;

        if (code === 'XAU') {
          try {
            const goldResponse = await fetch('https://api.nbp.pl/api/cenyzlota?format=json');
            if (goldResponse.ok) {
              const goldData = await goldResponse.json();
              const goldPricePerGramPLN = goldData[0]?.cena || 0;

              if (baseCurrency === 'TRY') {
                const plnResponse = await fetch('https://api.exchangerate-api.com/v4/latest/PLN');
                if (plnResponse.ok) {
                  const plnData = await plnResponse.json();
                  const plnToTry = plnData.rates?.TRY || 8.8;
                  rate = goldPricePerGramPLN * plnToTry;
                } else {
                  continue;
                }
              } else {
                const plnResponse = await fetch('https://api.exchangerate-api.com/v4/latest/PLN');
                if (plnResponse.ok) {
                  const plnData = await plnResponse.json();
                  const plnToUsd = plnData.rates?.USD || 0.25;
                  rate = goldPricePerGramPLN * plnToUsd;
                } else {
                  continue;
                }
              }
            } else {
              const goldPriceUSD = 85;
              if (baseCurrency === 'TRY') {
                rate = goldPriceUSD * (data.rates?.USD ? (1 / data.rates.USD) : 35);
              } else {
                rate = goldPriceUSD;
              }
            }
          } catch {
            const goldPriceUSD = 85;
            if (baseCurrency === 'TRY') {
              rate = goldPriceUSD * (data.rates?.USD ? (1 / data.rates.USD) : 35);
            } else {
              rate = goldPriceUSD;
            }
          }
          name = isTurkish ? currencyInfo[code].nameTr : currencyInfo[code].name;
        } else if (baseCurrency === 'TRY' && data.rates[code]) {
          rate = 1 / data.rates[code];
          name = isTurkish ? currencyInfo[code].nameTr : currencyInfo[code].name;
        } else {
          rate = data.rates[code] || 0;
          name = isTurkish ? currencyInfo[code].nameTr : currencyInfo[code].name;
        }

        currencyData.push({
          code,
          name,
          rate,
          lastUpdated: new Date().toLocaleTimeString(locale),
        });
      }

      setCurrencies(currencyData);
      setLastUpdated(new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
      logger.success('Currency', `Loaded ${currencyData.length} currency rates`);
    } catch (err) {
      logger.error('Currency', 'Failed to fetch exchange rates', err);
      if (currencies.length === 0) {
        setError(t.currency.errorCurrency);
      }
    }
  }, [baseCurrency, enabledCurrencies, isTurkish, locale, t.currency.errorCurrency]);

  const fetchCryptos = useCallback(async () => {
    try {
      const ids = enabledCryptos.join(',');
      const vsCurrency = baseCurrency.toLowerCase() === 'try' ? 'try' : 'usd';

      logger.debug('Currency', `Fetching crypto prices for: ${ids} (vs ${vsCurrency})`);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency}&ids=${ids}&order=market_cap_desc&sparkline=${showSparkline}`
      );

      if (!response.ok) throw new Error('Crypto fetch failed');

      const data = await response.json();

      const cryptoData: CryptoData[] = data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        change24h: coin.price_change_percentage_24h || 0,
        changeDirection: coin.price_change_percentage_24h > 0 ? 'up' : coin.price_change_percentage_24h < 0 ? 'down' : 'neutral',
        sparkline: showSparkline && coin.sparkline_in_7d?.price ?
          coin.sparkline_in_7d.price.slice(-24) : undefined,
        lastUpdated: new Date().toLocaleTimeString(locale),
      }));

      setCryptos(cryptoData);
      setLastUpdated(new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }));
      logger.success('Currency', `Loaded ${cryptoData.length} crypto prices`);
    } catch (err) {
      logger.error('Currency', 'Failed to fetch crypto prices', err);
      if (cryptos.length === 0) {
        setError(t.currency.errorCrypto);
      }
    }
  }, [baseCurrency, enabledCryptos, isTurkish, locale, showSparkline]);

  useEffect(() => {
    const fetchData = async () => {
      if (currencies.length === 0 && cryptos.length === 0) {
        setLoading(true);
      }
      setError(null);

      if (activeTab === 'currency') {
        await fetchCurrencies();
      } else {
        await fetchCryptos();
      }

      setLoading(false);
    };

    fetchData();

    const interval = setInterval(fetchData, refreshMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [activeTab, fetchCurrencies, fetchCryptos, refreshMinutes]);

  const handleTabChange = (tab: 'currency' | 'crypto') => {
    setActiveTab(tab);
    onSettingsChange?.({ activeTab: tab });
  };

  const formatPrice = (price: number, code?: string): string => {
    if (code === 'XAU') {
      return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 1000) {
      return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 1) {
      return price.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }
    return price.toLocaleString(locale, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  };

  const renderSparkline = (data: number[] | undefined, direction: 'up' | 'down' | 'neutral') => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const width = 60;
    const height = 24;

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const color = direction === 'up' ? '#22c55e' : direction === 'down' ? '#ef4444' : '#6b7280';

    return (
      <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  if (loading && currencies.length === 0 && cryptos.length === 0) {
    return (
      <div className="currency-widget">
        <div className="currency-card">
          <div className="widget-header">
            <div className="widget-title">
              <svg className="widget-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="currentColor">
                <path fillRule="evenodd" d="M1.249 7.001a5.751 5.751 0 1 1 11.502 0a5.751 5.751 0 0 1-11.502 0M7 0a7.001 7.001 0 1 0 0 14.002A7.001 7.001 0 0 0 7 0m.625 3a.625.625 0 1 0-1.25 0v.709a1.815 1.815 0 0 0-.35 3.588l1.57.344a.709.709 0 0 1-.15 1.4h-.889a.71.71 0 0 1-.669-.471a.625.625 0 1 0-1.178.416a1.96 1.96 0 0 0 1.666 1.297V11a.625.625 0 0 0 1.25 0v-.716a1.96 1.96 0 0 0 .238-3.865l-1.571-.343a.565.565 0 0 1 .12-1.118h1.032a.705.705 0 0 1 .669.473a.625.625 0 1 0 1.178-.417a1.96 1.96 0 0 0-1.666-1.297z" clipRule="evenodd" />
              </svg>
              <span>{isTurkish ? 'Döviz & Kripto' : 'Currency & Crypto'}</span>
            </div>
          </div>
          <div className="widget-loading">
            <div className="loading-bar">
              <div className="loading-bar-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && currencies.length === 0 && cryptos.length === 0) {
    return (
      <div className="currency-widget">
        <div className="currency-card">
          <div className="currency-error">
            {WarningIcon}
            <p>{error}</p>
            <button onClick={() => activeTab === 'currency' ? fetchCurrencies() : fetchCryptos()}>
              {t.currency.tryAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="currency-widget">
      <div className="currency-card">
        <div className="widget-header">
          <div className="widget-title">
            <svg className="widget-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" fill="currentColor">
              <path fillRule="evenodd" d="M1.249 7.001a5.751 5.751 0 1 1 11.502 0a5.751 5.751 0 0 1-11.502 0M7 0a7.001 7.001 0 1 0 0 14.002A7.001 7.001 0 0 0 7 0m.625 3a.625.625 0 1 0-1.25 0v.709a1.815 1.815 0 0 0-.35 3.588l1.57.344a.709.709 0 0 1-.15 1.4h-.889a.71.71 0 0 1-.669-.471a.625.625 0 1 0-1.178.416a1.96 1.96 0 0 0 1.666 1.297V11a.625.625 0 0 0 1.25 0v-.716a1.96 1.96 0 0 0 .238-3.865l-1.571-.343a.565.565 0 0 1 .12-1.118h1.032a.705.705 0 0 1 .669.473a.625.625 0 1 0 1.178-.417a1.96 1.96 0 0 0-1.666-1.297z" clipRule="evenodd" />
            </svg>
            <span>{t.currency.title}</span>
          </div>
        </div>
        <div className="currency-header">
          <div className="currency-tabs">
            {hasCurrencies && (
              <button
                className={`currency-tab ${activeTab === 'currency' ? 'active' : ''}`}
                onClick={() => handleTabChange('currency')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M7 15h2c0 1.08 1.37 2 3 2s3-.92 3-2c0-1.1-1.04-1.5-3.24-2.03C9.64 12.44 7 11.78 7 9c0-1.79 1.47-3.31 3.5-3.82V3h3v2.18C15.53 5.69 17 7.21 17 9h-2c0-1.08-1.37-2-3-2s-3 .92-3 2c0 1.1 1.04 1.5 3.24 2.03C14.36 11.56 17 12.22 17 15c0 1.79-1.47 3.31-3.5 3.82V21h-3v-2.18C8.47 18.31 7 16.79 7 15" /></svg>
                <span>{t.currency.tabCurrency}</span>
              </button>
            )}
            {hasCryptos && (
              <button
                className={`currency-tab ${activeTab === 'crypto' ? 'active' : ''}`}
                onClick={() => handleTabChange('crypto')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="currentColor" d="M18.763 10.236c.279-1.895-1.155-2.905-3.131-3.591l.64-2.553l-1.56-.389l-.623 2.49l-1.245-.297l.631-2.508L11.915 3l-.641 2.562l-.992-.234v-.01l-2.157-.54l-.415 1.668s1.155.272 1.137.28c.631.163.74.578.722.903l-.723 2.923l.163.054l-.171-.036l-1.02 4.087c-.072.19-.27.478-.712.36c.018.028-1.128-.27-1.128-.27l-.776 1.778l2.03.505l1.11.289l-.65 2.59l1.56.387l.633-2.562l1.253.324l-.64 2.554l1.56.388l.641-2.59c2.662.505 4.665.307 5.505-2.102c.676-1.94-.037-3.05-1.435-3.79c1.02-.225 1.786-.902 1.985-2.282zm-3.564 4.999c-.479 1.94-3.745.884-4.8.63l.857-3.436c1.055.27 4.448.784 3.943 2.796zm.478-5.026c-.433 1.76-3.158.866-4.033.65l.775-3.113c.885.217 3.718.632 3.258 2.463" /></svg>
                <span>{t.currency.tabCrypto}</span>
              </button>
            )}
          </div>
          {lastUpdated && (
            <span className="currency-last-updated">{lastUpdated}</span>
          )}
        </div>

        <div className="currency-grid">
          {activeTab === 'currency' ? (
            currencies.map((currency) => (
              <div key={currency.code} className="currency-item" data-currency={currency.code}>
                <div className="currency-item-icon" dangerouslySetInnerHTML={{ __html: currencyIcons[currency.code] || `<span>${currency.code}</span>` }} />
                <div className="currency-item-info">
                  <span className="currency-item-name">{currency.name}</span>
                  <span className="currency-item-code">{currency.code}/{baseCurrency}</span>
                </div>
                <span className="currency-item-rate">
                  {currencyInfo[baseCurrency]?.symbol}{formatPrice(currency.rate, currency.code)}
                </span>
                {currency.change !== undefined && (
                  <span className={`currency-item-change ${currency.changeDirection}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {currency.changeDirection === 'up' ? (
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      ) : currency.changeDirection === 'down' ? (
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      ) : (
                        <path d="M5 12h14" />
                      )}
                    </svg>
                    {Math.abs(currency.change).toFixed(2)}%
                  </span>
                )}
              </div>
            ))
          ) : (
            cryptos.map((crypto) => (
              <div key={crypto.id} className="currency-item" data-crypto={crypto.id}>
                <div className="currency-item-icon" dangerouslySetInnerHTML={{ __html: cryptoIcons[crypto.id] || `<span>${crypto.symbol}</span>` }} />
                <div className="currency-item-info">
                  <span className="currency-item-name">{crypto.name}</span>
                  <span className="currency-item-code">{crypto.symbol}</span>
                </div>
                <span className="currency-item-rate">
                  {baseCurrency === 'TRY' ? '₺' : '$'}{formatPrice(crypto.price)}
                </span>
                <span className={`currency-item-change ${crypto.changeDirection}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {crypto.changeDirection === 'up' ? (
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    ) : crypto.changeDirection === 'down' ? (
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    ) : (
                      <path d="M5 12h14" />
                    )}
                  </svg>
                  {Math.abs(crypto.change24h).toFixed(2)}%
                </span>
                {showSparkline && crypto.sparkline && (
                  <div className="currency-sparkline">
                    {renderSparkline(crypto.sparkline, crypto.changeDirection)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
