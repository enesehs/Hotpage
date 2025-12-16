import type { Settings } from '../types/settings';
import { SettingsSchema } from '../schemas/settings.schema';
import { sanitizeSVG } from '../utils/sanitize';

const STORAGE_KEY = 'hotpage-settings';

const defaultTheme = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  ? 'dark'
  : 'light';

export const defaultSettings: Settings = {
  locale: 'en-US',
  quickLinks: [
    {
      id: 'default-1',
      title: 'Enesehs',
      url: 'https://enesehs.dev',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
      iconType: 'svg'
    },
    {
      id: 'default-2',
      title: 'Youtube',
      url: 'https://youtube.com',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>',
      iconType: 'svg'
    },
    {
      id: 'default-3',
      title: 'Instagram',
      url: 'https://instagram.com',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
      iconType: 'svg'
    },
    {
      id: 'default-4',
      title: 'Github',
      url: 'https://github.com',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
      iconType: 'svg'
    },
    {
      id: 'default-5',
      title: 'LinkedIn',
      url: 'https://linkedin.com',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
      iconType: 'svg'
    }
  ],
  quickLinksSpacingWidget: true,
  introSeen: false,
  widgetOrder: ['weather', 'currency', 'rss'],
  secretLinks: {
    enabled: true,
    triggerKeyword: 'pass',
    openInIncognito: true,
    folders: [],
    rootLinks: [],
  },
  quickActions: {
    openStickyNotes: true,
    openNotepad: true,
  },
  widgets: {
    quotes: {
      enabled: true,
      settings: {
        autoRefresh: false,
        refreshInterval: 30,
      }
    },
    weather: { enabled: true, settings: { manualLocation: '', refreshMinutes: 10 } },
    currency: {
      enabled: true,
      settings: {
        baseCurrency: 'USD',
        activeTab: 'currency',
        enabledCurrencies: ['USD', 'EUR', 'GBP', 'JPY', 'XAU'],
        enabledCryptos: ['bitcoin', 'ethereum', 'binancecoin', 'ripple', 'cardano'],
        showSparkline: false,
      }
    },
    rss: {
      enabled: true,
      settings: {
        feeds: [
          { url: 'https://github.blog/feed/', category: 'Technology' },
        ],
        maxItems: 150,
        refreshMinutes: 30,
      }
    },
    pomodoro: { enabled: true },
    music: { enabled: true },
    calendar: { enabled: true },
  },
  theme: defaultTheme,
  background: {
    type: 'solid',
    value: '#ffffff',
    opacity: 10,
    blur: 0,
  },
  shortcuts: {},
  notes: '',
  todos: [
    {
      id: 'default-1',
      text: 'Install the Hotpage',
      completed: true,
      createdAt: Date.now(),
    },
    {
      id: 'default-2',
      text: 'Visit enesehs.dev',
      completed: false,
      createdAt: Date.now(),
    },
  ],
  stickyNote: null,
};

export const loadSettings = (): Settings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const settings = { ...defaultSettings, ...parsed };

      settings.widgets = {
        ...defaultSettings.widgets,
        ...parsed.widgets,
      };

      if (settings.background.randomMode &&
        settings.background.imageIds &&
        settings.background.imageIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * settings.background.imageIds.length);
        settings.background.currentImageId = settings.background.imageIds[randomIndex];
      }

      return settings;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return defaultSettings;
};

export const saveSettings = (settings: Settings): void => {
  try {
    const settingsToSave = JSON.parse(JSON.stringify(settings));

    if (settingsToSave.background.type === 'image') {
      settingsToSave.background.value = '';
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const exportSettings = (settings: Settings): string => {
  return JSON.stringify(settings, null, 2);
};

export const importSettings = (json: string): Settings | null => {
  try {
    const parsed = JSON.parse(json);

    const validated = SettingsSchema.parse(parsed) as Settings;

    if (validated.quickLinks) {
      validated.quickLinks = validated.quickLinks.map(link => ({
        ...link,
        icon: link.icon && link.iconType === 'svg' ? sanitizeSVG(link.icon) : link.icon
      }));
    }

    return { ...defaultSettings, ...validated };
  } catch (error) {
    console.error('Failed to import settings:', error);
    if (error instanceof Error) {
      throw new Error(`Settings validation failed: ${error.message}`);
    }
    return null;
  }
};
