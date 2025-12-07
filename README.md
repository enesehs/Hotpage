# HotPage 🚀

HotPage is a clean and customizable start page that brings everything you need into one place. It offers quick search, shortcuts, weather updates, currency and crypto data, RSS feeds, sticky notes, a todo list, and a Pomodoro timer, all inside a simple and personal dashboard.

![HotPage Dashboard](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🔍 Quick Search
- Search the web directly from your dashboard
- Support for multiple search engines (Google, DuckDuckGo, Bing)
- Press Enter to search instantly

### 🔗 Shortcuts
- Add custom shortcuts to your favorite websites
- One-click access to frequently visited pages
- Easy to add, edit, and remove shortcuts
- Data persisted in browser's local storage

### 🌤️ Weather Updates
- Real-time weather information for any city
- Temperature, wind speed, and weather conditions
- Powered by Open-Meteo API (no API key required)
- Your last searched city is remembered

### 💱 Currency Converter
- Convert between major world currencies
- Real-time exchange rates
- Support for USD, EUR, GBP, JPY, and more
- Powered by ExchangeRate-API

### 💰 Crypto Data
- Live cryptocurrency prices
- Track Bitcoin, Ethereum, Cardano, Solana, and Ripple
- 24-hour price change indicators
- Auto-refreshes every 60 seconds
- Powered by CoinGecko API

### 📰 RSS Feeds
- Add your favorite RSS feed URLs
- Stay updated with the latest news and content
- Note: RSS feed fetching requires a server-side proxy due to CORS restrictions

### 📝 Sticky Notes
- Quick note-taking area
- Auto-saves your notes as you type
- Perfect for reminders and quick thoughts
- Data persisted in browser's local storage

### ✅ Todo List
- Manage your daily tasks
- Mark tasks as completed
- Delete tasks when done
- Data persisted in browser's local storage

### ⏱️ Pomodoro Timer
- Boost productivity with the Pomodoro Technique
- Customizable work and break durations
- Visual and audio notifications
- Start, pause, and reset controls

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/enesehs/Hotpage.git
cd Hotpage
```

2. Open `index.html` in your browser:
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html

# On Windows
start index.html
```

Or simply double-click the `index.html` file.

### Setting as Your Browser's Start Page

#### Chrome/Edge
1. Go to Settings → On startup
2. Select "Open a specific page or set of pages"
3. Add the file path to `index.html` (e.g., `file:///path/to/Hotpage/index.html`)

#### Firefox
1. Go to Preferences → Home
2. Set Homepage and new windows to "Custom URLs"
3. Enter the file path to `index.html`

#### Safari
1. Go to Preferences → General
2. Set Homepage to the file path of `index.html`

## 📖 Usage Guide

### Adding Shortcuts
1. Click the "+ Add Shortcut" button
2. Enter a name and URL (must start with http:// or https://)
3. Click "Add"
4. Click on any shortcut to open it in a new tab
5. Click the × button to delete a shortcut

### Using the Weather Widget
1. Enter your city name in the input field
2. Click "Get Weather"
3. Your city will be remembered for next time

### Currency Conversion
1. Enter the amount you want to convert
2. Select the source currency
3. Select the target currency
4. Click "Convert" to see the result

### Managing Todos
1. Type your task in the input field
2. Press Enter or click "+ Add"
3. Check the checkbox to mark a task as completed
4. Click "Delete" to remove a task

### Using the Pomodoro Timer
1. Set your preferred work duration (default: 25 minutes)
2. Set your preferred break duration (default: 5 minutes)
3. Click "Start" to begin the timer
4. Click "Pause" to pause the timer
5. Click "Reset" to reset to work duration
6. You'll receive a notification when the timer completes

## 🎨 Customization

All your data is stored locally in your browser using localStorage. This means:
- Your shortcuts, notes, and todos are private and never leave your device
- No account or sign-up required
- Data persists between sessions

## 🛠️ Technology Stack

- **HTML5** - Structure and semantic markup
- **CSS3** - Styling with modern features (Grid, Flexbox, CSS Variables)
- **Vanilla JavaScript** - No frameworks, pure JS for performance
- **Local Storage API** - Data persistence
- **Web APIs** - Notifications, Audio for Pomodoro timer

### External APIs Used
- [Open-Meteo](https://open-meteo.com/) - Weather data
- [ExchangeRate-API](https://www.exchangerate-api.com/) - Currency conversion
- [CoinGecko](https://www.coingecko.com/) - Cryptocurrency prices

## 🌐 Browser Support

HotPage works on all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🐛 Known Limitations

- **RSS Feeds**: Due to CORS restrictions, RSS feeds cannot be fetched directly from the browser. You may need to use a server-side proxy or RSS reader service.
- **API Rate Limits**: Free tier APIs have rate limits. The app handles this gracefully but you may experience delays during heavy usage.

## 💡 Tips

- **Performance**: The page is lightweight and loads instantly
- **Privacy**: All your personal data stays on your device
- **Offline**: Most features work offline except weather, currency, and crypto which require internet
- **Mobile Friendly**: Responsive design works on tablets and phones

## 📧 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for productivity enthusiasts
