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
  folderId?: string;
}

export interface SecretLinksSettings {
  enabled: boolean;
  triggerKeyword: string;
  openInIncognito: boolean;
  folders: SecretFolder[];
  rootLinks: SecretLink[];
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
  refreshInterval?: number;
  [key: string]: unknown;
}

export interface WeatherWidgetSettings {
  manualLocation?: string;
  refreshMinutes?: number;
  [key: string]: unknown;
}

export interface CurrencyWidgetSettings {
  baseCurrency: string;
  activeTab: 'currency' | 'crypto';
  enabledCurrencies: string[];
  enabledCryptos: string[];
  showSparkline: boolean;
  [key: string]: unknown;
}

export interface FeedConfig {
  url: string;
  category: string;
}

export interface RSSWidgetSettings {
  feeds: (string | FeedConfig)[];
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
  widgetOrder?: string[];
  secretLinks?: SecretLinksSettings;
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
    imageIds?: string[];
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
  subheading?: string;
  completed: boolean;
  createdAt: number;
  subtasks?: TodoItem[];
}

export interface PomodoroState {
  isRunning: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak' | 'custom';
  timeLeft: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  customDuration: number;
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
  mode: 'notes' | 'todos' | 'pomodoro';
  todos: TodoItem[];
  pomodoro: PomodoroState;
}
