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
            <video src={getAssetUrl("/video/introduction.webm")} className="intro-video" autoPlay muted loop playsInline />
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
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M9.197 0L7.578 3.735H5.171v3.359h.921l.943 5.975H5.562L7.51 24.042l1.249-.015L10.015 32h11.891l.083-.531l1.172-7.443l1.188.015l1.943-10.973h-1.407l.937-5.975h1.011V3.734h-2.557L22.651-.001zm.704 1.073h12.057l1.025 2.375H8.868zm-3.666 3.73H25.76v1.228H6.235zm.604 9.333h18.183l-1.568 8.823l-7.536-.079l-7.511.079z"/></svg>
              <span>{isTurkish ? 'Destekle' : 'Support'}</span>
            </button>
            <button className="intro-btn github" onClick={handleOpenSource}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="none"><g clip-path="url(#SVGXv8lpc2Y)"><path fill="currentColor" fill-rule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12" clip-rule="evenodd"/></g><defs><clipPath id="SVGXv8lpc2Y"><path fill="#fff" d="M0 0h24v24H0z"/></clipPath></defs></g></svg>
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
