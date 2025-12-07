# HotPage Usage Guide

## Quick Start

1. **Open the application**: Simply open `index.html` in your browser
2. **Set as homepage**: Configure your browser to use HotPage as your start page

## Feature Guide

### 🔍 Quick Search
- Type your query in the search box
- Select your preferred search engine (Google, DuckDuckGo, or Bing)
- Press Enter or click Search

### 🔗 Shortcuts
1. Click "+ Add Shortcut"
2. Enter a name and URL (must start with http:// or https://)
3. Click "Add"
4. Click any shortcut to open it
5. Click the × to delete

### 🌤️ Weather
1. Enter a city name
2. Click "Get Weather"
3. Your city is remembered for future sessions

### 💱 Currency Converter
1. Enter an amount
2. Select source and target currencies
3. Click "Convert"

### 💰 Crypto Prices
- Automatically displays prices for major cryptocurrencies
- Refreshes every 60 seconds
- Click "Refresh" to update manually
- Shows 24-hour price changes

### 📰 RSS Feeds
1. Enter an RSS feed URL
2. Click "Add Feed"
3. Note: Due to CORS, feeds require a server-side proxy

### 📝 Sticky Notes
- Type your notes in the text area
- Auto-saves as you type (after 1 second of inactivity)
- Click "Save Notes" for immediate save
- Persists across browser sessions

### ✅ Todo List
1. Type a task in the input field
2. Press Enter or click "+ Add"
3. Check the checkbox to mark complete
4. Click "Delete" to remove

### ⏱️ Pomodoro Timer
1. Set work duration (default: 25 minutes)
2. Set break duration (default: 5 minutes)
3. Click "Start" to begin
4. Click "Pause" to pause
5. Click "Reset" to reset to work duration
6. You'll get notifications when sessions complete

## Tips & Tricks

- **Data Privacy**: All data is stored locally in your browser using localStorage
- **No Account Needed**: No sign-up or account required
- **Offline Features**: Shortcuts, notes, and todos work offline
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Press Enter in search and todo fields
- **Auto-Save**: Notes save automatically as you type

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Data Storage

All your data is stored in your browser's localStorage:
- Shortcuts
- Sticky notes
- Todo items
- Last searched city
- RSS feed URLs

To clear all data, clear your browser's localStorage for this site.

## Privacy & Security

- **No tracking**: No analytics or tracking scripts
- **No ads**: Completely ad-free
- **No data collection**: Your data never leaves your device
- **No accounts**: No registration required
- **HTTPS APIs**: All external APIs use secure HTTPS connections

## Troubleshooting

### Crypto prices not loading
- May be blocked by ad blockers or privacy extensions
- Try disabling ad blocker for this page
- Or use browser's incognito/private mode

### Weather not working
- Check your internet connection
- Verify the city name is spelled correctly
- Try a major city name (e.g., "London", "New York")

### Notes/Todos not saving
- Ensure localStorage is enabled in your browser
- Check you're not in private/incognito mode (data won't persist)
- Verify you haven't exceeded localStorage quota

### Pomodoro notifications not showing
- Grant notification permissions when prompted
- Check browser notification settings
- Ensure notifications aren't blocked for this site

## Support

For issues or questions, please open an issue on GitHub.
