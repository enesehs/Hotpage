import { useState, useEffect, useRef } from 'react';
import './SettingsPanel.css';
import type { Settings } from '../../types/settings';
import { imageStorage } from '../../services/imageStorage';
import { applyTheme, getTheme } from '../../utils/themeUtils';
import { exportSettings as exportSettingsToJson, importSettings as importSettingsFromJson, defaultSettings } from '../../services/storage';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (updates: Partial<Settings>) => void;
  onOpenStickyNotes: () => void;
  rssStats?: { 
    feeds: number; 
    items: number; 
    success: number; 
    error: number; 
    empty: number; 
    lastUpdated: string;
    failedFeeds?: string[];
  };
}

export const SettingsPanel = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onOpenStickyNotes,
  rssStats,
}: SettingsPanelProps) => {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'widgets'>('general');
  const [backgroundImages, setBackgroundImages] = useState<Array<{ id: string; url: string; filename: string }>>([]);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingNature, setIsLoadingNature] = useState(false);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [isLoadingIstanbul, setIsLoadingIstanbul] = useState(false);
  const [isLoadingSpace, setIsLoadingSpace] = useState(false);
  const [isLoadingOcean, setIsLoadingOcean] = useState(false);
  const [rssInput, setRssInput] = useState('');
  const [rssCategoryInput, setRssCategoryInput] = useState('General');
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await imageStorage.getAllImages();
        setBackgroundImages(images);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    if (isOpen) {
      loadImages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleThemeChange = (themeName: string) => {
    const theme = getTheme(themeName, settings.customThemeColors);
    applyTheme(theme);
    onSettingsChange({ theme: themeName });
  };

  const handleCustomColorChange = (colorKey: string, colorValue: string) => {
    const newCustomColors = {
      ...settings.customThemeColors,
      [colorKey]: colorValue,
    };
    if (settings.theme === 'custom') {
      const theme = getTheme('custom', newCustomColors as any);
      applyTheme(theme);
    }
    onSettingsChange({
      customThemeColors: newCustomColors as any
    });
  };

  const toggleWidget = (widgetId: keyof Settings['widgets']) => {
    const currentWidget = settings.widgets[widgetId] || { enabled: false };
    onSettingsChange({
      widgets: {
        ...settings.widgets,
        [widgetId]: {
          ...currentWidget,
          enabled: !currentWidget.enabled,
        },
      },
    });
  };

  const handleExportSettings = () => {
    try {
      const blob = new Blob([exportSettingsToJson(settings)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hotpage-settings.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      alert('Export failed.');
    }
  };

  const handleImportSettingsClick = () => {
    importFileRef.current?.click();
  };

  const handleImportSettingsChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = importSettingsFromJson(text);
      if (imported) {
        onSettingsChange(imported);
      } else {
        alert('Import failed. Invalid file.');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      alert('Import failed.');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearAllData = () => {
    const confirmClear = window.confirm('Clear all HotPage data? This cannot be undone.');
    if (!confirmClear) return;

    try {
      localStorage.removeItem('hotpage-settings');
      onSettingsChange({ ...defaultSettings });
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Could not clear data.');
    }
  };

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            ×
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`tab ${activeTab === 'widgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('widgets')}
          >
            Widgets
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section">
              <h3>Time Format</h3>
              <div className="theme-selector">
                <button
                  className={`theme-btn ${(!settings.locale || settings.locale === 'system' || settings.locale?.includes('US')) ? 'active' : ''}`}
                  onClick={() => onSettingsChange({ locale: 'en-US' })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  12-Hour
                </button>
                <button
                  className={`theme-btn ${settings.locale && !settings.locale.includes('US') && settings.locale !== 'system' ? 'active' : ''}`}
                  onClick={() => onSettingsChange({ locale: 'en-GB' })}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  24-Hour
                </button>
              </div>

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Language / Locale</h3>
              <select 
                className="settings-select"
                value={settings.locale || 'en-US'}
                onChange={(e) => onSettingsChange({ locale: e.target.value })}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="tr-TR">Türkçe (Turkish)</option>
                <option value="de-DE">Deutsch (German)</option>
                <option value="fr-FR">Français (French)</option>
                <option value="es-ES">Español (Spanish)</option>
                <option value="it-IT">Italiano (Italian)</option>
                <option value="pt-BR">Português (Brazilian)</option>
                <option value="ru-RU">Русский (Russian)</option>
                <option value="ja-JP">日本語 (Japanese)</option>
                <option value="ko-KR">한국어 (Korean)</option>
                <option value="zh-CN">简体中文 (Chinese Simplified)</option>
                <option value="ar-SA">العربية (Arabic)</option>
              </select>

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Data & Privacy</h3>
              <button className="settings-btn danger" onClick={handleClearAllData}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                <span>Clear All Data</span>
              </button>

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Import/Export</h3>
              <div className="button-group">
                <button className="settings-btn" onClick={handleExportSettings}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" x2="12" y1="3" y2="15"/>
                  </svg>
                  <span>Export Settings</span>
                </button>
                <button className="settings-btn" onClick={handleImportSettingsClick}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                  <span>Import Settings</span>
                </button>
                <input
                  ref={importFileRef}
                  type="file"
                  accept="application/json"
                  style={{ display: 'none' }}
                  onChange={handleImportSettingsChange}
                />
              </div>

            <h3 style={{ marginTop: 'var(--spacing-xl)' }}>About</h3>
            <div className="about-info">
              <p><strong>HotPage v0.1 [Open Beta]</strong></p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-textSecondary)' }}>
                A customizable browser homepage with widgets and productivity tools.
              </p>

              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Tech Stack</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-textSecondary)', margin: 0 }}>
                  React 19 • Vite 7 • TypeScript
                </p>
              </div>

              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Privacy</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-textSecondary)', margin: 0 }}>
                  No tracking. No analytics. All data stays locally in your browser.
                </p>
              </div>

              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>License</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-textSecondary)', margin: 0 }}>
                  Licensed under the MIT License. You are free to use, modify, and distribute this software with attribution.
                </p>
              </div>

              <div style={{ marginTop: 'var(--spacing-lg)' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-sm)' }}>Links</p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}>
                  <li>
                    <a 
                      href="https://github.com/enesehs/Hotpage"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '0.8125rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M11.999 1C5.926 1 1 5.925 1 12c0 4.86 3.152 8.983 7.523 10.437c.55.102.75-.238.75-.53c0-.26-.009-.952-.014-1.87c-3.06.664-3.706-1.475-3.706-1.475c-.5-1.27-1.221-1.61-1.221-1.61c-.999-.681.075-.668.075-.668c1.105.078 1.685 1.134 1.685 1.134c.981 1.68 2.575 1.195 3.202.914c.1-.71.384-1.195.698-1.47c-2.442-.278-5.01-1.222-5.01-5.437c0-1.2.428-2.183 1.132-2.952c-.114-.278-.491-1.397.108-2.91c0 0 .923-.297 3.025 1.127A10.5 10.5 0 0 1 12 6.32a10.5 10.5 0 0 1 2.754.37c2.1-1.424 3.022-1.128 3.022-1.128c.6 1.514.223 2.633.11 2.911c.705.769 1.13 1.751 1.13 2.952c0 4.226-2.572 5.156-5.022 5.428c.395.34.747 1.01.747 2.037c0 1.47-.014 2.657-.014 3.017c0 .295.199.637.756.53C19.851 20.979 23 16.859 23 12c0-6.075-4.926-11-11.001-11"/></svg>
                      Source Code
                    </a>
                  </li>

                  <li>
                    <a 
                      href="https://buymeacoffee.com/enesehs"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        fontSize: '0.8125rem',
                        color: 'var(--color-primary)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M9.197 0L7.578 3.735H5.171v3.359h.921l.943 5.975H5.562L7.51 24.042l1.249-.015L10.015 32h11.891l.083-.531l1.172-7.443l1.188.015l1.943-10.973h-1.407l.937-5.975h1.011V3.734h-2.557L22.651-.001zm.704 1.073h12.057l1.025 2.375H8.868zm-3.666 3.73H25.76v1.228H6.235zm.604 9.333h18.183l-1.568 8.823l-7.536-.079l-7.511.079z"/></svg>
                      Support the Project
                    </a>
                  </li>

                    <li style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 512 512"
                      preserveAspectRatio="xMidYMid meet"
                      fill="currentColor"
                      fill-rule="evenodd"
                    >
                      <g transform="translate(0,512) scale(0.1,-0.1)" stroke="none">
                        <path d="M1045 5105 c-263 -41 -477 -149 -671 -340 -160 -157 -254 -308 -319
                        -515 -57 -182 -56 -150 -52 -1738 3 -1333 4 -1463 20 -1527 63 -257 159 -435
                        330 -612 142 -147 295 -243 492 -309 200 -67 146 -65 1763 -61 1362 3 1462 4
                        1532 21 257 61 458 174 631 354 170 176 266 354 325 602 17 70 18 175 21 1532
                        4 1617 6 1563 -61 1763 -68 204 -164 354 -321 502 -196 186 -425 297 -688 332
                        -121 17 -2897 13 -3002 -4z m1820 -1246 c613 -68 1045 -420 1172 -958 21 -88
                        26 -140 30 -308 l6 -203 -1197 0 -1196 0 0 -45 c0 -25 7 -80 16 -122 66 -321
                        273 -531 609 -619 175 -46 483 -45 655 2 233 63 411 189 482 339 l30 65 284 0
                        c160 0 284 -4 284 -9 0 -5 -9 -40 -21 -77 -118 -386 -487 -653 -1034 -749
                        -198 -35 -539 -36 -734 -4 -614 102 -1033 475 -1146 1019 -52 250 -30 595 52
                        825 221 614 873 936 1708 844z"/>
                        <path d="M2415 3459 c-108 -14 -239 -55 -339 -106 -112 -58 -243 -182 -299
                        -283 -37 -68 -91 -218 -100 -282 l-6 -38 906 0 906 0 -7 60 c-36 316 -243 543
                        -567 623 -141 35 -337 45 -494 26z"/>
                      </g>
                    </svg>


                    <a 
                      href="https://enesehs.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                      fontSize: '0.8125rem',
                      color: 'var(--color-primary)',
                      textDecoration: 'none'
                      }}
                    >
                      Developer Website
                    </a>
                    </li>
                </ul>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-textSecondary)', marginTop: 'var(--spacing-md)' }}>
                © {new Date().getFullYear()} Enesehs All rights reserved.
              </p>
            </div>
            </div>)}

          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Theme</h3>
              <div className="theme-grid">
                <button
                  className={`theme-option light ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('light')}
                  title="Classic Light"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#3b82f6' }}></span>
                    <span style={{ background: '#8b5cf6' }}></span>
                    <span style={{ background: '#ffffff' }}></span>
                  </div>
                  <span className="theme-name">Light</span>
                </button>

                <button
                  className={`theme-option dark ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                  title="Classic Dark"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#60a5fa' }}></span>
                    <span style={{ background: '#a78bfa' }}></span>
                    <span style={{ background: '#1e293b' }}></span>
                  </div>
                  <span className="theme-name">Dark</span>
                </button>

                <button
                  className={`theme-option ocean ${settings.theme === 'ocean' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('ocean')}
                  title="Ocean Blue"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#0ea5e9' }}></span>
                    <span style={{ background: '#06b6d4' }}></span>
                    <span style={{ background: '#f0f9ff' }}></span>
                  </div>
                  <span className="theme-name">Ocean</span>
                </button>

                <button
                  className={`theme-option forest ${settings.theme === 'forest' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('forest')}
                  title="Forest Green"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#10b981' }}></span>
                    <span style={{ background: '#059669' }}></span>
                    <span style={{ background: '#f0fdf4' }}></span>
                  </div>
                  <span className="theme-name">Forest</span>
                </button>

                <button
                  className={`theme-option sunset ${settings.theme === 'sunset' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('sunset')}
                  title="Sunset Orange"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#f97316' }}></span>
                    <span style={{ background: '#ea580c' }}></span>
                    <span style={{ background: '#fff7ed' }}></span>
                  </div>
                  <span className="theme-name">Sunset</span>
                </button>

                <button
                  className={`theme-option purple ${settings.theme === 'purple' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('purple')}
                  title="Purple Dream"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#a855f7' }}></span>
                    <span style={{ background: '#9333ea' }}></span>
                    <span style={{ background: '#faf5ff' }}></span>
                  </div>
                  <span className="theme-name">Purple</span>
                </button>

                <button
                  className={`theme-option rose ${settings.theme === 'rose' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('rose')}
                  title="Rose Pink"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#ec4899' }}></span>
                    <span style={{ background: '#db2777' }}></span>
                    <span style={{ background: '#fdf2f8' }}></span>
                  </div>
                  <span className="theme-name">Rose</span>
                </button>

                <button
                  className={`theme-option midnight ${settings.theme === 'midnight' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('midnight')}
                  title="Midnight Dark"
                >
                  <div className="theme-preview">
                    <span style={{ background: '#60a5fa' }}></span>
                    <span style={{ background: '#818cf8' }}></span>
                    <span style={{ background: '#0f172a' }}></span>
                  </div>
                  <span className="theme-name">Midnight</span>
                </button>

                <button
                  className={`theme-option custom ${settings.theme === 'custom' ? 'active' : ''}`}
                  onClick={() => handleThemeChange('custom')}
                  title="Custom Theme"
                >
                  <div className="theme-preview custom-preview">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v6m0 4v10m-8-8h6m4 0h8"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <span className="theme-name">Custom</span>
                </button>
              </div>

              {settings.theme === 'custom' && (
                <>
                  <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Custom Theme Colors</h3>
                  <div className="custom-theme-colors">
                <div className="color-picker-group">
                  <label>Primary Color</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.primary || '#3b82f6'}
                    onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Secondary Color</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.secondary || '#8b5cf6'}
                    onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Background</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.background || '#ffffff'}
                    onChange={(e) => handleCustomColorChange('background', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Foreground</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.foreground || '#f8fafc'}
                    onChange={(e) => handleCustomColorChange('foreground', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Text Color</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.text || '#1e293b'}
                    onChange={(e) => handleCustomColorChange('text', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Secondary Text</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.textSecondary || '#64748b'}
                    onChange={(e) => handleCustomColorChange('textSecondary', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Border Color</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.border || '#e2e8f0'}
                    onChange={(e) => handleCustomColorChange('border', e.target.value)}
                  />
                </div>
                <div className="color-picker-group">
                  <label>Accent Color</label>
                  <input
                    type="color"
                    value={settings.customThemeColors?.accent || '#10b981'}
                    onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                  />
                </div>
              </div>
              </>
              )}

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Background Images</h3>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                <button
                  className={`source-btn source-btn-full ${settings.background.type === 'image' ? 'active' : ''}`}
                  onClick={() => document.getElementById('background-upload')?.click()}
                  style={{ flex: 1 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Custom Upload
                </button>
                {(settings.background.type === 'picsum' || 
                  settings.background.type === 'unsplash' || 
                  settings.background.type === 'nasa' || 
                  settings.background.type === 'istanbul' || 
                  settings.background.type === 'space' || 
                  settings.background.type === 'ocean') && (
                  <button
                    className="source-btn"
                    onClick={() => {
                      onSettingsChange({
                        background: {
                          type: 'solid',
                          value: '#1a1a2e',
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                    }}
                    style={{ 
                    flex: '0 0 auto',
                    padding: '0 var(--spacing-md)',
                    height: '55px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.3)', 
                    color: 'rgb(239, 68, 68)',
                    bottom: '.5rem',
                    }}
                    title="Remove online wallpaper"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="background-source-selector">
                <button
                  className={`source-btn ${settings.background.type === 'picsum' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingCity(true);
                    const cityPhotos = [
                      'https://images.pexels.com/photos/2767815/pexels-photo-2767815.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1598073/pexels-photo-1598073.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2400&q=80',
                      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=2400&q=80',
                      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2400&q=80',
                      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=2400&q=80',
                      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=2400&q=80',
                    ];
                    const randomPhoto = cityPhotos[Math.floor(Math.random() * cityPhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'picsum',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingCity(false);
                    };
                    img.onerror = () => setIsLoadingCity(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingCity}
                >
                  {isLoadingCity ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 9.01L7.01 8.99889"/>
                      <path d="M11 9.01L11.01 8.99889"/>
                      <path d="M7 13.01L7.01 12.9989"/>
                      <path d="M11 13.01L11.01 12.9989"/>
                      <path d="M7 17.01L7.01 16.9989"/>
                      <path d="M11 17.01L11.01 16.9989"/>
                      <path d="M15 21H3.6C3.26863 21 3 20.7314 3 20.4V5.6C3 5.26863 3.26863 5 3.6 5H9V3.6C9 3.26863 9.26863 3 9.6 3H14.4C14.7314 3 15 3.26863 15 3.6V9M15 21H20.4C20.7314 21 21 20.7314 21 20.4V9.6C21 9.26863 20.7314 9 20.4 9H15M15 21V17M15 9V13M15 13H17M15 13V17M15 17H17"/>
                    </svg>
                  )}
                  {isLoadingCity ? 'Loading...' : 'City'}
                </button>

                <button
                  className={`source-btn ${settings.background.type === 'nasa' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingNature(true);
                    const naturePhotos = [
                      'https://images.pexels.com/photos/709552/pexels-photo-709552.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1179229/pexels-photo-1179229.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=2400&q=80',
                      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=2400&q=80',
                      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=2400&q=80',
                      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=2400&q=80',
                      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2400&q=80',
                    ];
                    const randomPhoto = naturePhotos[Math.floor(Math.random() * naturePhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'nasa',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingNature(false);
                    };
                    img.onerror = () => setIsLoadingNature(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingNature}
                >
                  {isLoadingNature ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3,21H21M13,8.5a3.49,3.49,0,0,0-2.09-3.2,3,3,0,0,0-5.82,0,3.49,3.49,0,0,0,0,6.4,3,3,0,0,0,5.82,0A3.49,3.49,0,0,0,13,8.5ZM8,9V21m13-8V10a2,2,0,0,0-2-2h0a2,2,0,0,0-2,2v3a2,2,0,0,0,2,2h0A2,2,0,0,0,21,13Zm-2,2v6"/>
                    </svg>
                  )}
                  {isLoadingNature ? 'Loading...' : 'Nature'}
                </button>

                <button
                  className={`source-btn ${settings.background.type === 'unsplash' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingCats(true);
                    const catPhotos = [
                      'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1314550/pexels-photo-1314550.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1741205/pexels-photo-1741205.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1643457/pexels-photo-1643457.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/2071873/pexels-photo-2071873.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=2400&q=80',
                      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=2400&q=80',
                      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=2400&q=80',
                      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=2400&q=80',
                      'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=2400&q=80',
                    ];
                    const randomPhoto = catPhotos[Math.floor(Math.random() * catPhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'unsplash',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingCats(false);
                    };
                    img.onerror = () => setIsLoadingCats(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingCats}
                >
                  {isLoadingCats ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/>
                      <path d="M8 14v.5"/>
                      <path d="M16 14v.5"/>
                      <path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/>
                    </svg>
                  )}
                  {isLoadingCats ? 'Loading...' : 'Cats'}
                </button>

                <button
                  className={`source-btn ${settings.background.type === 'istanbul' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingIstanbul(true);
                    const istanbulPhotos = [
                      'https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/2042109/pexels-photo-2042109.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/3684396/pexels-photo-3684396.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1666362/pexels-photo-1666362.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/2042108/pexels-photo-2042108.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/2946816/pexels-photo-2946816.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=2400&q=80',
                      'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=2400&q=80',
                      'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=2400&q=80',
                      'https://images.unsplash.com/photo-1559627755-0a2e5e2bfa07?w=2400&q=80',
                      'https://images.unsplash.com/photo-1558284967-4f8d1d4b6318?w=2400&q=80',
                      'https://images.unsplash.com/photo-1545459720-aab27a212ead?w=2400&q=80',
                    ];
                    const randomPhoto = istanbulPhotos[Math.floor(Math.random() * istanbulPhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'istanbul',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingIstanbul(false);
                    };
                    img.onerror = () => setIsLoadingIstanbul(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingIstanbul}
                >
                  {isLoadingIstanbul ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 8H17C17.3 8 17.6 8.1 17.8 8.1C17.9 7.8 18 7.4 18 7.1C18 5.8 17.4 4.6 16.3 3.9L12 1L7.7 3.8C6.7 4.6 6 5.8 6 7.1C6 7.5 6.1 7.8 6.2 8.1C6.4 8.1 6.7 8 7 8M24 7C24 5.9 22 4 22 4S20 5.9 20 7C20 7.7 20.4 8.4 21 8.7V13H19V11C19 9.9 18.1 9 17 9H7C5.9 9 5 9.9 5 11V13H3V8.7C3.6 8.4 4 7.7 4 7C4 5.9 2 4 2 4S0 5.9 0 7C0 7.7 .4 8.4 1 8.7V21H10V17C10 15.9 10.9 15 12 15S14 15.9 14 17V21H23V8.7C23.6 8.4 24 7.7 24 7Z"/>
                    </svg>
                  )}
                  {isLoadingIstanbul ? 'Loading...' : 'Istanbul'}
                </button>

                <button
                  className={`source-btn ${settings.background.type === 'space' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingSpace(true);
                    const spacePhotos = [
                      'https://images.pexels.com/photos/2150/sky-space-dark-galaxy.jpg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/956999/milky-way-starry-sky-night-sky-star-956999.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1252890/pexels-photo-1252890.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=2400&q=80',
                      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=2400&q=80',
                      'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=2400&q=80',
                      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2400&q=80',
                      'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=2400&q=80',
                    ];
                    const randomPhoto = spacePhotos[Math.floor(Math.random() * spacePhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'space',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingSpace(false);
                    };
                    img.onerror = () => setIsLoadingSpace(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingSpace}
                >
                  {isLoadingSpace ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.5 8V3M5.5 21V16M16 5.5H21M3 18.5H8M6.5 2L5.71554 3.56892C5.45005 4.09989 5.31731 4.36538 5.13997 4.59545C4.98261 4.79959 4.79959 4.98261 4.59545 5.13997C4.36538 5.31731 4.0999 5.45005 3.56892 5.71554L2 6.5L3.56892 7.28446C4.0999 7.54995 4.36538 7.68269 4.59545 7.86003C4.79959 8.01739 4.98261 8.20041 5.13997 8.40455C5.31731 8.63462 5.45005 8.9001 5.71554 9.43108L6.5 11L7.28446 9.43108C7.54995 8.9001 7.68269 8.63462 7.86003 8.40455C8.01739 8.20041 8.20041 8.01739 8.40455 7.86003C8.63462 7.68269 8.9001 7.54995 9.43108 7.28446L11 6.5L9.43108 5.71554C8.9001 5.45005 8.63462 5.31731 8.40455 5.13997C8.20041 4.98261 8.01739 4.79959 7.86003 4.59545C7.68269 4.36538 7.54995 4.0999 7.28446 3.56892L6.5 2ZM17 12L16.0489 13.9022C15.7834 14.4332 15.6506 14.6987 15.4733 14.9288C15.3159 15.1329 15.1329 15.3159 14.9288 15.4733C14.6987 15.6506 14.4332 15.7834 13.9023 16.0489L12 17L13.9023 17.9511C14.4332 18.2166 14.6987 18.3494 14.9288 18.5267C15.1329 18.6841 15.3159 18.8671 15.4733 19.0712C15.6506 19.3013 15.7834 19.5668 16.0489 20.0977L17 22L17.9511 20.0978C18.2166 19.5668 18.3494 19.3013 18.5267 19.0712C18.6841 18.8671 18.8671 18.6841 19.0712 18.5267C19.3013 18.3494 19.5668 18.2166 20.0977 17.9511L22 17L20.0977 16.0489C19.5668 15.7834 19.3013 15.6506 19.0712 15.4733C18.8671 15.3159 18.6841 15.1329 18.5267 14.9288C18.3494 14.6987 18.2166 14.4332 17.9511 13.9023L17 12Z"/>
                    </svg>
                  )}
                  {isLoadingSpace ? 'Loading...' : 'Space'}
                </button>

                <button
                  className={`source-btn ${settings.background.type === 'ocean' ? 'active' : ''}`}
                  onClick={() => {
                    setIsLoadingOcean(true);
                    const oceanPhotos = [
                      'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/1024967/pexels-photo-1024967.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.pexels.com/photos/416676/pexels-photo-416676.jpeg?auto=compress&cs=tinysrgb&w=2400',
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=80',
                      'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=2400&q=80',
                      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=2400&q=80',
                      'https://images.unsplash.com/photo-1476673160081-cf065607f449?w=2400&q=80',
                      'https://images.unsplash.com/photo-1454362097636-0e7e3b8fcbd8?w=2400&q=80',
                    ];
                    const randomPhoto = oceanPhotos[Math.floor(Math.random() * oceanPhotos.length)];
                    const img = new Image();
                    img.onload = () => {
                      onSettingsChange({
                        background: {
                          type: 'ocean',
                          value: randomPhoto,
                          blur: settings.background.blur,
                          opacity: settings.background.opacity,
                        },
                      });
                      setIsLoadingOcean(false);
                    };
                    img.onerror = () => setIsLoadingOcean(false);
                    img.src = randomPhoto;
                  }}
                  disabled={isLoadingOcean}
                >
                  {isLoadingOcean ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 10C5.48276 10 7.34483 7 7.34483 7C7.34483 7 9.2069 10 11.6897 10C14.1724 10 16.6552 7 16.6552 7C16.6552 7 19.1379 10 21 10"/>
                      <path d="M3 17C5.48276 17 7.34483 14 7.34483 14C7.34483 14 9.2069 17 11.6897 17C14.1724 17 16.6552 14 16.6552 14C16.6552 14 19.1379 17 21 17"/>
                    </svg>
                  )}
                  {isLoadingOcean ? 'Loading...' : 'Ocean'}
                </button>
              </div>

              <input
                type="file"
                id="background-upload"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;

                  try {
                    const imageIds = settings.background.imageIds || [];
                    
                    for (const file of files) {
                      const id = await imageStorage.saveImage(file);
                      imageIds.push(id);
                    }

                    const images = await imageStorage.getAllImages();
                    setBackgroundImages(images);

                    const firstNewId = imageIds[imageIds.length - files.length];
                    const url = await imageStorage.getImage(firstNewId);
                    onSettingsChange({
                      background: {
                        type: 'image',
                        value: url || '',
                        imageIds,
                        currentImageId: firstNewId,
                        blur: settings.background.blur,
                        opacity: settings.background.opacity,
                      },
                    });
                  } catch (error) {
                    console.error('Failed to upload images:', error);
                    alert('Failed to upload images. Please try again.');
                  } finally {
                    e.target.value = '';
                  }
                }}
              />

              {backgroundImages.length > 0 && (
                <>
                  <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Uploaded Images</h3>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                    <label className="widget-toggle" style={{ flex: 1, marginBottom: 0 }}>
                      <input
                        type="checkbox"
                        checked={settings.background.randomMode || false}
                        onChange={(e) => {
                          onSettingsChange({
                            background: {
                              ...settings.background,
                              randomMode: e.target.checked,
                            },
                          });
                        }}
                      />
                      <span className="widget-name">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                        Auto-Randomize
                      </span>
                    </label>
                    <button
                      className="source-btn"
                      onClick={async () => {
                        if (backgroundImages.length === 0) return;
                        const imageIds = settings.background.imageIds || [];
                        if (imageIds.length === 0) return;
                        
                        const lastShownId = localStorage.getItem('hotpage_lastShownImageId');
                        let availableIds = imageIds.filter(id => id !== lastShownId);
                        if (availableIds.length === 0) availableIds = imageIds;
                        const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
                        const randomUrl = await imageStorage.getImage(randomId);
                        
                        if (randomUrl) {
                          localStorage.setItem('hotpage_lastShownImageId', randomId);
                          onSettingsChange({
                            background: {
                              type: 'image',
                              value: randomUrl,
                              currentImageId: randomId,
                              imageIds: imageIds,
                              blur: settings.background.blur,
                              opacity: settings.background.opacity,
                              randomMode: settings.background.randomMode,
                            },
                          });
                        }
                      }}
                      style={{ flex: 'none', padding: '0 var(--spacing-md)', fontSize: '14px' }}
                      title="Pick random wallpaper"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                      Randomize
                    </button>
                    <button
                      className="source-btn"
                      onClick={async () => {
                        if (confirm(`Delete all ${backgroundImages.length} wallpapers?`)) {
                          for (const image of backgroundImages) {
                            await imageStorage.deleteImage(image.id);
                          }
                          setBackgroundImages([]);
                          onSettingsChange({
                            background: {
                              type: 'solid',
                              value: '#1a1a2e',
                              imageIds: [],
                              blur: settings.background.blur,
                              opacity: settings.background.opacity,
                            },
                          });
                        }
                      }}
                      style={{ flex: 'none', padding: '0 var(--spacing-md)', fontSize: '14px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                      Delete All
                    </button>
                  </div>
                  <div className="background-images-grid">
                    {backgroundImages.map((image) => (
                      <div
                        key={image.id}
                        className={`background-image-item ${settings.background.currentImageId === image.id ? 'active' : ''}`}
                      >
                        <img
                          src={image.url}
                          alt={image.filename}
                          onClick={() => {
                            onSettingsChange({
                              background: {
                                type: 'image',
                                value: image.url,
                                currentImageId: image.id,
                                imageIds: settings.background.imageIds,
                                blur: settings.background.blur,
                                opacity: settings.background.opacity,
                              },
                            });
                          }}
                        />
                        <button
                          className="delete-image-btn"
                          onClick={async () => {
                            if (confirm('Delete this image?')) {
                              await imageStorage.deleteImage(image.id);
                              const updatedImages = backgroundImages.filter((img) => img.id !== image.id);
                              setBackgroundImages(updatedImages);
                              
                              const updatedImageIds = (settings.background.imageIds || []).filter((id) => id !== image.id);
                              
                              if (settings.background.currentImageId === image.id) {
                                onSettingsChange({
                                  background: {
                                    type: 'solid',
                                    value: '#1a1a2e',
                                    imageIds: updatedImageIds,
                                    blur: settings.background.blur,
                                    opacity: settings.background.opacity,
                                  },
                                });
                              } else {
                                onSettingsChange({
                                  background: {
                                    ...settings.background,
                                    imageIds: updatedImageIds,
                                  },
                                });
                              }
                            }
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Blur Intensity</h3>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.background.blur || 0}
                  onChange={(e) => {
                    onSettingsChange({
                      background: {
                        ...settings.background,
                        blur: parseInt(e.target.value),
                      },
                    });
                  }}
                  className="settings-slider"
                />
                <span className="slider-value">{settings.background.blur || 0}px</span>
              </div>

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Background Opacity</h3>
              <div className="slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.background.opacity !== undefined ? settings.background.opacity : 10}
                  onChange={(e) => {
                    onSettingsChange({
                      background: {
                        ...settings.background,
                        opacity: parseInt(e.target.value),
                      },
                    });
                  }}
                  className="settings-slider"
                />
                <span className="slider-value">{settings.background.opacity !== undefined ? settings.background.opacity : 10}%</span>
              </div>
            </div>
          )}

          {activeTab === 'widgets' && (
            <div className="settings-section">
              <h3>Available Widgets</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-textSecondary)', marginBottom: 'var(--spacing-lg)' }}>
                Enable widgets to customize your homepage experience
              </p>
              
              <div className="widgets-grid">
                <div className={`widget-card ${settings.quickLinksSpacingWidget ? 'widget-card-active' : ''}`}>
                  <div className="widget-card-header">
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 6h16v4H4z" />
                        <path d="M4 14h16v4H4z" />
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>Spacing Widget</h4>
                      <p>Keeps Away From Cluttered Appearance</p>
                    </div>
                    <label className="widget-card-toggle">
                      <input
                        type="checkbox"
                        checked={settings.quickLinksSpacingWidget ?? true}
                        onChange={(e) => onSettingsChange({ quickLinksSpacingWidget: e.target.checked })}
                      />
                    </label>
                  </div>
                </div>

                <div className={`widget-card ${settings.widgets.weather?.enabled ? 'widget-card-active' : ''}`}>
                  <div className="widget-card-header">
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>Weather</h4>
                      <p>Real-time weather conditions</p>
                    </div>
                    <label className="widget-card-toggle">
                      <input
                        type="checkbox"
                        checked={settings.widgets.weather?.enabled || false}
                        onChange={() => toggleWidget('weather')}
                      />
                    </label>
                  </div>
                  
                  {settings.widgets.weather?.enabled && (
                    <div className="widget-card-settings">
                      <label className="widget-setting-label">
                        <span>📍 Location</span>
                        <input
                          type="text"
                          className="widget-setting-input"
                          placeholder="Auto-detect or enter city name..."
                          value={(settings.widgets.weather?.settings as { manualLocation?: string; refreshMinutes?: number })?.manualLocation || ''}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.weather || { enabled: true };
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                weather: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    manualLocation: e.target.value,
                                  },
                                },
                              },
                            });
                          }}
                        />
                      </label>

                      <label className="widget-setting-label">
                        <span>Refresh every (minutes)</span>
                        <input
                          type="number"
                          className="widget-setting-input"
                          min="5"
                          max="120"
                          value={(settings.widgets.weather?.settings as { refreshMinutes?: number })?.refreshMinutes ?? 10}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.weather || { enabled: true };
                            const minutes = Math.max(5, parseInt(e.target.value, 10) || 10);
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                weather: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    refreshMinutes: minutes,
                                  },
                                },
                              },
                            });
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className={`widget-card ${settings.widgets.currency?.enabled ? 'widget-card-active' : ''}`}>
                  <div className="widget-card-header">
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v12"/>
                        <path d="M15 9.5c-.5-1-1.5-1.5-3-1.5s-2.5.5-3 1.5S6 12 9 13s3 2.5 3 3.5-1 1.5-3 1.5"/>
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>Currency & Crypto</h4>
                      <p>Exchange rates and cryptocurrency</p>
                    </div>
                    <label className="widget-card-toggle">
                      <input
                        type="checkbox"
                        checked={settings.widgets.currency?.enabled || false}
                        onChange={() => toggleWidget('currency')}
                      />
                    </label>
                  </div>
                  
                  {settings.widgets.currency?.enabled && (
                    <div className="widget-card-settings">
                      <label className="widget-setting-label">
                        <span>Base Currency</span>
                        <select
                          className="widget-setting-select"
                          value={(settings.widgets.currency?.settings as any)?.baseCurrency || 'TRY'}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.currency || { enabled: true };
                            const baseCurrency = e.target.value;
                            const enabledCurrencies = baseCurrency === 'TRY' 
                              ? ['USD', 'EUR', 'GBP', 'XAU']
                              : ['EUR', 'GBP', 'JPY'];
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                currency: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    baseCurrency,
                                    enabledCurrencies,
                                  },
                                },
                              },
                            });
                          }}
                        >
                          <option value="TRY">₺ Turkish Lira</option>
                          <option value="USD">$ US Dollar</option>
                          <option value="EUR">€ Euro</option>
                          <option value="GBP">£ British Pound</option>
                        </select>
                      </label>

                      <label className="widget-setting-label">
                        <span>Display Currencies</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {['USD', 'EUR', 'GBP', 'JPY', 'XAU'].map(curr => {
                            const baseCurrency = (settings.widgets.currency?.settings as any)?.baseCurrency || 'TRY';
                            if (curr === baseCurrency) return null;
                            const enabledCurrencies = (settings.widgets.currency?.settings as any)?.enabledCurrencies || [];
                            const isEnabled = enabledCurrencies.includes(curr);
                            
                            return (
                              <label key={curr} className="currency-checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={isEnabled}
                                  onChange={(e) => {
                                    const currentWidget = settings.widgets.currency || { enabled: true };
                                    const currentEnabled = (currentWidget.settings as any)?.enabledCurrencies || [];
                                    const newEnabled = e.target.checked
                                      ? [...currentEnabled, curr]
                                      : currentEnabled.filter((c: string) => c !== curr);
                                    onSettingsChange({
                                      widgets: {
                                        ...settings.widgets,
                                        currency: {
                                          ...currentWidget,
                                          settings: {
                                            ...(currentWidget.settings || {}),
                                            enabledCurrencies: newEnabled,
                                          },
                                        },
                                      },
                                    });
                                  }}
                                />
                                <span>{curr}</span>
                              </label>
                            );
                          })}
                        </div>
                      </label>

                      <label className="widget-setting-label">
                        <span>Display Cryptocurrencies</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {(() => {
                            const coinToId: Record<string, string> = {
                              BTC: 'bitcoin',
                              ETH: 'ethereum',
                              BNB: 'binancecoin',
                              XRP: 'ripple',
                              ADA: 'cardano',
                              SOL: 'solana',
                              DOGE: 'dogecoin',
                              AVAX: 'avalanche',
                            };

                            return ['BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'AVAX'].map((coin) => {
                              const enabledCryptos = (settings.widgets.currency?.settings as any)?.enabledCryptos || [];
                              const isEnabled = enabledCryptos.includes(coinToId[coin]);

                              return (
                                <label key={coin} className="currency-checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => {
                                      const currentWidget = settings.widgets.currency || { enabled: true };
                                      const currentEnabled = (currentWidget.settings as any)?.enabledCryptos || [];
                                      const slug = coinToId[coin];
                                      const newEnabled = e.target.checked
                                        ? Array.from(new Set([...currentEnabled, slug]))
                                        : currentEnabled.filter((c: string) => c !== slug);
                                      onSettingsChange({
                                        widgets: {
                                          ...settings.widgets,
                                          currency: {
                                            ...currentWidget,
                                            settings: {
                                              ...(currentWidget.settings || {}),
                                              enabledCryptos: newEnabled,
                                            },
                                          },
                                        },
                                      });
                                    }}
                                  />
                                  <span>{coin}</span>
                                </label>
                              );
                            });
                          })()}
                        </div>
                      </label>
                      
                      <label className="widget-setting-checkbox">
                        <input
                          type="checkbox"
                          checked={(settings.widgets.currency?.settings as any)?.showSparkline ?? true}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.currency || { enabled: true };
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                currency: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    showSparkline: e.target.checked,
                                  },
                                },
                              },
                            });
                          }}
                        />
                        <span>Show price charts <span className="beta-badge">BETA</span></span>
                      </label>
                    </div>
                  )}
                </div>

                <div className={`widget-card ${settings.widgets.quotes?.enabled ? 'widget-card-active' : ''}`}>
                  <div className="widget-card-header">
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
                        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>Quotes</h4>
                      <p>Inspirational and wisdom quotes</p>
                    </div>
                    <label className="widget-card-toggle">
                      <input
                        type="checkbox"
                        checked={settings.widgets.quotes?.enabled || false}
                        onChange={() => toggleWidget('quotes')}
                      />
                    </label>
                  </div>
                </div>

                <div className={`widget-card ${settings.widgets.rss?.enabled ? 'widget-card-active' : ''}`}>
                  <div className="widget-card-header">
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 11a9 9 0 0 1 9 9"/>
                        <path d="M4 4a16 16 0 0 1 16 16"/>
                        <circle cx="5" cy="19" r="1.5"/>
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>News Feed</h4>
                      <p>RSS feeds with images and categories</p>
                    </div>
                    <label className="widget-card-toggle">
                      <input
                        type="checkbox"
                        checked={settings.widgets.rss?.enabled || false}
                        onChange={() => toggleWidget('rss')}
                      />
                    </label>
                  </div>
                  
                  {settings.widgets.rss?.enabled && (
                    <div className="widget-card-settings">
                      {rssStats && (
                        <>
                          <div className="widget-stats">
                            <div className="widget-stat">
                              <span className="widget-stat-label">Feeds</span>
                              <span className="widget-stat-value">{rssStats.feeds}</span>
                            </div>
                            <div className="widget-stat">
                              <span className="widget-stat-label">Items</span>
                              <span className="widget-stat-value">{rssStats.items}</span>
                            </div>
                            <div className="widget-stat">
                              <span className="widget-stat-label">Success</span>
                              <span className="widget-stat-value" style={{ color: '#4ade80' }}>{rssStats.success}</span>
                            </div>
                            <div className="widget-stat">
                              <span className="widget-stat-label">Errors</span>
                              <span className="widget-stat-value" style={{ color: '#f87171' }}>{rssStats.error}</span>
                            </div>
                          </div>
                          
                          {rssStats.failedFeeds && rssStats.failedFeeds.length > 0 && (
                            <div style={{ 
                              marginTop: 'var(--spacing-sm)',
                              padding: 'var(--spacing-md)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: 'var(--radius-md)'
                            }}>
                              <div style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: '600', 
                                color: '#ef4444',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                                  <line x1="12" y1="9" x2="12" y2="13"/>
                                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                                </svg>
                                Failed Feeds ({rssStats.failedFeeds.length})
                              </div>
                              {rssStats.failedFeeds.map((url, idx) => (
                                <div 
                                  key={idx}
                                  style={{
                                    fontSize: '0.75rem',
                                    color: 'var(--color-text)',
                                    padding: '4px 0',
                                    wordBreak: 'break-all',
                                    opacity: 0.9
                                  }}
                                >
                                  • {url}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      
                      <label className="widget-setting-label">
                        <span>Max Items to Display</span>
                        <input
                          type="number"
                          className="widget-setting-input"
                          min="10"
                          max="200"
                          value={((settings.widgets.rss?.settings as any)?.maxItems) ?? 150}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.rss || { enabled: true };
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                rss: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    maxItems: parseInt(e.target.value, 10),
                                  },
                                },
                              },
                            });
                          }}
                        />
                      </label>

                      <label className="widget-setting-label">
                        <span>Refresh Interval (minutes)</span>
                        <input
                          type="number"
                          className="widget-setting-input"
                          min="5"
                          max="120"
                          value={((settings.widgets.rss?.settings as any)?.refreshMinutes) ?? 30}
                          onChange={(e) => {
                            const currentWidget = settings.widgets.rss || { enabled: true };
                            onSettingsChange({
                              widgets: {
                                ...settings.widgets,
                                rss: {
                                  ...currentWidget,
                                  settings: {
                                    ...(currentWidget.settings || {}),
                                    refreshMinutes: parseInt(e.target.value, 10),
                                  },
                                },
                              },
                            });
                          }}
                        />
                      </label>
                      
                      <label className="widget-setting-label">
                        <span>Add Feed</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="url"
                            className="widget-setting-input"
                            placeholder="https://example.com/feed.xml"
                            value={rssInput}
                            onChange={(e) => setRssInput(e.target.value)}
                            style={{ flex: 2 }}
                          />
                          <input
                            type="text"
                            className="widget-setting-input"
                            placeholder="Category"
                            value={rssCategoryInput}
                            onChange={(e) => setRssCategoryInput(e.target.value)}
                            list="rss-categories-list"
                            style={{ flex: 1 }}
                          />
                          <datalist id="rss-categories-list">
                            <option value="Technology" />
                            <option value="World" />
                            <option value="Science" />
                            <option value="Gaming" />
                            <option value="Business" />
                            <option value="Design" />
                            <option value="Sports" />
                            <option value="Entertainment" />
                          </datalist>
                          <button
                            className="widget-add-btn"
                            onClick={() => {
                              const url = rssInput.trim();
                              const category = rssCategoryInput.trim() || 'General';
                              if (!url) return;
                              
                              const currentWidget = settings.widgets.rss || { enabled: true };
                              const currentFeeds = ((currentWidget.settings as any)?.feeds || []) as (string | { url: string; category: string })[];
                              
                              const exists = currentFeeds.some(f => {
                                const fUrl = typeof f === 'string' ? f : f.url;
                                return fUrl === url;
                              });

                              if (exists) {
                                setRssInput('');
                                return;
                              }

                              const newFeed = { url, category };

                              onSettingsChange({
                                widgets: {
                                  ...settings.widgets,
                                  rss: {
                                    ...currentWidget,
                                    settings: {
                                      ...(currentWidget.settings || {}),
                                      feeds: [...currentFeeds, newFeed],
                                    },
                                  },
                                },
                              });
                              setRssInput('');
                            }}
                          >
                            +
                          </button>
                        </div>
                      </label>
                      
                      <div className="widget-feed-list">
                        {(((settings.widgets.rss?.settings as any)?.feeds) || []).length === 0 && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-textSecondary)', textAlign: 'center', padding: 'var(--spacing-md)' }}>
                            No feeds added. Default feeds will be used.
                          </p>
                        )}
                        {(((settings.widgets.rss?.settings as any)?.feeds) || []).map((feed: string | { url: string; category: string }, idx: number) => {
                          const url = typeof feed === 'string' ? feed : feed.url;
                          const category = typeof feed === 'string' ? 'General' : feed.category;
                          
                          return (
                            <div key={`${url}-${idx}`} className="widget-feed-item">
                              <div className="widget-feed-info">
                                <span className="widget-feed-url">{url}</span>
                                <span className="widget-feed-category">{category}</span>
                              </div>
                              <button
                                className="widget-remove-btn"
                                onClick={() => {
                                  const currentWidget = settings.widgets.rss || { enabled: true };
                                  const feeds = ((currentWidget.settings as any)?.feeds || []) as (string | { url: string; category: string })[];
                                  const filtered = feeds.filter((_, i) => i !== idx);
                                  onSettingsChange({
                                    widgets: {
                                      ...settings.widgets,
                                      rss: {
                                        ...currentWidget,
                                        settings: {
                                          ...(currentWidget.settings || {}),
                                          feeds: filtered,
                                        },
                                      },
                                    },
                                  });
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`widget-card ${settings.secretLinks?.enabled ? 'widget-card-active' : ''}`}>
                <div className="widget-card-header">
                  <div className="widget-card-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <div className="widget-card-info">
                    <h4>Secret Links</h4>
                    <p>Hidden links with keywords<br></br>  trigger (default: pass)</p>
                  </div>
                  <label className="widget-card-toggle">
                    <input
                      type="checkbox"
                      checked={settings.secretLinks?.enabled || false}
                      onChange={(e) => onSettingsChange({
                        secretLinks: {
                          ...(settings.secretLinks || { triggerKeyword: 'pass', openInIncognito: true, folders: [], rootLinks: [] }),
                          enabled: e.target.checked,
                        }
                      })}
                    />
                  </label>
                </div>
                </div>

                <div className={`widget-card widget-card-active`}>
                  <div className="widget-card-header" style={{ gap: 'var(--spacing-sm)' }}>
                    <div className="widget-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
                        <path d="M15 3v6h6"/>
                      </svg>
                    </div>
                    <div className="widget-card-info">
                      <h4>Sticky Notes</h4>
                      <p>Quick notes · Shortcut: N</p>
                    </div>
                    <div className="widget-card-toggle" style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                      <button className="settings-btn ghost" onClick={onOpenStickyNotes}>Open</button>
                      <label>
                        <input
                          type="checkbox"
                          checked={settings.quickActions?.openStickyNotes ?? true}
                          onChange={(e) => onSettingsChange({
                            quickActions: {
                              ...settings.quickActions,
                              openStickyNotes: e.target.checked,
                              openNotepad: settings.quickActions?.openNotepad ?? true,
                            }
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <h3 style={{ marginTop: 'var(--spacing-xl)' }}>Widget Order</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-textSecondary)', marginBottom: 'var(--spacing-md)' }}>
                Drag and drop to reorder widgets on the homepage
              </p>
              <div className="widget-order-list">
                {(settings.widgetOrder || ['weather', 'currency', 'rss']).filter(id => id !== 'quotes').map((widgetId, index) => {
                  const widgetNames: Record<string, string> = {
                    weather: 'Weather',
                    currency: 'Currency',
                    rss: 'News Feed',
                  };
                  
                  const widgetIcons: Record<string, React.ReactElement> = {
                    weather: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                        <circle cx="12" cy="12" r="5"/>
                      </svg>
                    ),
                    currency: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v12m-3-9.5c.5-1 1.5-1.5 3-1.5s2.5.5 3 1.5S12 12 9 13s3 2.5 3 3.5"/>
                      </svg>
                    ),
                    rss: (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 11a9 9 0 0 1 9 9"/>
                        <path d="M4 4a16 16 0 0 1 16 16"/>
                        <circle cx="5" cy="19" r="1.5"/>
                      </svg>
                    ),
                  };
                  
                  return (
                    <div
                      key={widgetId}
                      className="widget-order-item"
                      draggable
                      onDragStart={() => setDraggedWidget(widgetId)}
                      onDragEnd={() => setDraggedWidget(null)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedWidget && draggedWidget !== widgetId) {
                          const currentOrder = (settings.widgetOrder || ['weather', 'currency', 'rss']).filter(id => id !== 'quotes');
                          const draggedIndex = currentOrder.indexOf(draggedWidget);
                          const targetIndex = index;
                          
                          if (draggedIndex !== targetIndex) {
                            const newOrder = [...currentOrder];
                            newOrder.splice(draggedIndex, 1);
                            newOrder.splice(targetIndex, 0, draggedWidget);
                            
                            onSettingsChange({ widgetOrder: newOrder });
                          }
                        }
                      }}
                      style={{
                        opacity: draggedWidget === widgetId ? 0.5 : 1,
                        cursor: 'grab'
                      }}
                    >
                      <div className="widget-order-handle">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="12" x2="21" y2="12"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                      </div>
                      <div className="widget-order-icon">
                        {widgetIcons[widgetId]}
                      </div>
                      <div className="widget-order-name">{widgetNames[widgetId]}</div>
                      <div className="widget-order-number">#{index + 1}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
