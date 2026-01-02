# Changelog

All notable changes to this project will be documented in this file.

## [v1.4.0] - 2026-01-02

### 🚀 New Features

- **Interactive User Guide**: Added a step-by-step interactive tour for new users to explore HotPage features. Auto-starts for new users or can be triggered from settings.
- **Google Shortcuts**: Added a "Hamburger" style app launcher menu for quick access to popular Google services (Gmail, Drive, Photos, Calendar, etc.).
- **Search Bar Calculator**: The search bar now supports basic mathematical operations. Typing equations (e.g., `25 * 4`) instantly shows the result.
- **Sticky Notes Real-Time Sync**: Implemented cross-tab synchronization for Sticky Notes. Changes made in one tab now instantly reflect in all open HotPage tabs and windows.
- **"What's New" Modal**: Added a changelog modal that appears automatically when the extension is updated to a new version, summarizing key changes.

### ⚡ Improvements

- **Widget Ecosystem**:
  - Added "Last Updated" time indicator to RSS, Weather, and Currency widgets.
  - Improved refresh logic: widgets now attempt to refresh at user-defined intervals (15m default) and gracefully fall back to cached data if offline.
- **UI/UX Polishing**:
  - **Glassmorphism**: Enhanced glassmorphism effects on the Search Button, Settings Panel, and User Guide elements.
  - **Intro Modal**: Redesigned the intro screen to include a "Start Tour" button and improved "Skip" functionality.
  - **Theme Contrast**: Fixed text contrast issues in White/Light themes for better readability.
  - **Scrollbar**: Fixed window scrollbar colors to match the active theme.
- **Sticky Notes**: Added a dedicated close button and configurable keyboard shortcut (Default: `Shift+N`, customizable in settings).

### 🐛 Bug Fixes

- **RSS Feeds**: Fixed issues with certain RSS feed URLs not parsing correctly.
- **Auto-Randomize Button**: Fixed CSS alignment and visual state of the auto-randomize background button.
- **Sticky Notes**: Fixed an issue where the sticky notes overlay could be obscured by certain page elements (z-index adjustments).
- **Settings**: Fixed the "Settings" button click area and responsiveness.

## [v1.3.2]

- Initial stable release with core widgets and personalization features.
