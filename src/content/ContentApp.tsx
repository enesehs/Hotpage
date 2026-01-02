import { useState, useEffect } from 'react';
import { StickyNotes } from '../components/StickyNotes/StickyNotes';
import type { StickyNote, Settings } from '../types/settings';
import { defaultSettings } from '../services/storage';

declare let chrome: any;

const STORAGE_KEY = 'hotpage-settings';

export const ContentApp = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        chrome.storage.local.get([STORAGE_KEY], (result: any) => {
            if (result[STORAGE_KEY]) {
                const loadedSettings = { ...defaultSettings, ...result[STORAGE_KEY] };
                setSettings(loadedSettings);
            }
        });

        const storageListener = (changes: any, areaName: string) => {
            if (areaName === 'local' && changes[STORAGE_KEY]) {
                const newValue = changes[STORAGE_KEY].newValue;
                if (newValue) {
                    const newSettings = { ...defaultSettings, ...newValue };
                    setSettings(newSettings);
                }
            }
        };

        chrome.storage.onChanged.addListener(storageListener);
        return () => chrome.storage.onChanged.removeListener(storageListener);
    }, []);

    useEffect(() => {
        const messageListener = (message: any) => {
            if (message.type === 'TOGGLE_STICKY') {
                setIsVisible(prev => !prev);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);
        return () => chrome.runtime.onMessage.removeListener(messageListener);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            const shortcut = settings.quickActions?.stickyNoteShortcut || 'Alt+N';
            const parts = shortcut.split('+').map(p => p.trim().toLowerCase());
            const key = parts[parts.length - 1];
            const needsShift = parts.includes('shift');
            const needsCtrl = parts.includes('ctrl') || parts.includes('control');
            const needsAlt = parts.includes('alt');

            if (!needsCtrl && !needsAlt) return;

            const keyMatches = e.key.toLowerCase() === key;
            const modifiersMatch =
                e.shiftKey === needsShift &&
                e.ctrlKey === needsCtrl &&
                e.altKey === needsAlt;

            if (keyMatches && modifiersMatch) {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }

            if (e.key === 'Escape' && isVisible) {
                setIsVisible(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [settings.quickActions?.stickyNoteShortcut, isVisible]);


    const handleNoteChange = (note: StickyNote | null) => {
        if (note === null) {
            setIsVisible(false);
            return;
        }

        const newSettings = { ...settings, stickyNote: note };
        setSettings(newSettings);

        chrome.storage.local.set({ [STORAGE_KEY]: newSettings });
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            pointerEvents: 'none',
            width: '100vw',
            height: '100vh',
            zIndex: 999999
        }}>
            <style>{`
        /* Default CSS variables for Shadow DOM isolation */
        :host {
          all: initial;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          --color-primary: #3b82f6;
          --color-primary-rgb: 59, 130, 246;
          --color-secondary: #8b5cf6;
          --color-secondary-rgb: 139, 92, 246;
          --color-accent: #ec4899;
          --color-accent-rgb: 236, 72, 153;
          --color-surface: #ffffff;
          --color-surface-rgb: 255, 255, 255;
          --color-border-rgb: 0, 0, 0;
          --color-text: #f8fafc;
          --color-textSecondary: rgba(248, 250, 252, 0.7);
          --radius-sm: 6px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --spacing-xs: 6px;
          --spacing-sm: 12px;
          --spacing-md: 16px;
          --transition-fast: 0.15s ease;
        }
        *, *::before, *::after {
          box-sizing: border-box;
        }
      `}</style>
            <StickyNotes
                note={settings.stickyNote}
                onNoteChange={handleNoteChange}
                defaultTodos={settings.todos}
                shortcut={settings.quickActions?.stickyNoteShortcut || 'Alt+N'}
            />
        </div>
    );
};
