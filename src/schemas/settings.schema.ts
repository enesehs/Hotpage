import { z } from 'zod';

export const QuickLinkSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    url: z.string().url(),
    icon: z.string().optional(),
    iconType: z.enum(['favicon', 'svg', 'custom', 'none']).optional(),
    hidden: z.boolean().optional(),
    hotkey: z.string().max(10).optional()
});

export const SecretLinkSchema = z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    url: z.string().url(),
    folderId: z.string().optional()
});

export const SecretFolderSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(50),
    links: z.array(SecretLinkSchema),
    expanded: z.boolean().optional()
});

export const SecretLinksSettingsSchema = z.object({
    enabled: z.boolean(),
    triggerKeyword: z.string().min(1).max(20),
    openInIncognito: z.boolean(),
    folders: z.array(SecretFolderSchema),
    rootLinks: z.array(SecretLinkSchema)
});

export const QuotesWidgetSettingsSchema = z.object({
    category: z.enum(['motivational', 'wisdom', 'humorous', 'literary', 'custom']).optional(),
    customQuotes: z.array(z.object({
        text: z.string().max(500),
        author: z.string().max(100)
    })).optional(),
    autoRefresh: z.boolean().optional(),
    refreshInterval: z.number().min(1).max(1440).optional()
});

export const WeatherWidgetSettingsSchema = z.object({
    manualLocation: z.string().max(100).optional(),
    refreshMinutes: z.number().min(1).max(1440).optional()
});

export const CurrencyWidgetSettingsSchema = z.object({
    baseCurrency: z.string().length(3),
    activeTab: z.enum(['currency', 'crypto']),
    enabledCurrencies: z.array(z.string()).max(20),
    enabledCryptos: z.array(z.string()).max(20),
    showSparkline: z.boolean()
});

export const FeedConfigSchema = z.union([
    z.string().url(),
    z.object({
        url: z.string().url(),
        category: z.string().max(50)
    })
]);

export const RSSWidgetSettingsSchema = z.object({
    feeds: z.array(FeedConfigSchema).max(50),
    maxItems: z.number().min(1).max(500).optional(),
    refreshMinutes: z.number().min(1).max(1440).optional()
});

export const WidgetConfigSchema = z.object({
    enabled: z.boolean(),
    position: z.number().optional(),
    settings: z.record(z.string(), z.unknown()).optional()
});

export const QuickActionsSettingsSchema = z.object({
    openStickyNotes: z.boolean(),
    openNotepad: z.boolean(),
    stickyNoteShortcut: z.string().max(20).optional()
});

export const BackgroundSchema = z.object({
    type: z.enum(['solid', 'gradient', 'image', 'unsplash', 'nasa', 'picsum', 'istanbul', 'space', 'ocean']),
    value: z.string(),
    imageIds: z.array(z.string()).optional(),
    randomMode: z.boolean().optional(),
    currentImageId: z.string().optional(),
    blur: z.number().min(0).max(20).optional(),
    opacity: z.number().min(0).max(100).optional()
});

export const CustomThemeColorsSchema = z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    textSecondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    border: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
});

export const TodoItemSchema: z.ZodType<any> = z.lazy(() => z.object({
    id: z.string(),
    text: z.string().max(500),
    subheading: z.string().max(200).optional(),
    completed: z.boolean(),
    createdAt: z.number(),
    subtasks: z.array(TodoItemSchema).optional()
}));

export const PomodoroStateSchema = z.object({
    isRunning: z.boolean(),
    mode: z.enum(['work', 'shortBreak', 'longBreak', 'custom']),
    timeLeft: z.number(),
    workDuration: z.number(),
    shortBreakDuration: z.number(),
    longBreakDuration: z.number(),
    customDuration: z.number(),
    sessionsCompleted: z.number()
});

export const StickyNoteSchema = z.object({
    id: z.string(),
    content: z.string().max(10000),
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ width: z.number(), height: z.number() }),
    fontSize: z.number().min(8).max(32),
    fontFamily: z.string(),
    color: z.string(),
    textColor: z.string(),
    createdAt: z.number(),
    updatedAt: z.number(),
    mode: z.enum(['notes', 'todos', 'pomodoro']),
    todos: z.array(TodoItemSchema),
    pomodoro: PomodoroStateSchema
});

export const SettingsSchema = z.object({
    quickLinks: z.array(QuickLinkSchema).max(50),
    quickLinksSpacingWidget: z.boolean().optional(),
    introSeen: z.boolean().optional(),
    locale: z.string().optional(),
    widgetOrder: z.array(z.string()).optional(),
    secretLinks: SecretLinksSettingsSchema.optional(),
    quickActions: QuickActionsSettingsSchema.optional(),
    widgets: z.object({
        quotes: WidgetConfigSchema,
        weather: WidgetConfigSchema,
        currency: WidgetConfigSchema,
        rss: WidgetConfigSchema,
        pomodoro: WidgetConfigSchema,
        music: WidgetConfigSchema,
        calendar: WidgetConfigSchema
    }),
    theme: z.string(),
    customThemeColors: CustomThemeColorsSchema.optional(),
    background: BackgroundSchema,
    shortcuts: z.record(z.string(), z.string()),
    notes: z.string().max(100000),
    todos: z.array(TodoItemSchema),
    stickyNote: StickyNoteSchema.nullable()
});

export type ValidatedSettings = z.infer<typeof SettingsSchema>;
