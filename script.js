// Local Storage Keys
const STORAGE_KEYS = {
    SHORTCUTS: 'hotpage_shortcuts',
    NOTES: 'hotpage_notes',
    TODOS: 'hotpage_todos',
    CITY: 'hotpage_city',
    RSS_FEEDS: 'hotpage_rss_feeds'
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', function() {
    loadShortcuts();
    loadNotes();
    loadTodos();
    loadRssFeeds();
    loadSavedCity();
    initCrypto();
    
    // Add enter key support for search
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    
    // Add enter key support for todo
    document.getElementById('todoInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTodo();
    });
});

// ==================== SEARCH ====================
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const engine = document.getElementById('searchEngine').value;
    
    if (!query) return;
    
    const searchUrls = {
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`
    };
    
    window.open(searchUrls[engine], '_blank');
}

// ==================== SHORTCUTS ====================
function loadShortcuts() {
    const shortcuts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHORTCUTS) || '[]');
    displayShortcuts(shortcuts);
}

function displayShortcuts(shortcuts) {
    const container = document.getElementById('shortcutsList');
    container.innerHTML = '';
    
    shortcuts.forEach((shortcut, index) => {
        const div = document.createElement('div');
        div.className = 'shortcut-item';
        div.innerHTML = `
            <button class="shortcut-delete" onclick="deleteShortcut(${index})">×</button>
            <div class="shortcut-name">${escapeHtml(shortcut.name)}</div>
        `;
        div.onclick = (e) => {
            if (!e.target.classList.contains('shortcut-delete')) {
                window.open(shortcut.url, '_blank');
            }
        };
        container.appendChild(div);
    });
}

function showAddShortcutModal() {
    document.getElementById('shortcutModal').classList.add('active');
}

function closeShortcutModal() {
    document.getElementById('shortcutModal').classList.remove('active');
    document.getElementById('shortcutName').value = '';
    document.getElementById('shortcutUrl').value = '';
}

function addShortcut() {
    const name = document.getElementById('shortcutName').value.trim();
    const url = document.getElementById('shortcutUrl').value.trim();
    
    if (!name || !url) {
        alert('Please enter both name and URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }
    
    const shortcuts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHORTCUTS) || '[]');
    shortcuts.push({ name, url });
    localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
    
    loadShortcuts();
    closeShortcutModal();
}

function deleteShortcut(index) {
    const shortcuts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHORTCUTS) || '[]');
    shortcuts.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.SHORTCUTS, JSON.stringify(shortcuts));
    loadShortcuts();
}

// ==================== WEATHER ====================
function loadSavedCity() {
    const savedCity = localStorage.getItem(STORAGE_KEYS.CITY);
    if (savedCity) {
        document.getElementById('cityInput').value = savedCity;
        getWeather();
    }
}

async function getWeather() {
    const city = document.getElementById('cityInput').value.trim();
    const display = document.getElementById('weatherDisplay');
    
    if (!city) {
        display.innerHTML = '<p class="info-text">Please enter a city name</p>';
        return;
    }
    
    display.innerHTML = '<p class="info-text">Loading weather...</p>';
    
    try {
        // Using Open-Meteo API (free, no API key required)
        // First, get coordinates from city name using geocoding
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            display.innerHTML = '<p class="info-text">City not found</p>';
            return;
        }
        
        const location = geoData.results[0];
        const lat = location.latitude;
        const lon = location.longitude;
        
        // Get weather data
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`);
        const weatherData = await weatherResponse.json();
        
        const current = weatherData.current_weather;
        
        display.innerHTML = `
            <div class="weather-info">
                <h3>${escapeHtml(location.name)}, ${escapeHtml(location.country || '')}</h3>
                <div class="weather-temp">${Math.round(current.temperature)}°C</div>
                <p>Wind: ${current.windspeed} km/h</p>
                <p>Weather Code: ${getWeatherDescription(current.weathercode)}</p>
            </div>
        `;
        
        localStorage.setItem(STORAGE_KEYS.CITY, city);
    } catch (error) {
        console.error('Weather error:', error);
        display.innerHTML = '<p class="info-text">Error loading weather data</p>';
    }
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Foggy',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        95: 'Thunderstorm'
    };
    return descriptions[code] || 'Unknown';
}

// ==================== CURRENCY CONVERTER ====================
async function convertCurrency() {
    const amount = parseFloat(document.getElementById('currencyAmount').value);
    const from = document.getElementById('fromCurrency').value;
    const to = document.getElementById('toCurrency').value;
    const resultDiv = document.getElementById('currencyResult');
    
    if (!amount || amount <= 0) {
        resultDiv.innerHTML = 'Please enter a valid amount';
        return;
    }
    
    resultDiv.innerHTML = 'Converting...';
    
    try {
        // Using exchangerate-api.com (free tier available)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const data = await response.json();
        
        if (data.rates && data.rates[to]) {
            const rate = data.rates[to];
            const result = (amount * rate).toFixed(2);
            resultDiv.innerHTML = `${amount} ${from} = ${result} ${to}`;
        } else {
            resultDiv.innerHTML = 'Conversion rate not available';
        }
    } catch (error) {
        console.error('Currency conversion error:', error);
        resultDiv.innerHTML = 'Error converting currency';
    }
}

// ==================== CRYPTO PRICES ====================
let cryptoUpdateInterval;

async function initCrypto() {
    await refreshCrypto();
    // Auto-refresh every 60 seconds
    cryptoUpdateInterval = setInterval(refreshCrypto, 60000);
}

async function refreshCrypto() {
    const container = document.getElementById('cryptoList');
    container.innerHTML = '<p class="info-text">Loading crypto prices...</p>';
    
    try {
        // Using CoinGecko API (free, no API key required)
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,solana,ripple&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        
        const cryptoNames = {
            bitcoin: 'Bitcoin (BTC)',
            ethereum: 'Ethereum (ETH)',
            cardano: 'Cardano (ADA)',
            solana: 'Solana (SOL)',
            ripple: 'Ripple (XRP)'
        };
        
        container.innerHTML = '';
        
        for (const [id, name] of Object.entries(cryptoNames)) {
            if (data[id]) {
                const div = document.createElement('div');
                div.className = 'crypto-item';
                const price = data[id].usd;
                const change = data[id].usd_24h_change?.toFixed(2) || 0;
                const changeColor = change >= 0 ? '#27ae60' : '#e74c3c';
                
                div.innerHTML = `
                    <span class="crypto-name">${escapeHtml(name)}</span>
                    <span class="crypto-price">
                        $${price.toLocaleString()}
                        <span style="color: ${changeColor}; font-size: 12px; margin-left: 5px;">
                            ${change >= 0 ? '↑' : '↓'}${Math.abs(change)}%
                        </span>
                    </span>
                `;
                container.appendChild(div);
            }
        }
    } catch (error) {
        console.error('Crypto error:', error);
        container.innerHTML = '<p class="info-text">Error loading crypto prices</p>';
    }
}

// ==================== RSS FEEDS ====================
function loadRssFeeds() {
    const feeds = JSON.parse(localStorage.getItem(STORAGE_KEYS.RSS_FEEDS) || '[]');
    displayRssFeeds(feeds);
}

function displayRssFeeds(feeds) {
    const container = document.getElementById('rssFeedsList');
    
    if (feeds.length === 0) {
        container.innerHTML = '<p class="info-text">No RSS feeds added yet</p>';
        return;
    }
    
    container.innerHTML = '<p class="info-text">RSS feeds: ' + feeds.length + ' feed(s) added</p>';
    container.innerHTML += '<p class="info-text" style="font-size: 12px;">Note: Due to CORS restrictions, RSS feeds cannot be fetched directly from the browser. Consider using a server-side proxy or RSS reader service.</p>';
}

function addRssFeed() {
    const url = document.getElementById('rssUrl').value.trim();
    
    if (!url) {
        alert('Please enter an RSS feed URL');
        return;
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert('URL must start with http:// or https://');
        return;
    }
    
    const feeds = JSON.parse(localStorage.getItem(STORAGE_KEYS.RSS_FEEDS) || '[]');
    
    if (feeds.includes(url)) {
        alert('This feed is already added');
        return;
    }
    
    feeds.push(url);
    localStorage.setItem(STORAGE_KEYS.RSS_FEEDS, JSON.stringify(feeds));
    
    document.getElementById('rssUrl').value = '';
    loadRssFeeds();
    alert('RSS feed added! Note: RSS feeds require a server-side proxy to fetch due to CORS restrictions.');
}

// ==================== STICKY NOTES ====================
function loadNotes() {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES) || '';
    document.getElementById('notesArea').value = notes;
}

function saveNotes() {
    const notes = document.getElementById('notesArea').value;
    localStorage.setItem(STORAGE_KEYS.NOTES, notes);
    
    // Visual feedback
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = 'Saved!';
    setTimeout(() => {
        btn.textContent = originalText;
    }, 1500);
}

// ==================== TODO LIST ====================
function loadTodos() {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    displayTodos(todos);
}

function displayTodos(todos) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';
    
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onchange="toggleTodo(${index})">
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-delete" onclick="deleteTodo(${index})">Delete</button>
        `;
        list.appendChild(li);
    });
}

function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    todos.push({ text, completed: false });
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    
    input.value = '';
    loadTodos();
}

function toggleTodo(index) {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    todos[index].completed = !todos[index].completed;
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    loadTodos();
}

function deleteTodo(index) {
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.TODOS) || '[]');
    todos.splice(index, 1);
    localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    loadTodos();
}

// ==================== POMODORO TIMER ====================
let timerInterval;
let timerSeconds = 25 * 60; // 25 minutes default
let isWorkSession = true;
let isPaused = true;

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
    if (!isPaused) return;
    
    isPaused = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            isPaused = true;
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
            
            // Play notification (browser will show permission request)
            playNotification();
            
            // Switch between work and break
            isWorkSession = !isWorkSession;
            if (isWorkSession) {
                timerSeconds = parseInt(document.getElementById('workMinutes').value) * 60;
            } else {
                timerSeconds = parseInt(document.getElementById('breakMinutes').value) * 60;
            }
            updateTimerDisplay();
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isPaused = true;
    isWorkSession = true;
    timerSeconds = parseInt(document.getElementById('workMinutes').value) * 60;
    updateTimerDisplay();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

function playNotification() {
    // Create a simple notification
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: isWorkSession ? 'Work session completed! Time for a break.' : 'Break completed! Time to work.',
            icon: '/favicon.ico'
        });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Pomodoro Timer', {
                    body: isWorkSession ? 'Work session completed! Time for a break.' : 'Break completed! Time to work.'
                });
            }
        });
    }
    
    // Simple audio beep (using Web Audio API)
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio notification not available');
    }
}

// Initialize timer display
updateTimerDisplay();

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Auto-save notes on typing
document.addEventListener('DOMContentLoaded', function() {
    let notesTimeout;
    document.getElementById('notesArea')?.addEventListener('input', function() {
        clearTimeout(notesTimeout);
        notesTimeout = setTimeout(() => {
            localStorage.setItem(STORAGE_KEYS.NOTES, this.value);
        }, 1000);
    });
});
