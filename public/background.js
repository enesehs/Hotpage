
const STORAGE_KEY = 'hotpage-settings';
let pomodoroInterval = null;

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-sticky-notes') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_STICKY' }).catch(() => {
        });
      }
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TOGGLE_STICKY_ALL') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id && tab.id !== sender.tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_STICKY' }).catch(() => {});
        }
      });
    });
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'FETCH_RSS') {
    fetchRSS(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function fetchRSS(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();

    if (!text.trim().startsWith('<')) {
      throw new Error('Invalid RSS format');
    }

    return text;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}


function startPomodoroTimer() {
  if (pomodoroInterval) return;
  
  pomodoroInterval = setInterval(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const settings = result[STORAGE_KEY];
      if (!settings?.stickyNote?.pomodoro?.isRunning) {
        stopPomodoroTimer();
        return;
      }

      const note = settings.stickyNote;
      const newTimeLeft = note.pomodoro.timeLeft - 1;

      let updatedPomodoro;
      
      if (newTimeLeft <= 0) {
        const nextMode = note.pomodoro.mode === 'work'
          ? ((note.pomodoro.sessionsCompleted + 1) % 4 === 0 ? 'longBreak' : 'shortBreak')
          : 'work';

        const nextDuration = nextMode === 'work'
          ? note.pomodoro.workDuration * 60
          : nextMode === 'shortBreak'
            ? note.pomodoro.shortBreakDuration * 60
            : note.pomodoro.longBreakDuration * 60;

        updatedPomodoro = {
          ...note.pomodoro,
          isRunning: false,
          mode: nextMode,
          timeLeft: nextDuration,
          sessionsCompleted: note.pomodoro.mode === 'work'
            ? note.pomodoro.sessionsCompleted + 1
            : note.pomodoro.sessionsCompleted,
        };
        
        stopPomodoroTimer();
      } else {
        updatedPomodoro = {
          ...note.pomodoro,
          timeLeft: newTimeLeft,
        };
      }

      chrome.storage.local.set({
        [STORAGE_KEY]: {
          ...settings,
          stickyNote: {
            ...note,
            pomodoro: updatedPomodoro,
          },
        },
      });
    });
  }, 1000);
}

function stopPomodoroTimer() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes[STORAGE_KEY]) return;
  
  const newSettings = changes[STORAGE_KEY].newValue;
  const isRunning = newSettings?.stickyNote?.pomodoro?.isRunning;
  
  if (isRunning && !pomodoroInterval) {
    startPomodoroTimer();
  } else if (!isRunning && pomodoroInterval) {
    stopPomodoroTimer();
  }
});

chrome.storage.local.get([STORAGE_KEY], (result) => {
  const settings = result[STORAGE_KEY];
  if (settings?.stickyNote?.pomodoro?.isRunning) {
    startPomodoroTimer();
  }
});
