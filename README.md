<h1 align="left">HotPage</h1>
<video src="public\video\introduction.gif" nocontrols></video>

HotPage is a React 19 + TypeScript + Vite 7 powered new-tab homepage. It ships with a widget-first layout, glassmorphic settings panel, multi-source backgrounds, and persistent personalization for every session. This README is emoji-free and the project is released under the MIT license.

## Highlights
- Search-first experience with multiple engines and optional image mode
- Widget stack: Clock, Quick Links, Weather, Currency/Crypto, RSS, Quotes, Sticky Notes with Pomodoro/Todo, Secret Links overlay, and a first-run intro modal
- Theme system built on CSS variables with predefined and custom themes applied at runtime
- Background engine supporting solid, gradients, remote categories, and user-uploaded images stored in IndexedDB (with random mode and blur/opacity controls)
- Localized UI hooks via locale-aware widgets (12/24h clock, locale-aware formats, TR/EN intro copy)
- Settings persistence in localStorage with schema-safe defaults and export/import helpers
- Browser extension manifest (MV3) to load the built app as a new-tab page

## Feature Details
- **Search Bar**: Switchable engines (Google, DuckDuckGo, Bing, Brave, Yandex, Baidu, Wikipedia) and image search toggle per engine.
- **Quick Links**: Editable shortcut grid with custom SVG/favicons and optional spacing widget.
- **Clock & Quotes**: Locale-aware clock/date and rotating quotes by category (motivational, wisdom, humorous, literary, custom).
- **Weather**: Auto/manual location support (manual city), refresh interval control.
- **Currency/Crypto**: Dual tab, base currency selection, curated currency/crypto lists, optional sparkline fetch for history view.
- **RSS**: Mixed feed config (string or categorized), category tabs, item/image extraction, refresh interval and max items, stats surfaced to settings panel.
- **Sticky Notes**: Notes, todos, and Pomodoro timer with session switching and sound alert.
- **Secret Links**: Keyword-triggered overlay with folders, root links, and optional incognito opening.
- **Intro Modal**: One-time welcome with TR/EN copy, support/Open Source buttons, and skip persistence.

## Personalization
- **Themes**: Predefined themes plus a custom theme builder mapped to CSS variables; applied instantly through `applyTheme`.
- **Backgrounds**: Solid, gradient, remote image categories (`unsplash`, `nasa`, `picsum`, `istanbul`, `space`, `ocean`), or uploaded images stored as blobs in IndexedDB. Random mode avoids immediate repeats and respects last shown ID. Blur and overlay opacity are user-controlled.
- **Layout**: Widget order (`widgetOrder`) and per-widget enable/disable flags. Quotes sit at the top; others are ordered per user preference.
- **Locale**: Stored in settings and passed to widgets; defaults to OS/browser for intro language detection.
- **Keyboard**: N toggles sticky notes; Escape closes sticky/secret overlays; secret links listen for a custom trigger keyword.

## State and Persistence
- Single settings source of truth in `src/services/storage.ts`, persisted to `localStorage` and merged with defaults on load.
- Background images stored via IndexedDB in `imageStorage.ts`, returned as data URLs to avoid CORS.
- Debounced saves in `App.tsx` prevent excessive writes; export/import helpers support backup/restore.

## Architecture
- **Stack**: React 19, TypeScript 5.9, Vite 7, CSS Modules per component folder.
- **Entry**: `src/main.tsx` mounts `App.tsx` under React StrictMode.
- **Widgets**: Each widget receives `locale` and widget-specific settings; RSS reports stats up to `SettingsPanel`.
- **Theming**: `themeUtils.ts` applies CSS variables and RGB variants for rgba contexts; `themes.ts` hosts predefined themes.
- **Background Flow**: Random selection on first load, cached IDs, overlay derived from theme color with clamped opacity.
- **Settings Panel**: Glassmorphic panel toggles widgets, background, themes, and passes updates through `updateSettings`.

## Project Structure
```
src/
   App.tsx            # Main app shell, settings/state orchestration
   App.css
   index.css          # Global design tokens and fonts
   main.tsx           # React entry
   assets/
   components/
      Clock/
      Currency/
      IntroModal/
      QuickLinks/
      Quotes/
      RSS/
      SearchBar/
      SecretLinks/
      SettingsButton/
      SettingsPanel/
      StickyNotes/
      Weather/
   data/              # Icons, quotes, translations
   services/          # storage.ts (localStorage), imageStorage.ts (IndexedDB)
   types/             # settings, theme, widget contracts
   utils/             # themeUtils, themes, searchEngines, logger, pomodoroSound
public/
   manifest.json      # MV3 new-tab override
   video/introduction.gif
   fonts/
```

## Getting Started
### Prerequisites
- Node.js 20.19+ or 22.12+
- npm (or compatible package manager)

### Install and Run
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build   # tsc -b + vite build
npm run preview
```

### Lint
```bash
npm run lint
```

## Browser Extension Usage1) Build: `npm run build`


## Developer
- Enesehs – https://enesehs.dev

## Support
- Buy Me a Coffee: {[link ekle]}

## Configuration Notes
- All personalization lives in `localStorage` under `hotpage-settings` and merges with defaults on load.
- Uploaded backgrounds stay in IndexedDB to keep `localStorage` small; random mode respects last-used image ID.
- Settings export/import helpers are available in `storage.ts` for backup/restore.

## License

This project is licensed under the MIT License. See the LICENSE section for details.
