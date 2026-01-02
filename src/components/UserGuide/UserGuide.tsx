
import { useEffect, useState, useCallback } from 'react';
import './UserGuide.css';

interface Step {
    target: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
    icon?: string;
    action?: string;
    fallbackMessage?: string;
}

interface UserGuideProps {
    isOpen: boolean;
    onComplete: () => void;
    locale: string;
    onOpenStickyNotes?: () => void;
    onCloseStickyNotes?: () => void;
}

export const UserGuide = ({ isOpen, onComplete, locale, onOpenStickyNotes, onCloseStickyNotes }: UserGuideProps) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [showFallback, setShowFallback] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const isTurkish = locale.toLowerCase().startsWith('tr');

    const steps: Step[] = [
        {
            target: '.search-bar',
            title: isTurkish ? 'Akıllı Arama Çubuğu' : 'Smart Search Bar',
            content: isTurkish
                ? 'Varsayılan arama motorunuzu kullanarak anında arama yapın. Matematik işlemleri yapabilir (örn: "125*3") ve Aramaya şimdi başlayabilirsiniz!'
                : 'Search instantly using your default engine. Calculate math (e.g. "125*3") and go directly to Search!',
            position: 'bottom',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
        },
        {
            target: '.quick-links',
            title: isTurkish ? 'Hızlı Linkler' : 'Quick Links',
            content: isTurkish
                ? 'Sık kullandığınız siteleri ekleyin! (+) butonuyla yeni link ekleyin, sürükleyerek sıralayın, sağ tıklayarak düzenleyin veya silin. Faviconlar otomatik olarak çekilir.'
                : 'Add your favorite sites! Click (+) to add new links, drag to reorder, right-click to edit or delete. Favicons are fetched automatically.',
            position: 'bottom',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
        },
        {
            target: '.weather-widget',
            title: isTurkish ? 'Hava Durumu' : 'Weather Widget',
            content: isTurkish
                ? 'Güncel hava durumunu görün! Sıcaklık, nem, rüzgar hızı, basınç ve 5 günlük tahmin. Ayarlardan şehrinizi girin veya IP tabanlı konum kullanın. Celsius/Fahrenheit seçimi de mevcut!'
                : 'View current weather! Temperature, humidity, wind speed, pressure, and 5-day forecast. Enter your city in settings or use IP-based location. Celsius/Fahrenheit option available!',
            position: 'top',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>'
        },
        {
            target: '.currency-widget',
            title: isTurkish ? 'Döviz & Kripto' : 'Currencies & Crypto',
            content: isTurkish
                ? 'Döviz kurlarını anlık takip edin! Dolar, Euro, Altın ve daha fazlası. Kripto sekmesinde Bitcoin, Ethereum gibi coinleri 7 günlük grafikleriyle görün. Ayarlardan görmek istediğiniz dövizleri özelleştirin.'
                : 'Track exchange rates in real-time! USD, EUR, Gold and more. View Bitcoin, Ethereum with 7-day sparkline charts in Crypto tab. Customize which currencies you want to see in settings.',
            position: 'top',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
        },
        {
            target: '.rss-widget',
            title: isTurkish ? 'RSS Haberleri' : 'RSS News Feed',
            content: isTurkish
                ? 'Favori haber kaynaklarınızı tek bir yerden takip edin! Ayarlardan RSS URL\'i ekleyin, kategorilere ayırın. Haberler otomatik güncellenir ve tıklayarak kaynak siteye gidin.'
                : 'Follow your favorite news sources in one place! Add RSS URLs in settings, organize by categories. News updates automatically - click to visit source site.',
            position: 'top',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>'
        },
        {
            target: '.sticky-note.sticky-note-primary',
            title: isTurkish ? 'Sticky Notes & Pomodoro' : 'Sticky Notes & Pomodoro',
            content: isTurkish
                ? 'Hızlı notlar alın, yapılacaklar listesi oluşturun! Pomodoro zamanlayıcısı ile odaklanın (25dk çalışma + 5dk mola). Alt+N ile açın/kapatın. Tüm sekmelerde otomatik senkronize!'
                : 'Take quick notes, create to-do lists! Focus with Pomodoro timer (25min work + 5min break). Press Alt+N to toggle. Auto-syncs across all tabs!',
            position: 'left',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>',
            action: 'openStickyNotes',
            fallbackMessage: isTurkish ? 'Sticky Notes\'u açmak için Alt+N tuşlarına basın!' : 'Press Alt+N to open Sticky Notes!'
        }
    ];


    const updateRectForStep = useCallback((stepIndex: number) => {
        const step = steps[stepIndex];
        if (!step) return;

        if (step.action === 'openStickyNotes') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => {
                if (onOpenStickyNotes) {
                    onOpenStickyNotes();
                }
                setTimeout(() => {
                    const element = document.querySelector(step.target);
                    if (element) {
                        const newRect = element.getBoundingClientRect();
                        setRect(newRect);
                        setShowFallback(false);
                    } else {
                        setShowFallback(true);
                        setRect(new DOMRect(window.innerWidth / 2 - 200, window.innerHeight / 2 - 100, 400, 200));
                    }
                }, 600);
            }, 500);
            return;
        }

        setTimeout(() => {
            const element = document.querySelector(step.target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => {
                    const newRect = element.getBoundingClientRect();
                    setRect(newRect);
                    setShowFallback(false);
                }, 500);
            } else {
                setCurrentStep(prev => prev + 1);
            }
        }, 100);
    }, [onOpenStickyNotes, steps.length]);

    // Disable body scroll when guide is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setCurrentStep(0);
            setRect(null);
            setShowFallback(false);
            setShowCompletion(false);
            return;
        }

        if (showCompletion) return;

        const timer = setTimeout(() => updateRectForStep(currentStep), 400);
        return () => clearTimeout(timer);
    }, [isOpen, currentStep, updateRectForStep, showCompletion]);

    useEffect(() => {
        if (!isOpen || showCompletion) return;

        const handleResize = () => {
            const step = steps[currentStep];
            const element = document.querySelector(step?.target || '');
            if (element) {
                setRect(element.getBoundingClientRect());
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isOpen, currentStep, showCompletion]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setRect(null);
            setCurrentStep(prev => prev + 1);
        } else {
            setRect(null);
            setShowCompletion(true);
        }
    };

    const handleGitHub = () => {
        window.open('https://github.com/enesehs/Hotpage', '_blank', 'noopener,noreferrer');
    };

    const handleFinish = () => {
        if (onCloseStickyNotes) {
            onCloseStickyNotes();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        onComplete();
    };

    if (!isOpen) return null;

    const step = steps[currentStep];

    if (showCompletion) {
        return (
            <div className="guide-overlay active">
                <div className="guide-completion">
                    <div className="guide-completion-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2>{isTurkish ? 'Tur Tamamlandı!' : 'Tour Complete!'}</h2>
                    <p>{isTurkish
                        ? 'HotPage\'in temel özelliklerini keşfettiniz. Daha fazla bilgi için GitHub sayfamızı ziyaret edebilirsiniz.'
                        : 'You\'ve discovered the core features of HotPage. Visit our GitHub page for more details and documentation.'}
                    </p>
                    <div className="guide-completion-actions">
                        <button className="guide-completion-github" onClick={handleGitHub}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12" /></svg>
                            {isTurkish ? 'GitHub\'da Görüntüle' : 'View on GitHub'}
                        </button>
                        <button className="guide-completion-finish" onClick={handleFinish}>
                            {isTurkish ? 'Başla' : 'Get Started'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="guide-overlay active">
            {rect && !showFallback && (
                <div
                    className="guide-spotlight"
                    style={{
                        top: rect.top - 8,
                        left: rect.left - 8,
                        width: rect.width + 16,
                        height: rect.height + 16
                    }}
                />
            )}

            {rect && (
                <div
                    className={`guide-tooltip ${showFallback ? 'center' : step.position}`}
                    style={showFallback ? {
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    } : {
                        top: step.position === 'bottom' ? rect.bottom + 24 :
                            step.position === 'top' ? rect.top - 24 :
                                rect.top + (rect.height / 2),
                        left: step.position === 'right' ? rect.right + 24 :
                            step.position === 'left' ? rect.left - 24 :
                                rect.left + (rect.width / 2)
                    }}
                >
                    <div className="guide-header">
                        {step.icon && (
                            <div className="guide-icon" dangerouslySetInnerHTML={{ __html: step.icon }} />
                        )}
                        <h3>{step.title}</h3>
                    </div>
                    <p>{showFallback && step.fallbackMessage ? step.fallbackMessage : step.content}</p>
                    <div className="guide-actions">
                        <span className="step-count">{currentStep + 1} / {steps.length}</span>
                        <button className="guide-btn-next" onClick={handleNext}>
                            {isTurkish ? 'İleri' : 'Next'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
