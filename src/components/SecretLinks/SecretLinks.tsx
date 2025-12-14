import { useState } from 'react';
import type { SecretLinksSettings, SecretLink } from '../../types/settings';
import './SecretLinks.css';

declare const chrome: any;
declare const browser: any;

interface SecretLinksProps {
  settings: SecretLinksSettings;
  onClose: () => void;
  onSettingsChange: (settings: SecretLinksSettings) => void;
  locale?: string;
}

const getFaviconUrl = (url: string): string => {
  try {
    const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
};

export const SecretLinks = ({ settings, onClose, onSettingsChange }: SecretLinksProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [draggedLink, setDraggedLink] = useState<string | null>(null);

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      alert('Invalid URL format. Please enter a valid URL.');
      return;
    }

    const newLink: SecretLink = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      url,
    };

    onSettingsChange({
      ...settings,
      rootLinks: [...settings.rootLinks, newLink],
    });

    setNewTitle('');
    setNewUrl('');
    setShowAddForm(false);
  };

  const handleDeleteLink = (id: string, folderId?: string) => {
    if (folderId) {
      const updatedFolders = settings.folders.map(folder =>
        folder.id === folderId
          ? { ...folder, links: folder.links.filter(l => l.id !== id) }
          : folder
      );
      onSettingsChange({ ...settings, folders: updatedFolders });
    } else {
      onSettingsChange({
        ...settings,
        rootLinks: settings.rootLinks.filter(link => link.id !== id),
      });
    }
  };

  const handleAddFolder = () => {
    setShowAddFolder(true);
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      links: [],
      expanded: true,
    };
    onSettingsChange({ ...settings, folders: [...settings.folders, newFolder] });
    setNewFolderName('');
    setShowAddFolder(false);
  };

  const handleDeleteFolder = (folderId: string) => {
    onSettingsChange({
      ...settings,
      folders: settings.folders.filter(f => f.id !== folderId),
    });
  };

  const toggleFolder = (folderId: string) => {
    const updatedFolders = settings.folders.map(folder =>
      folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
    );
    onSettingsChange({ ...settings, folders: updatedFolders });
  };

  const handleDragStart = (e: React.DragEvent, linkId: string) => {
    setDraggedLink(linkId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (!draggedLink) return;

    let link = settings.rootLinks.find(l => l.id === draggedLink);
    let sourceFolderId: string | undefined;

    if (!link) {
      for (const folder of settings.folders) {
        link = folder.links.find(l => l.id === draggedLink);
        if (link) {
          sourceFolderId = folder.id;
          break;
        }
      }
    }

    if (!link) return;

    let updatedRootLinks = settings.rootLinks;
    let updatedFolders = settings.folders;

    if (sourceFolderId) {
      updatedFolders = updatedFolders.map(folder =>
        folder.id === sourceFolderId
          ? { ...folder, links: folder.links.filter(l => l.id !== draggedLink) }
          : folder
      );
    } else {
      updatedRootLinks = updatedRootLinks.filter(l => l.id !== draggedLink);
    }

    updatedFolders = updatedFolders.map(folder =>
      folder.id === folderId
        ? { ...folder, links: [...folder.links, { ...link!, folderId }] }
        : folder
    );

    onSettingsChange({ ...settings, rootLinks: updatedRootLinks, folders: updatedFolders });
    setDraggedLink(null);
  };

  const openLink = (url: string) => {
    const openFallback = () => {
      if (window.open(url, '_blank', 'noopener,noreferrer')) {
        onClose();
      }
    };

    if (settings.openInIncognito) {
      // Try Chrome extension API
      if (typeof chrome !== 'undefined' && chrome?.windows?.create) {
        try {
          chrome.windows.create({ url, incognito: true }, () => {
            onClose();
          });
          return;
        } catch (error) {
          console.error('Failed to open incognito window (Chrome):', error);
        }
      }

      // Try Firefox extension API
      if (typeof browser !== 'undefined' && browser?.windows?.create) {
        try {
          browser.windows.create({ url, incognito: true }).then(() => {
            onClose();
          }).catch((error: any) => {
            console.error('Failed to open incognito window (Firefox):', error);
            openFallback();
          });
          return;
        } catch (error) {
          console.error('Firefox API error:', error);
          openFallback();
        }
      }
    }

    openFallback();
  };

  return (
    <div className="secret-overlay" onClick={onClose}>
      <div className="secret-popup" onClick={e => e.stopPropagation()}>

        <div className="secret-header">
          <div className="header-title">
            <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <h2>Secret Links</h2>
          </div>
          <div className="header-btns">
            <button onClick={() => handleAddFolder()} className="header-btn" title="Add Folder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="header-btn" title="Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button onClick={onClose} className="header-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {!showSettings ? (
          <div className="secret-content">

            {settings.folders.map(folder => (
              <div key={folder.id} className="folder-container">
                <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
                  <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {folder.expanded ? (
                      <path d="M19 9l-7 7-7-7" />
                    ) : (
                      <path d="M9 18l6-6-6-6" />
                    )}
                  </svg>
                  <span className="folder-name">{folder.name}</span>
                  <span className="folder-count">({folder.links.length})</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="folder-delete-btn">×</button>
                </div>
                {folder.expanded && (
                  <div
                    className="folder-drop-zone"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOnFolder(e, folder.id)}
                  >
                    <div className="links-grid">
                      {folder.links.map(link => (
                        <div
                          key={link.id}
                          className="link-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, link.id)}
                        >
                          <button onClick={() => openLink(link.url)} className="link-button">
                            <img
                              src={getFaviconUrl(link.url)}
                              alt=""
                              className="link-icon"
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                            <span className="link-title">{link.title}</span>
                          </button>
                          <button onClick={() => handleDeleteLink(link.id, folder.id)} className="delete-btn">×</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="links-grid">
              {settings.rootLinks.map(link => (
                <div
                  key={link.id}
                  className="link-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, link.id)}
                >
                  <button onClick={() => openLink(link.url)} className="link-button">
                    <img
                      src={getFaviconUrl(link.url)}
                      alt=""
                      className="link-icon"
                      onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    <span className="link-title">{link.title}</span>
                  </button>
                  <button onClick={() => handleDeleteLink(link.id)} className="delete-btn">×</button>
                </div>
              ))}

              <div className="link-card">
                <button onClick={() => setShowAddForm(true)} className="add-link-card">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Add Link</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="secret-content">
            <div className="settings-list">

              <div className="setting-row">
                <div className="setting-label">
                  <span>Open in Incognito</span>
                  <small>Open links in incognito tab</small>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.openInIncognito}
                    onChange={e => onSettingsChange({ ...settings, openInIncognito: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-row">
                <div className="setting-label">
                  <span>Trigger Keyword</span>
                  <small>Type this to open secret links (default: pass)</small>
                </div>
                <input
                  type="text"
                  value={settings.triggerKeyword}
                  onChange={e => onSettingsChange({ ...settings, triggerKeyword: e.target.value })}
                  className="input"
                  style={{ maxWidth: '150px' }}
                />
              </div>

              <div className="stats">
                <div className="stat">
                  <span className="stat-num">{settings.rootLinks.length}</span>
                  <span className="stat-label">Links</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{settings.folders?.length || 0}</span>
                  <span className="stat-label">Folders</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddFolder && (
          <div className="add-popup-overlay" onClick={() => setShowAddFolder(false)}>
            <div className="add-popup" onClick={e => e.stopPropagation()}>
              <div className="add-popup-header">
                <h3>Add New Folder</h3>
                <button onClick={() => setShowAddFolder(false)} className="close-popup-btn">×</button>
              </div>
              <div className="add-popup-content">
                <input
                  type="text"
                  placeholder="Folder Name"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createFolder()}
                  className="input"
                  autoFocus
                />
                <button onClick={createFolder} className="add-btn">
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="add-popup-overlay" onClick={() => setShowAddForm(false)}>
            <div className="add-popup" onClick={e => e.stopPropagation()}>
              <div className="add-popup-header">
                <h3>Add New Link</h3>
                <button onClick={() => setShowAddForm(false)} className="close-popup-btn">×</button>
              </div>
              <div className="add-popup-content">
                <input
                  type="text"
                  placeholder="Title"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                  className="input"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                  className="input"
                />
                <button onClick={handleAddLink} className="add-btn">
                  Add Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
