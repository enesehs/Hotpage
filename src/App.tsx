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
import { IntroModal } from './components/IntroModal/IntroModal';
import { loadSettings, saveSettings } from './services/storage';
import { applyTheme, getTheme } from './utils/themeUtils';
import { imageStorage } from './services/imageStorage';
import { playPomodoroSound } from './utils/pomodoroSound';
import { logger } from './utils/logger';
import type { Settings, QuickLink, StickyNote } from './types/settings';
import './App.css';

function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    const loadedSettings = loadSettings();
    logger.info('App', 'Settings loaded from localStorage');
    // Don't load background image here, it will be loaded in useEffect
    // This prevents showing the old wallpaper before randomizing
    return loadedSettings;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStickyNotesOpen, setIsStickyNotesOpen] = useState(false);
  const [isSecretLinksOpen, setIsSecretLinksOpen] = useState(false);
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
      // Prevent running twice in React Strict Mode
      if (hasRandomizedRef.current) return;
      hasRandomizedRef.current = true;
      
      const imageIds = settings.background.imageIds || [];
      
      // Auto-randomize: pick random wallpaper on page load (only once)
      if (settings.background.randomMode && imageIds.length > 0) {
        logger.info('Background', `Random mode enabled, selecting from ${imageIds.length} images`);
        // Get last shown image from localStorage to avoid showing same image
        const lastShownId = localStorage.getItem('hotpage_lastShownImageId');
        let availableIds = imageIds.filter(id => id !== lastShownId);
        // If only one image or all filtered out, use all images
        if (availableIds.length === 0) availableIds = imageIds;
        const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
        logger.debug('Background', `Selected random image: ${randomId}`);
        const randomUrl = await imageStorage.getImage(randomId);
        
        if (randomUrl) {
          // Save this image ID so it won't be shown next time
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
        // Mark initial load complete after state update
        setTimeout(() => { isInitialLoadRef.current = false; }, 100);
        return;
      }

      // Load saved background (only if not randomizing)
      if (settings.background.type === 'image' && settings.background.currentImageId) {
        logger.debug('Background', `Loading saved image: ${settings.background.currentImageId}`);
        const url = await imageStorage.getImage(settings.background.currentImageId);
        if (url) {
          setBackgroundUrl(url);
          logger.success('Background', 'Saved background loaded');
        }
      }
      // Mark initial load complete
      setTimeout(() => { isInitialLoadRef.current = false; }, 100);
    };

    loadBackground();
  }, []);

  // Update background when user manually changes wallpaper (grid click or randomize button)
  useEffect(() => {
    // Skip during initial load to prevent double update
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
    // Apply theme on mount and when theme changes
    const theme = getTheme(settings.theme, settings.customThemeColors);
    applyTheme(theme);
    // Set theme ready immediately after applying
    setThemeReady(true);
  }, [settings.theme, settings.customThemeColors]);

  useEffect(() => {
    // Debounce save settings to prevent recursion
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

  // Keyboard shortcut: N to toggle sticky notes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // N key to toggle sticky notes
      if (e.key === 'n' || e.key === 'N') {
        setIsStickyNotesOpen(prev => !prev);
      }
      
      // Escape to close sticky notes or secret links
      if (e.key === 'Escape') {
        if (isStickyNotesOpen) setIsStickyNotesOpen(false);
        if (isSecretLinksOpen) setIsSecretLinksOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isStickyNotesOpen, isSecretLinksOpen]);

  // Secret links keyboard trigger
  useEffect(() => {
    if (!settings.secretLinks?.enabled) return;

    let buffer = '';
    let timeout: number;

    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea or if settings/sticky notes is open
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          isSettingsOpen ||
          isStickyNotesOpen) {
        return;
      }

      // Add character to buffer
      buffer += e.key.toLowerCase();
      
      // Clear buffer after 2 seconds of inactivity
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        buffer = '';
      }, 2000);

      // Check if buffer matches trigger keyword
      const triggerKeyword = settings.secretLinks?.triggerKeyword?.toLowerCase() ?? '';
      if (!triggerKeyword) return;
      if (buffer.includes(triggerKeyword)) {
        setIsSecretLinksOpen(true);
        buffer = ''; // Reset buffer
      }

      // Keep buffer length reasonable
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

  // Global Pomodoro timer - runs even when sticky notes is closed
  useEffect(() => {
    const stickyNote = settings.stickyNote;
    if (!stickyNote?.pomodoro?.isRunning || stickyNote.pomodoro.timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setSettings(prev => {
        const note = prev.stickyNote;
        if (!note?.pomodoro?.isRunning) return prev;

        const newTimeLeft = note.pomodoro.timeLeft - 1;

        if (newTimeLeft <= 0) {
          // Timer completed - play sound
          playPomodoroSound();

          const nextMode = note.pomodoro.mode === 'work'
            ? (note.pomodoro.sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
            : 'work';

          const nextDuration = nextMode === 'work'
            ? note.pomodoro.workDuration * 60
            : nextMode === 'shortBreak'
              ? note.pomodoro.shortBreakDuration * 60
              : note.pomodoro.longBreakDuration * 60;

          return {
            ...prev,
            stickyNote: {
              ...note,
              pomodoro: {
                ...note.pomodoro,
                isRunning: false,
                mode: nextMode,
                timeLeft: nextDuration,
                sessionsCompleted: note.pomodoro.mode === 'work'
                  ? note.pomodoro.sessionsCompleted + 1
                  : note.pomodoro.sessionsCompleted,
              },
            },
          };
        }

        return {
          ...prev,
          stickyNote: {
            ...note,
            pomodoro: {
              ...note.pomodoro,
              timeLeft: newTimeLeft,
            },
          },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.stickyNote?.pomodoro?.isRunning, settings.stickyNote?.pomodoro?.timeLeft]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      // Deep merge for nested objects
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

  const handleStickyNoteChange = (stickyNote: StickyNote | null) => {
    updateSettings({ stickyNote });
  };

  const handleIntroSkip = () => {
    updateSettings({ introSeen: true });
  };

  // Generate background style based on settings
  const getBackgroundStyle = (): React.CSSProperties => {
    const { background } = settings;
    
    switch (background.type) {
      case 'solid':
        return { backgroundColor: background.value };
      case 'gradient':
        return { backgroundImage: background.value };
      case 'image':
        if (backgroundUrl) {
          return {
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          };
        }
        return {};
      case 'unsplash':
      case 'nasa':
      case 'picsum':
      case 'istanbul':
      case 'space':
      case 'ocean':
        return {
          backgroundImage: `url(${background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      default:
        return {};
    }
  };

  const getOverlayStyle = (): React.CSSProperties => {
    const { background } = settings;
    
    // If theme is not ready yet, return transparent to prevent flash
    if (!themeReady) {
      return { backgroundColor: 'transparent' };
    }
    
    // If no wallpaper (solid or gradient), use 100% opacity
    const hasWallpaper = background.type === 'image' || 
                         background.type === 'unsplash' || 
                         background.type === 'nasa' || 
                         background.type === 'picsum' || 
                         background.type === 'istanbul' || 
                         background.type === 'space' || 
                         background.type === 'ocean';
    
    const rawOpacity = hasWallpaper 
      ? (background.opacity !== undefined ? background.opacity / 100 : 0.1)
      : 1; // 100% opacity when no wallpaper
    // Clamp for safety so accidental values don't break overlay rendering
    const opacity = Math.min(Math.max(rawOpacity, 0), 1);
    
    // Get current theme background color from CSS variable
    const backgroundColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-background').trim() || '#ffffff';
    
    // Convert hex to rgba with opacity
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

        {/* Sticky Notes */}
        {isStickyNotesOpen && (
          <StickyNotes
            note={settings.stickyNote || null}
            onNoteChange={handleStickyNoteChange}
          />
        )}

        {/* Quotes - Top (Fixed Position) */}
        <div className="widgets-top">
          {settings.widgets.quotes?.enabled && (
            <Quotes 
              locale={settings.locale}
            />
          )}
        </div>

        {/* Spacer - pushes content to center */}
        <div className="spacer" />

        {/* Core elements - Clock, Search, QuickLinks */}
        <div className="container">
          <Clock locale={settings.locale} />
          
          <SearchBar
            searchEngine={settings.searchEngine}
            imageSearchMode={settings.imageSearchMode}
            onEngineChange={(engine) => updateSettings({ searchEngine: engine })}
            onImageModeChange={(enabled) => updateSettings({ imageSearchMode: enabled })}
          />

          <QuickLinks 
            links={settings.quickLinks} 
            onLinksChange={handleLinksChange}
            spacingWidgetEnabled={settings.quickLinksSpacingWidget ?? true}
          />
        </div>

        {/* Spacer - pushes content to center */}
        <div className="spacer" />

        {/* Widgets - Bottom (ordered by user preference) */}
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
        isOpen={!settings.introSeen}
        locale={settings.locale}
        onSkip={handleIntroSkip}
      />

      {/* Secret Links Popup */}
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
