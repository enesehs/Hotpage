import { useEffect, useState } from 'react';
import { uiIcons } from '../data/icons';
import '../index.css';
import './index.css';

declare const chrome: any;

export default function Popup() {
    const [showStickyNotes, setShowStickyNotes] = useState(false);
    const [version, setVersion] = useState('');
    const [browser, setBrowser] = useState<'chrome' | 'firefox'>('chrome');

    useEffect(() => {
        const manifest = chrome.runtime.getManifest();
        setVersion(manifest.version);

        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('firefox') > -1) {
            setBrowser('firefox');
        }

        chrome.storage.local.get(['hotpage-settings'], (result: any) => {
            const settings = result['hotpage-settings'];
            if (settings?.quickActions?.openStickyNotes !== undefined) {
                setShowStickyNotes(settings.quickActions.openStickyNotes);
            }
        });
    }, []);

    const toggleStickyNotes = () => {
        chrome.storage.local.get(['hotpage-settings'], (result: any) => {
            const settings = result['hotpage-settings'] || {};
            const newSettings = {
                ...settings,
                quickActions: {
                    ...settings.quickActions,
                    openStickyNotes: !showStickyNotes
                }
            };

            chrome.storage.local.set({ 'hotpage-settings': newSettings });
            setShowStickyNotes(!showStickyNotes);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_STICKY' }).catch(() => { });
                }
            });
        });
    };

    const openLink = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <div className="popup-container">
            <header className="popup-header">
                <img src="/img/White/White_48.png" alt="HotPage" className="logo" />
                <h1>HotPage</h1>
                <span className="version">v{version}</span>
            </header>

            <div className="popup-content">
                <div className="control-group">
                    <label className="toggle-row">
                        <div className="label-text">
                            <span className="title">Sticky Notes</span>
                            <span className="subtitle">Show/Hide Notes</span>
                        </div>
                        <div className={`toggle-switch ${showStickyNotes ? 'active' : ''}`} onClick={toggleStickyNotes}>
                            <div className="knob" />
                        </div>
                    </label>
                </div>

                <div className="divider"></div>

                <div className="links-group">
                    <button className="link-item highlight" onClick={() => openLink(
                        browser === 'chrome'
                            ? 'https://chromewebstore.google.com/detail/hotpage-customizable-home/ikfpbpapkibdkponpnfeedlfmfdkgmof'
                            : 'https://addons.mozilla.org/en-US/firefox/addon/hotpage-customizable-homepage/'
                    )}>
                        <span className="icon" dangerouslySetInnerHTML={{ __html: uiIcons.star }} />
                        <span className="label">Rate Us (5★)</span>
                    </button>

                    <button className="link-item" onClick={() => openLink('https://github.com/enesehs/Hotpage/releases')}>
                        <span className="icon" dangerouslySetInnerHTML={{ __html: uiIcons.github || '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>' }} />
                        <span className="label">Change Log</span>
                    </button>

                    <button className="link-item" onClick={() => openLink('https://enesehs.dev')}>
                        <span className="icon" dangerouslySetInnerHTML={{ __html: uiIcons.globe || '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93c0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41c0 2.08-.8 3.97-2.1 5.39z"/></svg>' }} />
                        <span className="label">Developer</span>
                    </button>

                    <button className="link-item" onClick={() => openLink('https://github.com/enesehs/Hotpage/issues')}>
                        <span className="icon" dangerouslySetInnerHTML={{ __html: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41L15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3L7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 12h-4v-1h4v1zm0-2h-4v-1h4v1zm0-3h-4V8h4v7z"/></svg>' }} />
                        <span className="label">Report a Bug</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
