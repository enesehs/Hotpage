import { useState, useRef, useEffect } from 'react';
import { googleIcons } from '../../data/icons';
import './GoogleShortcuts.css';

interface GoogleShortcutsProps {
    showGmail?: boolean;
    showAppsMenu?: boolean;
}

const GOOGLE_APPS = [
    {
        name: 'Google Settings',
        url: 'https://www.google.com/settings',
        icon: googleIcons.gsettings,
        colorClass: 'google-icon'
    },
    {
        name: 'Gmail',
        url: 'https://mail.google.com',
        icon: googleIcons.gmail,
        colorClass: 'gmail-icon'
    },
    {
        name: 'Drive',
        url: 'https://drive.google.com',
        icon: googleIcons.drive,
        colorClass: 'drive-icon'
    },
    {
        name: 'Calendar',
        url: 'https://calendar.google.com',
        icon: googleIcons.calendar,
        colorClass: 'calendar-icon'
    },
    {
        name: 'Maps',
        url: 'https://maps.google.com',
        icon: googleIcons.maps,
        colorClass: 'maps-icon'
    },
    {
        name: 'Photos',
        url: 'https://photos.google.com',
        icon: googleIcons.photos,
        colorClass: 'photos-icon'
    },
    {
        name: 'Meet',
        url: 'https://meet.google.com',
        icon: googleIcons.meet,
        colorClass: 'calendar-icon'
    },
    {
        name: 'Translate',
        url: 'https://translate.google.com',
        icon: googleIcons.translate,
        colorClass: 'drive-icon'
    },
    {
        name: 'Quick Paint',
        url: 'https://excalidraw.com/',
        icon: googleIcons.paint,
        colorClass: 'drive-icon'
    }
];

export const GoogleShortcuts = ({ showGmail = true, showAppsMenu = true }: GoogleShortcutsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="google-shortcuts">
            {showGmail && (
                <a
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-shortcut-btn"
                    title="Gmail"
                >
                    <div
                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'currentColor' }}
                        dangerouslySetInnerHTML={{ __html: googleIcons.gmail }}
                    />
                </a>
            )}

            {showAppsMenu && (
                <div className="google-apps-menu" ref={menuRef}>
                    <button
                        className="google-shortcut-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        title="Google Apps"
                    >
                        <div
                            style={{ width: '24px', height: '24px', color: 'currentColor' }}
                            dangerouslySetInnerHTML={{ __html: googleIcons.grid }}
                        />
                    </button>

                    <div className={`google-apps-dropdown ${isOpen ? 'open' : ''}`}>
                        <div className="google-apps-grid">
                            {GOOGLE_APPS.map((app) => (
                                <a
                                    key={app.name}
                                    href={app.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="google-app-item"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div
                                        className={`google-app-icon ${app.colorClass}`}
                                        dangerouslySetInnerHTML={{ __html: app.icon }}
                                    />
                                    <span className="google-app-name">{app.name}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
