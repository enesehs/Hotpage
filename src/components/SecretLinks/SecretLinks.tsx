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
  const [draggedLink, setDraggedLink] = useState<{ id: string, sourceFolderId?: string } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;

    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

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
    const folder = settings.folders.find(f => f.id === folderId);
    if (!folder) return;

    const linksToMove = folder.links.map(l => ({ ...l, folderId: undefined }));

    onSettingsChange({
      ...settings,
      rootLinks: [...settings.rootLinks, ...linksToMove],
      folders: settings.folders.filter(f => f.id !== folderId),
    });
  };

  const toggleFolder = (folderId: string) => {
    const updatedFolders = settings.folders.map(folder =>
      folder.id === folderId ? { ...folder, expanded: !folder.expanded } : folder
    );
    onSettingsChange({ ...settings, folders: updatedFolders });
  };

  const handleDragStart = (e: React.DragEvent, linkId: string, folderId?: string) => {
    setDraggedLink({ id: linkId, sourceFolderId: folderId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (folderId) {
      setDragOverFolderId(folderId);
      setIsDragOverRoot(false);
    } else {
      setDragOverFolderId(null);
      setIsDragOverRoot(true);
    }
  };

  const handleDragOverLink = (e: React.DragEvent, linkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLinkId(linkId);
  }

  const handleDragLeave = () => {
    setDragOverFolderId(null);
    setIsDragOverRoot(false);
    setDragOverLinkId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId?: string, targetLinkId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    setDragOverFolderId(null);
    setIsDragOverRoot(false);
    setDragOverLinkId(null);

    if (!draggedLink) return;
    const { id: linkId, sourceFolderId } = draggedLink;

    if (linkId === targetLinkId) return;

    let link: SecretLink | undefined;
    let updatedRootLinks = [...settings.rootLinks];
    let updatedFolders = [...settings.folders];

    if (sourceFolderId) {
      const sourceFolderIndex = updatedFolders.findIndex(f => f.id === sourceFolderId);
      if (sourceFolderIndex > -1) {
        link = updatedFolders[sourceFolderIndex].links.find(l => l.id === linkId);
        if (link) {
          updatedFolders[sourceFolderIndex] = {
            ...updatedFolders[sourceFolderIndex],
            links: updatedFolders[sourceFolderIndex].links.filter(l => l.id !== linkId)
          };
        }
      }
    } else {
      link = updatedRootLinks.find(l => l.id === linkId);
      if (link) {
        updatedRootLinks = updatedRootLinks.filter(l => l.id !== linkId);
      }
    }

    if (!link) return;

    const linkToAdd = { ...link, folderId: targetFolderId };

    if (targetFolderId) {
      const targetFolderIndex = updatedFolders.findIndex(f => f.id === targetFolderId);
      if (targetFolderIndex > -1) {
        let newLinks = [...updatedFolders[targetFolderIndex].links];

        if (targetLinkId) {
          const targetIndex = newLinks.findIndex(l => l.id === targetLinkId);
          if (targetIndex > -1) {
            newLinks.splice(targetIndex, 0, linkToAdd);
          } else {
            newLinks.push(linkToAdd);
          }
        } else {
          newLinks.push(linkToAdd);
        }

        updatedFolders[targetFolderIndex] = {
          ...updatedFolders[targetFolderIndex],
          links: newLinks
        };
      }
    } else {
      if (targetLinkId) {
        const targetIndex = updatedRootLinks.findIndex(l => l.id === targetLinkId);
        if (targetIndex > -1) {
          updatedRootLinks.splice(targetIndex, 0, linkToAdd);
        } else {
          updatedRootLinks.push(linkToAdd);
        }
      } else {
        updatedRootLinks.push(linkToAdd);
      }
    }

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

      if (typeof browser !== 'undefined' && browser?.windows?.create) {
        try {
          browser.windows.create({ url, incognito: true }).then(() => {
            onClose();
          }).catch((error: unknown) => {
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
            <div className="icon-wrapper">
              <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2>Secret Links</h2>
          </div>
          <div className="header-btns">
            <button onClick={() => handleAddFolder()} className="header-btn" title="Create Folder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            </button>
            <button onClick={() => setShowAddForm(true)} className="header-btn" title="Add Link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
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
              <div
                key={folder.id}
                className={`folder-container ${dragOverFolderId === folder.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, folder.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, folder.id)}
              >
                <div className="folder-header" onClick={() => toggleFolder(folder.id)}>
                  <div className="folder-title-section">
                    <svg className={`folder-chevron ${folder.expanded ? 'expanded' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    <span className="folder-name">{folder.name}</span>
                    <span className="folder-count">{folder.links.length}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }}
                    className="folder-delete-btn"
                    title="Delete Folder"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                {folder.expanded && (
                  <div className="folder-content-area">
                    {folder.links.length === 0 ? (
                      <div className="empty-folder-message">Drop links here</div>
                    ) : (
                      <div className="links-grid">
                        {folder.links.map(link => (
                          <div
                            key={link.id}
                            className={`link-card ${dragOverLinkId === link.id ? 'drag-target' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, link.id, folder.id)}
                            onDragOver={(e) => handleDragOverLink(e, link.id)}
                            onDrop={(e) => handleDrop(e, folder.id, link.id)}
                          >
                            <button onClick={() => openLink(link.url)} className="link-button">
                              <div className="link-icon-wrapper">
                                <img
                                  src={getFaviconUrl(link.url)}
                                  alt=""
                                  className="link-icon"
                                  onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                              </div>
                              <span className="link-title">{link.title}</span>
                            </button>
                            <button onClick={() => handleDeleteLink(link.id, folder.id)} className="delete-btn">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <div
              className={`root-links-area ${isDragOverRoot ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e)}
            >
              <div className="root-area-header">
                <h3>Uncategorized Links</h3>
                <div className="divider"></div>
              </div>

              <div className="links-grid">
                {settings.rootLinks.map(link => (
                  <div
                    key={link.id}
                    className={`link-card ${dragOverLinkId === link.id ? 'drag-target' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, link.id)}
                    onDragOver={(e) => handleDragOverLink(e, link.id)}
                    onDrop={(e) => handleDrop(e, undefined, link.id)}
                  >
                    <button onClick={() => openLink(link.url)} className="link-button">
                      <div className="link-icon-wrapper">
                        <img
                          src={getFaviconUrl(link.url)}
                          alt=""
                          className="link-icon"
                          onError={(e) => e.currentTarget.style.display = 'none'}
                        />
                      </div>
                      <span className="link-title">{link.title}</span>
                    </button>
                    <button onClick={() => handleDeleteLink(link.id)} className="delete-btn">×</button>
                  </div>
                ))}
              </div>

              {settings.rootLinks.length === 0 && (
                <div className="empty-root-message">
                  Drag links here to move them out of folders
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="secret-content">
            <div className="settings-list">

              <div className="setting-row">
                <div className="setting-icon-label">
                  <div className="setting-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </div>
                  <div className="setting-text">
                    <span>Open in Incognito</span>
                    <small>Open links in a private window</small>
                  </div>
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
                <div className="setting-icon-label">
                  <div className="setting-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </div>
                  <div className="setting-text">
                    <span>Trigger Keyword</span>
                    <small>Type this to unlock (default: pass)</small>
                  </div>
                </div>
                <input
                  type="text"
                  value={settings.triggerKeyword}
                  onChange={e => onSettingsChange({ ...settings, triggerKeyword: e.target.value })}
                  className="input"
                  style={{ maxWidth: '120px', textAlign: 'center' }}
                />
              </div>

              <div className="stats-container">
                <div className="stat-card">
                  <span className="stat-value">{settings.rootLinks.length + settings.folders.reduce((acc, f) => acc + f.links.length, 0)}</span>
                  <span className="stat-label">Total Links</span>
                </div>
                <div className="stat-card">
                  <span className="stat-value">{settings.folders?.length || 0}</span>
                  <span className="stat-label">Folders</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddFolder && (
        <div className="add-popup-overlay" onClick={() => setShowAddFolder(false)}>
          <div className="add-popup" onClick={e => e.stopPropagation()}>
            <div className="add-popup-header">
              <h3>New Folder</h3>
              <button onClick={() => setShowAddFolder(false)} className="close-popup-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="add-popup-content">
              <div className="form-group">
                <label>Folder Name</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="e.g. Work Stuff"
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && createFolder()}
                    className="styled-input"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="add-popup-footer">
              <button onClick={() => setShowAddFolder(false)} className="cancel-btn">Cancel</button>
              <button onClick={createFolder} className="add-btn primary" disabled={!newFolderName.trim()}>
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
              <button onClick={() => setShowAddForm(false)} className="close-popup-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="add-popup-content">
              <div className="form-group">
                <label>Title</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="e.g. ChatGPT"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                    className="styled-input"
                    autoFocus
                  />
                </div>
              </div>
              <div className="form-group">
                <label>URL</label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="input-icon">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <input
                    type="text"
                    placeholder="e.g. chat.openai.com"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                    className="styled-input"
                  />
                </div>
              </div>
            </div>
            <div className="add-popup-footer">
              <button onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
              <button onClick={handleAddLink} className="add-btn primary" disabled={!newTitle.trim() || !newUrl.trim()}>
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
