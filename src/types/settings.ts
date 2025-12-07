// Settings types
export interface SearchEngine {
  id: string;
  name: string;
  searchUrl: string;
  imageSearchUrl?: string;
  icon: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  iconType?: 'favicon' | 'svg' | 'custom' | 'none';
  hidden?: boolean;
  hotkey?: string;
}

export interface SecretFolder {
  id: string;
  name: string;
  links: SecretLink[];
  expanded?: boolean;
}

export interface SecretLink {
  id: string;
  title: string;
  url: string;
  folderId?: string; // null for root level links
}

export interface SecretLinksSettings {
  enabled: boolean;
  triggerKeyword: string; // Default: 'pass'
  openInIncognito: boolean; // Open links in incognito/private tab
  folders: SecretFolder[];
  rootLinks: SecretLink[]; // Links not in any folder
}

export interface WidgetConfig {
  enabled: boolean;
  position?: number;
  settings?: Record<string, unknown>;
}

export interface QuotesWidgetSettings {
  category: 'motivational' | 'wisdom' | 'humorous' | 'literary' | 'custom';
  customQuotes?: Array<{ text: string; author: string }>;
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
  [key: string]: unknown; // Index signature for compatibility
}

export interface WeatherWidgetSettings {
  manualLocation?: string; // City name for manual location (e.g., "Istanbul" or "London")
  refreshMinutes?: number;
  [key: string]: unknown;
}

export interface CurrencyWidgetSettings {
  baseCurrency: string; // User's base currency (TRY, USD, EUR, etc.)
  activeTab: 'currency' | 'crypto'; // Which tab is active
  enabledCurrencies: string[]; // Which currencies to show (USD, EUR, GBP, JPY, etc.)
  enabledCryptos: string[]; // Which cryptos to show (BTC, ETH, etc.)
  showSparkline: boolean; // Show mini chart
  [key: string]: unknown;
}

export interface FeedConfig {
  url: string;
  category: string;
}

export interface RSSWidgetSettings {
  feeds: (string | FeedConfig)[]; // Support legacy string[] and new FeedConfig[]
  maxItems?: number;
  refreshMinutes?: number;
  [key: string]: unknown;
}

export interface QuickActionsSettings {
  openStickyNotes: boolean;
  openNotepad: boolean;
}

export interface Settings {
  searchEngine: string;
  imageSearchMode: boolean;
  quickLinks: QuickLink[];
  quickLinksSpacingWidget?: boolean;
  introSeen?: boolean;
  locale?: string;
  widgetOrder?: string[]; // Order of widget IDs for display
  secretLinks?: SecretLinksSettings; // Secret links feature
  quickActions?: QuickActionsSettings;
  widgets: {
    quotes: WidgetConfig;
    weather: WidgetConfig;
    currency: WidgetConfig;
    rss: WidgetConfig;
    pomodoro: WidgetConfig;
    music: WidgetConfig;
    calendar: WidgetConfig;
  };
  theme: string;
  customThemeColors?: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  background: {
    type: 'solid' | 'gradient' | 'image' | 'unsplash' | 'nasa' | 'picsum' | 'istanbul' | 'space' | 'ocean';
    value: string;
    imageIds?: string[]; // IDs of images stored in IndexedDB
    randomMode?: boolean;
    currentImageId?: string;
    blur?: number;
    opacity?: number;
  };
  shortcuts: Record<string, string>;
  notes: string;
  todos: Array<{ id: string; text: string; completed: boolean }>;
  stickyNote: StickyNote | null;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number; // seconds
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsCompleted: number;
}

export interface StickyNote {
  id: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  textColor: string;
  createdAt: number;
  updatedAt: number;
  // New features
  mode: 'notes' | 'todos' | 'pomodoro';
  todos: TodoItem[];
  pomodoro: PomodoroState;
}
