/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;
import './IntroModal.css';

interface IntroModalProps {
  isOpen: boolean;
  locale?: string;
  onSkip: () => void;
  onSupport?: () => void;
  onOpenSource?: () => void;
}

const defaultSupportUrl = 'https://buymeacoffee.com/enesehs';
const defaultGithubUrl = 'https://github.com/enesehs/Hotpage';

export const IntroModal = ({ isOpen, locale, onSkip, onSupport, onOpenSource }: IntroModalProps) => {
  if (!isOpen) return null;

  const resolvedLocale = locale
    ?? (typeof navigator !== 'undefined'
      ? (navigator.language || (Array.isArray(navigator.languages) ? navigator.languages[0] : ''))
      : '');

  const isTurkish = (resolvedLocale || '').toLowerCase().startsWith('tr');

  const heading = isTurkish
    ? 'HotPage\u2019e Ho\u015F Geldin'
    : 'Welcome to HotPage';

  const body = isTurkish
    ? [
      'HotPage, taray\u0131c\u0131n\u0131 a\u00E7t\u0131\u011F\u0131nda kar\u015F\u0131na \u00E7\u0131kan modern ve ki\u015Fisel bir ba\u015Flang\u0131\u00E7 sayfas\u0131d\u0131r. H\u0131zl\u0131 arama yapabilir, s\u0131k kulland\u0131\u011F\u0131n ba\u011Flant\u0131lar\u0131 kaydedebilir, hava durumunu g\u00F6rebilir, d\u00F6viz ve kripto kurlar\u0131n\u0131 takip edebilir, RSS ak\u0131\u015Flar\u0131n\u0131 okuyabilir ve Pomodoro zamanlay\u0131c\u0131s\u0131yla odaklanabilirsin.',
      'T\u00FCm g\u00F6r\u00FCn\u00FCm\u00FC diledi\u011Fin gibi \u015Fekillendirebilirsin. Arka plan\u0131, temay\u0131, arama motorunu ve widget d\u00FCzenini tamamen kendi tarz\u0131na g\u00F6re ayarlaman yeterli. HotPage, yeni bir sekme a\u00E7t\u0131\u011F\u0131nda seni ger\u00E7ekten \u201Csenin sayfan\u201D gibi hissettiren sade ama g\u00FC\u00E7l\u00FC bir alan olu\u015Fturur.',
      'Ayr\u0131ca HotPage tamamen a\u00E7\u0131k kaynak. Projeye GitHub \u00FCzerinden katk\u0131da bulunabilir, geli\u015Ftirmelere kat\u0131labilir veya yeni \u00F6zellikler eklenmesine yard\u0131mc\u0131 olabilirsin.',
    ]
    : [
      'HotPage is a modern, personal start page that welcomes you every time you open your browser. You can search instantly, save your favorite shortcuts, check the weather, track currency and crypto prices, follow RSS feeds, and stay focused with a built-in Sticky Notes, Todo List and Pomodoro timer.',
      'Everything about the page is customizable. Change the background, theme, search engine, and widget layout to match your own style. HotPage gives each new tab a clean, simple space that feels personal and genuinely yours.',
      'HotPage is also completely open-source. You\u2019re welcome to contribute on GitHub, help improve the project, or build new features together with the community.',
    ];

  const handleSupport = () => {
    if (onSupport) onSupport();
    else window.open(defaultSupportUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenSource = () => {
    if (onOpenSource) onOpenSource();
    else window.open(defaultGithubUrl, '_blank', 'noopener,noreferrer');
  };

  // Get asset URL that works in both web and extension contexts
  const getAssetUrl = (path: string) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(path);
    }
    return path;
  };

  return (
    <div className="intro-overlay">
      <div className="intro-card">
        <div className="intro-media">
          <div className="intro-video-frame">
            <img src={getAssetUrl("/video/introduction.webm")} alt="HotPage introduction" className="intro-video" />
          </div>
        </div>
        <div className="intro-content">
          <div className="intro-header">
            <div className="intro-accent" />
            <h2>{heading}</h2>
          </div>
          <div className="intro-body">
            {body.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <div className="intro-actions">
            <button className="intro-btn support" onClick={handleSupport}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5h14v11a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V5Z" />
                <path d="M9 5V3h6v2" />
                <path d="M7 9h10" />
              </svg>
              <span>{isTurkish ? 'Destekle' : 'Support'}</span>
            </button>
            <button className="intro-btn github" onClick={handleOpenSource}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.61-3.37-1.34-3.37-1.34a2.65 2.65 0 0 0-1.11-1.46c-.91-.62.07-.6.07-.6a2.1 2.1 0 0 1 1.53 1.03 2.14 2.14 0 0 0 2.92.83 2.12 2.12 0 0 1 .63-1.34c-2.22-.25-4.56-1.11-4.56-4.95a3.88 3.88 0 0 1 1-2.69 3.6 3.6 0 0 1 .1-2.65s.84-.27 2.75 1a9.6 9.6 0 0 1 5 0c1.9-1.31 2.74-1 2.74-1a3.6 3.6 0 0 1 .1 2.65 3.88 3.88 0 0 1 1 2.69c0 3.85-2.34 4.69-4.58 4.94a2.37 2.37 0 0 1 .67 1.84v2.73c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
              </svg>
              <span>{isTurkish ? 'A\u00E7\u0131k Kaynak' : 'Open Source'}</span>
            </button>
            <button className="intro-btn ghost" onClick={onSkip}>
              {isTurkish ? 'Ge\u00E7' : 'Skip'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
