declare const chrome: any;

import { useEffect, useMemo, useState, useCallback } from 'react';
import { getTranslations } from '../../data/translations';
import './RSS.css';
import { logger } from '../../utils/logger';
import { uiIcons } from '../../data/icons';

interface FeedConfig {
  url: string;
  category: string;
}

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  imageUrl?: string;
  category: string;
}

interface RSSProps {
  locale?: string;
  settings?: {
    feeds?: (string | FeedConfig)[];
    maxItems?: number;
    refreshMinutes?: number;
  };
  onStatsUpdate?: (stats: {
    feeds: number;
    items: number;
    success: number;
    error: number;
    empty: number;
    lastUpdated: string;
    failedFeeds?: string[];
  }) => void;
}

const WarningIcon = ({ title }: { title?: string }) => (
  <span
    className="rss-error-indicator"
    role="img"
    aria-label="Warning"
    title={title}
    dangerouslySetInnerHTML={{ __html: uiIcons.warning }}
  />
);

const defaultFeeds: FeedConfig[] = [];

const extractImage = (node: Element, description: string): string | undefined => {
  const enclosure = node.querySelector('enclosure[type^="image"]');
  if (enclosure) {
    const url = enclosure.getAttribute('url');
    return url ? url.replace(/^http:/, 'https:') : undefined;
  }

  const mediaContent = node.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'content')[0];
  if (mediaContent) {
    const url = mediaContent.getAttribute('url');
    return url ? url.replace(/^http:/, 'https:') : undefined;
  }

  const mediaThumbnail = node.getElementsByTagNameNS('http://search.yahoo.com/mrss/', 'thumbnail')[0];
  if (mediaThumbnail) {
    const url = mediaThumbnail.getAttribute('url');
    return url ? url.replace(/^http:/, 'https:') : undefined;
  }

  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = imgRegex.exec(description);
  if (match) return match[1].replace(/^http:/, 'https:');

  return undefined;
};

const parseRss = (xml: string, feedUrl: string, category: string): RSSItem[] => {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`Invalid RSS XML from ${feedUrl}: ${parseError.textContent?.slice(0, 100)}`);
  }

  const items = Array.from(doc.querySelectorAll('item, entry'));
  const host = (() => {
    try {
      return new URL(feedUrl).hostname.replace(/^www\./, '');
    } catch {
      return 'feed';
    }
  })();

  return items.map((node) => {
    const title = node.querySelector('title')?.textContent?.trim() || 'Untitled';
    const link =
      node.querySelector('link')?.getAttribute('href') ||
      node.querySelector('link')?.textContent ||
      feedUrl;
    const pubRaw =
      node.querySelector('pubDate')?.textContent ||
      node.querySelector('updated')?.textContent ||
      node.querySelector('dc\:date')?.textContent ||
      '';
    const pubDate = pubRaw ? new Date(pubRaw).toISOString() : new Date().toISOString();
    const description = node.querySelector('description')?.textContent ||
      node.querySelector('summary')?.textContent || '';

    const imageUrl = extractImage(node, description);

    return {
      title,
      link,
      pubDate,
      source: host,
      description,
      imageUrl,
      category,
    };
  });
};

export const RSS = ({ locale = 'en-US', settings, onStatsUpdate }: RSSProps) => {
  const t = getTranslations(locale);
  const feeds = useMemo(() => {
    const list = settings?.feeds?.filter(Boolean) || [];
    if (list.length === 0) {
      logger.info('RSS', 'No custom feeds configured, using defaults');
      return defaultFeeds;
    }

    const normalized = list.map(f => {
      if (typeof f === 'string') return { url: f, category: 'General' };
      return f;
    });

    const seen = new Set<string>();
    const unique = normalized.filter(feed => {
      if (seen.has(feed.url)) {
        logger.warning('RSS', `Duplicate feed removed: ${feed.url}`);
        return false;
      }
      seen.add(feed.url);
      return true;
    });

    logger.info('RSS', `Configured feeds: ${unique.length} (removed ${normalized.length - unique.length} duplicates)`);
    return unique;
  }, [settings?.feeds]);

  const maxItems = settings?.maxItems ?? 150;
  const refreshMinutes = settings?.refreshMinutes ?? 15;

  const getCachedRSS = (): RSSItem[] => {
    try {
      const cached = localStorage.getItem('hotpage_rss_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          logger.info('RSS', `Loaded ${data.length} items from cache`);
          return data;
        }
      }
    } catch (e) {
    }
    return [];
  };

  const getCachedLastUpdated = (): string => {
    try {
      const cached = localStorage.getItem('hotpage_rss_cache');
      if (cached) {
        const { lastUpdated, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return lastUpdated || '';
        }
      }
    } catch (e) {
    }
    return '';
  };

  const setCachedRSS = (data: RSSItem[], lastUpdated: string) => {
    try {
      localStorage.setItem('hotpage_rss_cache', JSON.stringify({
        data,
        lastUpdated,
        timestamp: Date.now()
      }));
    } catch (e) {
    }
  };

  const [items, setItems] = useState<RSSItem[]>(getCachedRSS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(t.rss.categoryAll);
  const [hasError, setHasError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(getCachedLastUpdated);

  const categories = useMemo(() => {
    const cats = new Set(feeds.map(f => f.category));
    return [t.rss.categoryAll, ...Array.from(cats).sort()];
  }, [feeds, t.rss.categoryAll]);

  useEffect(() => {
    setActiveCategory((prev) => {
      if (prev === t.rss.categoryAll) return prev;
      return categories.includes(prev) ? prev : t.rss.categoryAll;
    });
  }, [categories, t.rss.categoryAll]);

  const fetchFeed = useCallback(async (feedUrl: string) => {
    const isExtension = typeof chrome !== 'undefined' &&
      chrome.runtime &&
      chrome.runtime.id &&
      typeof chrome.runtime.sendMessage === 'function';

    const fetchWithFallback = async (url: string): Promise<string> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const doFetch = async (fetchUrl: string) => {
        const res = await fetch(fetchUrl, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!text.trim().startsWith('<')) throw new Error('Invalid RSS format');
        return text;
      };

      try {
        const text = await doFetch(url);
        clearTimeout(timeoutId);
        return text;
      } catch (err) {
        const error = err as Error;
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          logger.debug('RSS', `Direct fetch failed, trying CORS proxy for ${url}...`);
          try {
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
            const text = await doFetch(proxyUrl);
            clearTimeout(timeoutId);
            logger.success('RSS', `Fetched ${url} via proxy`);
            return text;
          } catch (proxyErr) {
            clearTimeout(timeoutId);
            throw proxyErr;
          }
        }
        clearTimeout(timeoutId);
        throw error;
      }
    };

    if (isExtension) {
      logger.info('RSS', `Using background worker for ${feedUrl}`);
      return new Promise<string>((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: 'FETCH_RSS', url: feedUrl },
          (response: { success: boolean; data?: string; error?: string }) => {
            if (chrome.runtime.lastError) {
              logger.warning('RSS', `Background worker unavailable, using fallback for ${feedUrl}`);
              fetchWithFallback(feedUrl)
                .then(resolve)
                .catch(reject);
              return;
            }
            if (response && response.success && response.data) {
              logger.success('RSS', `Fetched ${feedUrl} via background worker`);
              resolve(response.data);
            } else {
              logger.warning('RSS', `Background worker failed, using fallback for ${feedUrl}`);
              fetchWithFallback(feedUrl)
                .then(resolve)
                .catch(reject);
            }
          }
        );
      });
    }

    logger.warning('RSS', `Not in extension context, using direct fetch for ${feedUrl}`);
    return fetchWithFallback(feedUrl);
  }, []);

  const refresh = useCallback(async () => {
    if (feeds.length === 0) {
      logger.info('RSS', 'No feeds configured');
      setItems([]);
      setLoading(false);
      return;
    }

    logger.time('RSS refresh');
    logger.widget('RSS', `Refreshing ${feeds.length} feeds...`);
    if (items.length === 0) {
      setLoading(true);
    }
    const allItems: RSSItem[] = [];
    let errors = 0;
    let empties = 0;
    let successes = 0;
    const failedFeeds: string[] = [];

    await Promise.all(
      feeds.map(async (feed) => {
        try {
          const xml = await fetchFeed(feed.url);
          const parsed = parseRss(xml, feed.url, feed.category);
          if (parsed.length === 0) {
            empties += 1;
            logger.warning('RSS', `Feed ${feed.url} returned 0 items`);
          } else {
            successes += 1;
            logger.success('RSS', `Parsed ${parsed.length} items from ${feed.url} (category: ${feed.category})`);
            allItems.push(...parsed);
          }
        } catch (err) {
          errors += 1;
          failedFeeds.push(feed.url);
          logger.error('RSS', `Failed to fetch ${feed.url}`, err);
        }
      })
    );

    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    let finalItems: RSSItem[] = [];

    if (allItems.length <= maxItems) {
      finalItems = allItems;
    } else {
      const categoryGroups: Record<string, RSSItem[]> = {};
      allItems.forEach(item => {
        if (!categoryGroups[item.category]) {
          categoryGroups[item.category] = [];
        }
        categoryGroups[item.category].push(item);
      });

      const categories = Object.keys(categoryGroups);
      const itemsPerCategory = Math.floor(maxItems / categories.length);
      const remainder = maxItems % categories.length;

      categories.forEach((cat, idx) => {
        const items = categoryGroups[cat];
        const limit = itemsPerCategory + (idx < remainder ? 1 : 0);
        finalItems.push(...items.slice(0, limit));
      });

      finalItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    }

    const categoryCount: Record<string, number> = {};
    allItems.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    logger.debug('RSS', `Total items before slicing: ${allItems.length}, after: ${finalItems.length}`);
    logger.debug('RSS', 'Category distribution:', categoryCount);

    setItems(finalItems);
    setHasError(errors > 0);

    const newLastUpdated = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    const newStats = {
      feeds: feeds.length,
      items: finalItems.length,
      success: successes,
      error: errors,
      empty: empties,
      lastUpdated: newLastUpdated,
      failedFeeds: failedFeeds.length > 0 ? failedFeeds : undefined,
    };

    setLastUpdated(newLastUpdated);

    setCachedRSS(finalItems, newLastUpdated);

    logger.groupCollapsed('RSS Refresh Summary', () => {
      logger.table('RSS', newStats);
      if (failedFeeds.length > 0) {
        logger.error('RSS', 'Failed feeds:', failedFeeds);
      }
    });

    onStatsUpdate?.(newStats);
    logger.timeEnd('RSS refresh');
    setLoading(false);
  }, [feeds, fetchFeed, maxItems, locale, onStatsUpdate]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshMinutes * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh, refreshMinutes]);

  const filteredItems = useMemo(() => {
    if (activeCategory === t.rss.categoryAll) {
      logger.debug('RSS', `Showing all ${items.length} items`);
      return items;
    }
    const filtered = items.filter(item => item.category === activeCategory);
    logger.debug('RSS', `Category '${activeCategory}': ${filtered.length} items`);
    return filtered;
  }, [items, activeCategory, t.rss.categoryAll]);

  if (loading && items.length === 0) {
    return (
      <div className="rss-widget">
        <div className="widget-header">
          <div className="widget-title">
            <svg className="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" />
              <path d="M4 4a16 16 0 0 1 16 16" />
              <circle cx="5" cy="19" r="1" />
            </svg>
            <span>{t.rss.title}</span>
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

  return (
    <div className="rss-widget">
      <div className="widget-header">
        <div className="widget-title">
          <svg className="widget-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 11a9 9 0 0 1 9 9" />
            <path d="M4 4a16 16 0 0 1 16 16" />
            <circle cx="5" cy="19" r="1" />
          </svg>
          <span>{t.rss.title}</span>
          {hasError && <WarningIcon title={t.rss.errorTooltip} />}
        </div>
        {lastUpdated && (
          <span className="rss-last-updated">{lastUpdated}</span>
        )}
      </div>
      <div className="rss-header">

        {/* Categories */}
        <div className="rss-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`rss-category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          className={`rss-refresh ${hasError ? 'rss-refresh-error' : ''}`}
          onClick={refresh}
          aria-label="Refresh News"
          title={hasError ? 'Refresh (some feeds failed)' : 'Refresh'}
        >
          ↻
        </button>
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="rss-empty">
          {activeCategory === t.rss.categoryAll
            ? `${t.rss.noItems} Total items loaded: ${items.length}`
            : `${t.rss.noItemsCategory} "${activeCategory}". Try selecting "${t.rss.categoryAll}" or another category.`
          }
        </div>
      )}

      <div className="rss-list">
        {filteredItems.map((item, idx) => (
          <a
            key={`${item.link}-${idx}`}
            className="rss-item"
            href={item.link}
            target="_blank"
            rel="noreferrer"
          >
            <div className="rss-item-image">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.removeAttribute('style');
                }} />
              ) : null}
              <div className="rss-fallback-icon" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
            </div>
            <div className="rss-item-content">
              <div className="rss-item-title">{item.title}</div>
              <div className="rss-item-meta">
                <span className="rss-source">{item.source}</span>
                <span className="rss-sep">•</span>
                <span className="rss-date">{new Date(item.pubDate).toLocaleString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
