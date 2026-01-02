declare let chrome: any;


const STORAGE_KEY = 'hotpage-settings';
let pomodoroInterval: ReturnType<typeof setInterval> | null = null;

chrome.runtime.onInstalled.addListener(() => {
    console.log('HotPage Extension Installed');
});

chrome.commands.onCommand.addListener((command: string) => {
    if (command === 'toggle-sticky-notes') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_STICKY' }).catch(() => {
                });
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: any) => {
    if (request.type === 'TOGGLE_STICKY_ALL') {
        chrome.tabs.query({}, (tabs: any[]) => {
            tabs.forEach((tab: any) => {
                if (tab.id && tab.id !== sender.tab?.id) {
                    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_STICKY' }).catch(() => { });
                }
            });
        });
        sendResponse({ success: true });
        return true;
    }

    if (request.type === 'FETCH_RSS') {
        fetchRSS(request.url)
            .then((data: string) => sendResponse({ success: true, data }))
            .catch((error: Error) => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

async function fetchRSS(url: string): Promise<string> {
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

    console.log('[HotPage] Starting Pomodoro timer');

    pomodoroInterval = setInterval(() => {
        chrome.storage.local.get([STORAGE_KEY], (result: any) => {
            const settings = result[STORAGE_KEY];
            if (!settings?.stickyNote?.pomodoro?.isRunning) {
                stopPomodoroTimer();
                return;
            }

            const note = settings.stickyNote;
            const newTimeLeft = note.pomodoro.timeLeft - 1;

            let updatedPomodoro;

            if (newTimeLeft <= 0) {
                console.log('[HotPage] Timer complete. Current mode:', note.pomodoro.mode);
                console.log('[HotPage] Current sessions:', note.pomodoro.sessionsCompleted);

                const currentSessions = Number(note.pomodoro.sessionsCompleted) || 0;

                const isWorkSession = note.pomodoro.mode === 'work' || note.pomodoro.mode === 'custom';

                const nextSessions = isWorkSession
                    ? currentSessions + 1
                    : currentSessions;

                const nextMode = isWorkSession
                    ? (nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak')
                    : 'work';

                const nextDuration = nextMode === 'work'
                    ? note.pomodoro.workDuration * 60
                    : nextMode === 'shortBreak'
                        ? note.pomodoro.shortBreakDuration * 60
                        : note.pomodoro.longBreakDuration * 60;

                console.log('[HotPage] Next sessions:', nextSessions);
                console.log('[HotPage] Next mode:', nextMode);

                chrome.notifications.create('pomodoro-complete', {
                    type: 'basic',
                    iconUrl: 'img/White/White_128.png',
                    title: 'Pomodoro Timer',
                    message: note.pomodoro.mode === 'work'
                        ? 'Work session complete! Time for a break.'
                        : 'Break is over! Time to focus.',
                    priority: 2
                });

                updatedPomodoro = {
                    ...note.pomodoro,
                    isRunning: false,
                    mode: nextMode,
                    timeLeft: nextDuration,
                    sessionsCompleted: nextSessions,
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
        console.log('[HotPage] Stopping Pomodoro timer');
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
    }
}

chrome.storage.onChanged.addListener((changes: any, areaName: string) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) return;

    const newSettings = changes[STORAGE_KEY].newValue;
    const isRunning = newSettings?.stickyNote?.pomodoro?.isRunning;

    console.log('[HotPage] Storage changed, isRunning:', isRunning);

    if (isRunning && !pomodoroInterval) {
        startPomodoroTimer();
    } else if (!isRunning && pomodoroInterval) {
        stopPomodoroTimer();
    }
});

chrome.storage.local.get([STORAGE_KEY], (result: any) => {
    const settings = result[STORAGE_KEY];
    console.log('[HotPage] Startup check, isRunning:', settings?.stickyNote?.pomodoro?.isRunning);
    if (settings?.stickyNote?.pomodoro?.isRunning) {
        startPomodoroTimer();
    }
});
