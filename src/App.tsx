declare const chrome: any;

import { useState, useEffect, useRef } from 'react';
import { Clock } from './components/Clock/Clock';
import { SearchBar } from './components/SearchBar/SearchBar';
import { QuickLinks } from './components/QuickLinks/QuickLinks';
import { SettingsButton } from './components/SettingsButton/SettingsButton';
import { SettingsPanel } from './components/SettingsPanel/SettingsPanel';
import { Quotes } from './components/Quotes/Quotes';
import { Weather } from './components/Weather/Weather';
import { Currency } from './components/Currency/Currency';
import { StickyNotes } from './components/StickyNotes/StickyNotes';
import { RSS } from './components/RSS/RSS';
import { SecretLinks } from './components/SecretLinks/SecretLinks';
import { GoogleShortcuts } from './components/GoogleShortcuts/GoogleShortcuts';
import { IntroModal } from './components/IntroModal/IntroModal';
import { UserGuide } from './components/UserGuide/UserGuide';
import { WhatsNew } from './components/WhatsNew/WhatsNew';
import { loadSettings, saveSettings } from './services/storage';
import { applyTheme, getTheme } from './utils/themeUtils';
import { imageStorage } from './services/imageStorage';
import { logger } from './utils/logger';
import type { Settings, QuickLink, StickyNote } from './types/settings';
import './App.css';

function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    const loadedSettings = loadSettings();
    logger.info('App', 'Settings loaded from localStorage');
    return loadedSettings;
  });

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
  const [isSecretLinksOpen, setIsSecretLinksOpen] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [themeReady, setThemeReady] = useState(false);
  const [rssStats, setRssStats] = useState<{
    feeds: number;
    items: number;
    success: number;
    error: number;
    empty: number;
    lastUpdated: string;
    failedFeeds?: string[];
  } | undefined>(undefined);
  const hasRandomizedRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const loadBackground = async () => {
      if (hasRandomizedRef.current) return;
      hasRandomizedRef.current = true;

      const imageIds = settings.background.imageIds || [];

      if (settings.background.randomMode && imageIds.length > 0) {
        logger.info('Background', `Random mode enabled, selecting from ${imageIds.length} images`);
        const lastShownId = localStorage.getItem('hotpage_lastShownImageId');
        let availableIds = imageIds.filter(id => id !== lastShownId);
        if (availableIds.length === 0) availableIds = imageIds;
        const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
        logger.debug('Background', `Selected random image: ${randomId}`);
        const randomUrl = await imageStorage.getImage(randomId);

        if (randomUrl) {
          localStorage.setItem('hotpage_lastShownImageId', randomId);
          setBackgroundUrl(randomUrl);
          setSettings(prev => ({
            ...prev,
            background: {
              ...prev.background,
              type: 'image',
              value: randomUrl,
              currentImageId: randomId,
            },
          }));
          logger.success('Background', 'Random background applied');
        }
        setTimeout(() => { isInitialLoadRef.current = false; }, 100);
        return;
      }

      if (settings.background.type === 'image' && settings.background.currentImageId) {
        logger.debug('Background', `Loading saved image: ${settings.background.currentImageId}`);
        const url = await imageStorage.getImage(settings.background.currentImageId);
        if (url) {
          setBackgroundUrl(url);
          logger.success('Background', 'Saved background loaded');
        }
      }
      setTimeout(() => { isInitialLoadRef.current = false; }, 100);
    };

    loadBackground();
  }, []);

  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const updateBackground = async () => {
      if (settings.background.type === 'image' && settings.background.currentImageId) {
        const url = await imageStorage.getImage(settings.background.currentImageId);
        if (url && url !== backgroundUrl) {
          setBackgroundUrl(url);
        }
      } else if (settings.background.type !== 'image') {
        setBackgroundUrl(null);
      }
    };

    updateBackground();
  }, [settings.background.currentImageId, settings.background.type]);

  useEffect(() => {
    const theme = getTheme(settings.theme, settings.customThemeColors);
    applyTheme(theme);
    setThemeReady(true);
  }, [settings.theme, settings.customThemeColors]);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      logger.debug('Storage', 'Saving settings to localStorage (debounced)');
      saveSettings(settings);
      logger.success('Storage', 'Settings saved successfully');
    }, 100);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings]);

  const CURRENT_VERSION = 'v1.4.0';
  useEffect(() => {
    const lastSeenVersion = localStorage.getItem('hotpage-last-seen-version');
    if (lastSeenVersion !== CURRENT_VERSION && settings.introSeen) {
      setShowWhatsNew(true);
    }
  }, [settings.introSeen]);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) return;


    const handleStorageChange = (changes: { [key: string]: { oldValue?: unknown; newValue?: unknown } }, areaName: string) => {
      if (areaName !== 'local') return;



      const STORAGE_KEY = 'hotpage-settings';
      if (changes[STORAGE_KEY]?.newValue) {
        const newSettings = changes[STORAGE_KEY].newValue as Settings;
        if (newSettings.stickyNote) {
          logger.debug('App', 'Syncing stickyNote from chrome.storage');
          setSettings(prev => ({
            ...prev,
            stickyNote: newSettings.stickyNote
          }));
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.onMessage) return;

    const messageListener = (message: any) => {
      if (message.type === 'TOGGLE_STICKY') {
        logger.info('App', 'Toggle Sticky Notes command received');
        setIsStickyNotesOpen(prev => !prev);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const shortcut = settings.quickActions?.stickyNoteShortcut || 'Alt+N';
      const parts = shortcut.split('+').map(p => p.trim().toLowerCase());
      const key = parts[parts.length - 1];
      const needsShift = parts.includes('shift');
      const needsCtrl = parts.includes('ctrl') || parts.includes('control');
      const needsAlt = parts.includes('alt');

      const keyMatches = e.key.toLowerCase() === key;
      const modifiersMatch =
        e.shiftKey === needsShift &&
        e.ctrlKey === needsCtrl &&
        e.altKey === needsAlt;

      if (keyMatches && modifiersMatch) {
        e.preventDefault();
        setIsStickyNotesOpen(prev => !prev);
      }

      if (e.key === 'Escape') {
        if (isStickyNotesOpen) setIsStickyNotesOpen(false);
        if (isSecretLinksOpen) setIsSecretLinksOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStickyNotesOpen, isSecretLinksOpen, settings.quickActions?.stickyNoteShortcut]);

  useEffect(() => {
    if (!settings.secretLinks?.enabled) return;

    let buffer = '';
    let timeout: number;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        isSettingsOpen ||
        isStickyNotesOpen) {
        return;
      }

      buffer += e.key.toLowerCase();

      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        buffer = '';
      }, 2000);

      const triggerKeyword = settings.secretLinks?.triggerKeyword?.toLowerCase() ?? '';
      if (!triggerKeyword) return;
      if (buffer.includes(triggerKeyword)) {
        setIsSecretLinksOpen(true);
        buffer = '';
      }

      if (buffer.length > 20) {
        buffer = buffer.slice(-20);
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, [settings.secretLinks?.enabled, settings.secretLinks?.triggerKeyword, isSettingsOpen, isStickyNotesOpen]);




  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const merged: Settings = { ...prev };
      for (const key in updates) {
        const value = updates[key as keyof Settings];
        const prevValue = prev[key as keyof Settings];
        if (value && typeof value === 'object' && !Array.isArray(value) &&
          prevValue && typeof prevValue === 'object' && !Array.isArray(prevValue)) {
          (merged as any)[key] = {
            ...prevValue,
            ...value,
          };
        } else {
          (merged as any)[key] = value;
        }
      }
      return merged;
    });
  };

  const handleLinksChange = (links: QuickLink[]) => {
    updateSettings({ quickLinks: links });
  };

  const handleIntroSkip = () => {
    updateSettings({ introSeen: true });
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  const handleTourComplete = () => {
    setIsTourOpen(false);
    updateSettings({ introSeen: true });
  };

  const handleStickyNoteChange = (note: StickyNote | null) => {
    updateSettings({ stickyNote: note || undefined });
  };



  const getBackgroundStyle = (): React.CSSProperties => {
    const { background } = settings;

    if (background.type === 'solid') {
      return { backgroundColor: background.value };
    }

    if (background.type === 'gradient') {
      return { background: background.value };
    }

    // Local images from IndexedDB
    if (background.type === 'image' && backgroundUrl) {
      return {
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    // Online images (URL stored in background.value)
    const isOnlineWallpaper = background.type === 'unsplash' || 
      background.type === 'nasa' || 
      background.type === 'picsum' || 
      background.type === 'istanbul' || 
      background.type === 'space' || 
      background.type === 'ocean';

    if (isOnlineWallpaper && background.value) {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }

    return {};
  };

  const getOverlayStyle = (): React.CSSProperties => {
    const { background } = settings;

    if (!themeReady) {
      return { backgroundColor: 'transparent' };
    }

    const hasWallpaper = background.type === 'image' ||
      background.type === 'unsplash' ||
      background.type === 'nasa' ||
      background.type === 'picsum' ||
      background.type === 'istanbul' ||
      background.type === 'space' ||
      background.type === 'ocean';

    const rawOpacity = hasWallpaper
      ? (background.opacity !== undefined ? background.opacity / 100 : 0.1)
      : 1;
    const opacity = Math.min(Math.max(rawOpacity, 0), 1);

    const backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim() || '#ffffff';

    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return {
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${opacity})`,
    };
  };

  const getContentStyle = (): React.CSSProperties => {
    const { background } = settings;
    const blur = background.blur || 0;

    if (blur > 0 && (background.type === 'image' || background.type === 'unsplash' || background.type === 'nasa' || background.type === 'picsum' || background.type === 'istanbul' || background.type === 'space' || background.type === 'ocean')) {
      return {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
      };
    }

    return {};
  };

  return (
    <div className="app">
      <div className="app-background" style={getBackgroundStyle()}>
        <div className="app-background-overlay" style={getOverlayStyle()}></div>
      </div>
      <div className="app-content" style={getContentStyle()}>
        <SettingsButton onOpenSettings={() => setIsSettingsOpen(true)} />

        {settings.googleShortcuts?.enabled && (
          <GoogleShortcuts
            showGmail={settings.googleShortcuts?.showGmail ?? true}
            showAppsMenu={settings.googleShortcuts?.showAppsMenu ?? true}
          />
        )}

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={updateSettings}
          onOpenStickyNotes={() => {
            setIsSettingsOpen(false);
            setIsStickyNotesOpen(true);
          }}
          rssStats={rssStats}
        />

        {isStickyNotesOpen && (
          <StickyNotes
            note={settings.stickyNote || null}
            onNoteChange={handleStickyNoteChange}
            defaultTodos={settings.todos}
            shortcut={settings.quickActions?.stickyNoteShortcut || 'Alt+N'}
          />
        )}

        {settings.widgets.quotes?.enabled && (
          <div className="widgets-top">
            <Quotes locale={settings.locale} />
          </div>
        )}

        <div className="spacer" />

        <div className="container">
          <Clock locale={settings.locale} />

          <SearchBar />

          <QuickLinks
            links={settings.quickLinks}
            onLinksChange={handleLinksChange}
            spacingWidgetEnabled={settings.quickLinksSpacingWidget ?? true}
          />
        </div>

        <div className="spacer" />

        <div className="widgets-bottom">
          {(settings.widgetOrder || ['weather', 'currency', 'rss']).filter(id => id !== 'quotes').map((widgetId) => {
            if (widgetId === 'rss' && settings.widgets.rss?.enabled) {
              return (
                <RSS
                  key="rss"
                  locale={settings.locale}
                  settings={settings.widgets.rss?.settings as any}
                  onStatsUpdate={setRssStats}
                />
              );
            }

            if (widgetId === 'weather' && settings.widgets.weather?.enabled) {
              return (
                <Weather
                  key="weather"
                  locale={settings.locale}
                  manualLocation={(settings.widgets.weather?.settings as { manualLocation?: string; refreshMinutes?: number })?.manualLocation}
                  refreshMinutes={(settings.widgets.weather?.settings as { manualLocation?: string; refreshMinutes?: number })?.refreshMinutes}
                />
              );
            }

            if (widgetId === 'currency' && settings.widgets.currency?.enabled) {
              return (
                <Currency
                  key="currency"
                  locale={settings.locale}
                  settings={settings.widgets.currency?.settings as {
                    baseCurrency?: string;
                    activeTab?: 'currency' | 'crypto';
                    enabledCurrencies?: string[];
                    enabledCryptos?: string[];
                    showSparkline?: boolean;
                  }}
                  onSettingsChange={(currencySettings) => {
                    const currentWidget = settings.widgets.currency || { enabled: true };
                    updateSettings({
                      widgets: {
                        ...settings.widgets,
                        currency: {
                          ...currentWidget,
                          settings: {
                            ...(currentWidget.settings || {}),
                            ...currencySettings,
                          },
                        },
                      },
                    });
                  }}
                />
              );
            }

            return null;
          })}
        </div>
      </div>

      <IntroModal
        isOpen={!settings.introSeen && !isTourOpen}
        locale={settings.locale}
        onSkip={handleIntroSkip}
        onStartTour={handleStartTour}
      />

      <UserGuide
        isOpen={isTourOpen}
        onComplete={handleTourComplete}
        locale={settings.locale || ''}
        onOpenStickyNotes={() => setIsStickyNotesOpen(true)}
        onCloseStickyNotes={() => setIsStickyNotesOpen(false)}
      />

      {showWhatsNew && (
        <WhatsNew
          currentVersion={CURRENT_VERSION}
          locale={settings.locale || 'en'}
          onClose={() => {
            setShowWhatsNew(false);
            localStorage.setItem('hotpage-last-seen-version', CURRENT_VERSION);
          }}
        />
      )}

      {isSecretLinksOpen && settings.secretLinks && (
        <SecretLinks
          settings={settings.secretLinks}
          locale={settings.locale}
          onClose={() => setIsSecretLinksOpen(false)}
          onSettingsChange={(secretLinksSettings) => {
            updateSettings({ secretLinks: secretLinksSettings });
          }}
        />
      )}
    </div>
  );
}

export default App;
