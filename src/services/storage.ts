import type { Settings } from '../types/settings';
import { SettingsSchema } from '../schemas/settings.schema';
import { sanitizeSVG } from '../utils/sanitize';

declare let chrome: any;

const STORAGE_KEY = 'hotpage-settings';

const defaultTheme = (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  ? 'dark'
  : 'light';

export const defaultSettings: Settings = {
  locale: 'en-US',
  searchEngine: 'default',
  "quickLinks": [
    {
      "id": "default-1",
      "title": "Enesehs",
      "url": "https://enesehs.dev",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/><polyline points=\"9 22 9 12 15 12 15 22\"/></svg>",
      "iconType": "svg"
    },
    {
      "id": "default-2",
      "title": "Youtube",
      "url": "https://youtube.com",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\"/></svg>",
      "iconType": "svg"
    },
    {
      "id": "default-3",
      "title": "Instagram",
      "url": "https://instagram.com",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\" ry=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z\"/><line x1=\"17.5\" y1=\"6.5\" x2=\"17.51\" y2=\"6.5\"/></svg>",
      "iconType": "svg"
    },
    {
      "id": "1770127513054",
      "title": "Reddit",
      "url": "https://reddit.com",
      "type": "link",
      "iconType": "svg",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"-2 -3 24 24\"><g fill=\"currentColor\"><path d=\"M19.986 8.029a2.51 2.51 0 0 0-4.285-1.771c-1.404-.906-3.197-1.483-5.166-1.573a2.73 2.73 0 0 1 1.028-2.139a2.74 2.74 0 0 1 2.315-.539l.112.025l-.004.084a2.095 2.095 0 1 0 .328-1.121L14.113.95a3.81 3.81 0 0 0-3.228.752a3.81 3.81 0 0 0-1.433 2.983c-1.97.09-3.762.667-5.165 1.572a2.51 2.51 0 1 0-2.94 3.994q-.092.465-.093.952c0 3.606 3.912 6.53 8.74 6.53c4.826 0 8.739-2.924 8.739-6.53q0-.486-.093-.952a2.51 2.51 0 0 0 1.346-2.222m-3.905-6.925a1.013 1.013 0 0 1 0 2.025a1.013 1.013 0 0 1 0-2.025M1.083 8.03c0-.787.64-1.427 1.427-1.427c.337 0 .646.118.89.314c-.763.655-1.354 1.425-1.721 2.27a1.42 1.42 0 0 1-.596-1.157m14.442 6.923c-1.465 1.095-3.43 1.698-5.532 1.698s-4.067-.603-5.531-1.698c-1.37-1.023-2.125-2.355-2.125-3.75c0-1.394.754-2.725 2.125-3.75C5.926 6.359 7.89 5.757 9.993 5.757s4.067.602 5.532 1.697c1.37 1.024 2.125 2.355 2.125 3.75c0 1.394-.755 2.726-2.125 3.75zm2.782-5.767c-.367-.845-.958-1.614-1.721-2.269c.244-.196.554-.314.89-.314c.787 0 1.427.64 1.427 1.427c0 .476-.235.898-.596 1.156\"/><circle cx=\"6.801\" cy=\"9.678\" r=\"1.143\"/><circle cx=\"13.185\" cy=\"9.678\" r=\"1.143\"/><path d=\"M12.701 12.455a4.36 4.36 0 0 1-2.94 1.138a4.33 4.33 0 0 1-3.195-1.39a.541.541 0 1 0-.793.738a5.47 5.47 0 0 0 3.988 1.735a5.44 5.44 0 0 0 3.67-1.421a.541.541 0 1 0-.73-.8\"/></g></svg>"
    },
    {
      "id": "default-5",
      "title": "LinkedIn",
      "url": "https://linkedin.com",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z\"/><rect x=\"2\" y=\"9\" width=\"4\" height=\"12\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/></svg>",
      "iconType": "svg"
    },
    {
      "id": "default-6",
      "title": "Discord",
      "url": "https://discord.com",
      "type": "link",
      "iconType": "svg",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\"><path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M20 4.47a1 1 0 0 1 .41.342c2.61 3.78 3.92 8.08 3.44 13a1 1 0 0 1-.405.71c-1.77 1.3-3.76 2.28-5.87 2.91a.99.99 0 0 1-1.08-.357c-.452-.6-.856-1.24-1.21-1.9c-1.09.262-2.21.396-3.33.396c-1.13 0-2.25-.134-3.33-.397a14 14 0 0 1-1.21 1.9a1 1 0 0 1-1.09.357a19.3 19.3 0 0 1-5.87-2.92A1 1 0 0 1 .05 17.8c-.41-4.26.418-8.6 3.43-13c.103-.151.246-.271.413-.347c1.53-.691 3.14-1.18 4.79-1.46c.415-.07.83.128 1.04.494q.16.285.308.577a18 18 0 0 1 3.84 0q.146-.292.308-.577a1 1 0 0 1 1.04-.494c1.65.277 3.26.767 4.79 1.46zm-5.53.699a17.1 17.1 0 0 0-5.04 0q-.26-.6-.581-1.17c-1.57.265-3.1.73-4.54 1.39c-2.87 4.21-3.65 8.31-3.26 12.3c1.68 1.23 3.56 2.17 5.57 2.77a13 13 0 0 0 1.192-1.901a12 12 0 0 1-.893-.372l-.033-.015a12 12 0 0 1-.952-.5c.157-.112.311-.23.46-.341a13 13 0 0 0 2.336.829a13.2 13.2 0 0 0 7.155-.196c.56-.174 1.11-.386 1.64-.634q.227.184.46.342q-.117.068-.238.135q-.352.195-.717.366l-.031.015q-.439.204-.894.372q.084.165.174.327a13 13 0 0 0 1.018 1.574c2-.598 3.89-1.53 5.57-2.76c.457-4.69-.78-8.75-3.27-12.4a18.3 18.3 0 0 0-4.54-1.38q-.321.57-.581 1.17zm-8.15 7.91c0 1.2.896 2.17 1.98 2.17c1.11 0 1.96-.974 1.98-2.17c.019-1.2-.87-2.18-1.98-2.18s-1.98.983-1.98 2.18m7.31 0c0 1.2.893 2.17 1.98 2.17c1.11 0 1.96-.974 1.98-2.17c.02-1.2-.863-2.18-1.98-2.18s-1.98.983-1.98 2.18\" clip-rule=\"evenodd\"/></svg>"
    },
    {
      "id": "default-7",
      "title": "X",
      "url": "https://x.com",
      "type": "link",
      "iconType": "svg",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 4l11.733 16h4.267l-11.733-16z\"/><path d=\"M4 20l6.768-6.768m2.46-2.46l6.772-6.772\"/></svg>"
    },
    {
      "id": "default-8",
      "title": "Github",
      "url": "https://github.com",
      "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22\"/></svg>",
      "iconType": "svg"
    },
    {
      "id": "default-9",
      "title": "My Projects",
      "url": "",
      "type": "folder",
      "iconType": "svg",
      "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13.65a.35.35 0 0 0 .35.35Z\"/></svg>",
      "children": [
        {
          "id": "default-10",
          "title": "Hotpage Source Codes",
          "url": "https://github.com/enesehs/Hotpage",
          "type": "link",
          "iconType": "svg",
          "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"m16 18 6-6-6-6m-8 12-6-6 6-6\"/></svg>"
        },
        {
          "id": "default-11",
          "title": "Windows Optimizer",
          "url": "https://github.com/enesehs/enesehs-windows-optimizer",
          "type": "link",
          "iconType": "svg",
          "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z\"/></svg>"
        },
        {
          "id": "default-12",
          "title": "Youtube Downloader",
          "url": "https://github.com/enesehs/yt-dlp-gui",
          "type": "link",
          "iconType": "svg",
          "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2\" y=\"2\" width=\"20\" height=\"8\" rx=\"2\"/><rect x=\"2\" y=\"14\" width=\"20\" height=\"8\" rx=\"2\"/><path d=\"M6 6h.01m-.01 12h.01\"/></svg>"
        },
        {
          "id": "default-13",
          "title": "Windows Webcam Sentinel",
          "url": "https://github.com/enesehs/Aether",
          "type": "link",
          "iconType": "svg",
          "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/></svg>"
        },
        {
          "id": "default-14",
          "title": "Usom Adblock Filter",
          "url": "https://github.com/enesehs/usom-filter",
          "type": "link",
          "iconType": "svg",
          "icon": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\"/><path d=\"m3.3 7 8.7 5 8.7-5M12 22V12\"/></svg>"
        }
      ]
    }
  ],
  quickLinksViewMode: 'logo',
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
    stickyNoteShortcut: 'Alt+N',
  },
  googleShortcuts: {
    enabled: true,
    showGmail: true,
    showAppsMenu: true,
  },
  showClock: true,
  showDate: true,
  showQuickLinks: true,
  widgets: {
    quotes: {
      enabled: true,
      settings: {
        autoRefresh: false,
        refreshInterval: 15,
      }
    },
    weather: { enabled: true, settings: { manualLocation: '', refreshMinutes: 15, viewMode: 'compact' } },
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
        refreshMinutes: 15,
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
    opacity: 20,
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

    const json = JSON.stringify(settingsToSave);
    localStorage.setItem(STORAGE_KEY, json);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: settingsToSave });
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const syncWithChromeStorage = (onUpdate: (settings: Settings) => void) => {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
    return () => { };
  }

  chrome.storage.local.get([STORAGE_KEY], (result: any) => {
    if (result[STORAGE_KEY]) {
      const merged = { ...defaultSettings, ...result[STORAGE_KEY] };
      merged.widgets = {
        ...defaultSettings.widgets,
        ...merged.widgets,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(result[STORAGE_KEY]));
      onUpdate(merged);
    }
  });

  const listener = (changes: any, areaName: string) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      const newValue = changes[STORAGE_KEY].newValue;
      if (newValue) {
        const merged = { ...defaultSettings, ...newValue };
        merged.widgets = {
          ...defaultSettings.widgets,
          ...merged.widgets,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue));
        onUpdate(merged);
      }
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
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
