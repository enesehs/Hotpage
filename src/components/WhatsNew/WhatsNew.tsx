import { useState, useEffect } from 'react';
import './WhatsNew.css';

interface WhatsNewProps {
    currentVersion: string;
    locale: string;
    onClose: () => void;
}

interface Change {
    icon: string;
    title: { tr: string; en: string };
    description: { tr: string; en: string };
}

const CHANGES: Change[] = [
    {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
        title: { tr: 'Interaktif Kullanım Kılavuzu', en: 'Interactive User Guide' },
        description: { tr: 'Yeni başlayanlar için adım adım tur', en: 'Step-by-step tour for new users' }
    },
    {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
        title: { tr: 'Google Kısayolları', en: 'Google Shortcuts' },
        description: { tr: 'Gmail, Drive, Photos ve daha fazlası', en: 'Gmail, Drive, Photos and more' }
    },
    {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
        title: { tr: 'Hesap Makinesi', en: 'Calculator' },
        description: { tr: 'Arama çubuğunda matematik işlemleri', en: 'Math operations in search bar' }
    },
    {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
        title: { tr: 'Widget İyileştirmeleri', en: 'Widget Improvements' },
        description: { tr: 'Hava durumu, döviz, RSS güncelleme zamanı', en: 'Weather, currency, RSS update time' }
    },
    {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
        title: { tr: 'Sticky Notes Senkronizasyon', en: 'Sticky Notes Sync' },
        description: { tr: 'Tüm sekmelerde gerçek zamanlı senkronizasyon', en: 'Real-time sync across all tabs' }
    }
];

export const WhatsNew = ({ currentVersion, locale, onClose }: WhatsNewProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const isTurkish = locale.toLowerCase().startsWith('tr');

    useEffect(() => {
        setIsVisible(true);
        document.body.classList.add('no-scroll');

        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 200);
    };

    const handleGitHub = () => {
        window.open('https://github.com/enesehs/Hotpage/releases', '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={`whatsnew-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
            <div className="whatsnew-modal" onClick={(e) => e.stopPropagation()}>
                <button className="whatsnew-close" onClick={handleClose}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="whatsnew-header">
                    <div className="whatsnew-badge">{currentVersion}</div>
                    <h2>{isTurkish ? 'Yenilikler' : "What's New"}</h2>
                    <p>{isTurkish ? 'HotPage bu sürümde neler değişti?' : 'See what changed in this version'}</p>
                </div>

                <div className="whatsnew-list">
                    {CHANGES.map((change, index) => (
                        <div key={index} className="whatsnew-item">
                            <div className="whatsnew-item-icon" dangerouslySetInnerHTML={{ __html: change.icon }} />
                            <div className="whatsnew-item-content">
                                <h4>{isTurkish ? change.title.tr : change.title.en}</h4>
                                <p>{isTurkish ? change.description.tr : change.description.en}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="whatsnew-actions">
                    <button className="whatsnew-github" onClick={handleGitHub}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12" /></svg>
                        {isTurkish ? 'Tüm Değişiklikler' : 'Full Changelog'}
                    </button>
                    <button className="whatsnew-continue" onClick={handleClose}>
                        {isTurkish ? 'Devam Et' : 'Continue'}
                    </button>
                </div>
            </div>
        </div>
    );
};
