import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { QuickLink } from '../../types/settings';
import { iconLibrary, iconCategories } from '../../data/icons';
import { sanitizeSVG } from '../../utils/sanitize';
import './QuickLinks.css';

interface QuickLinksProps {
    links: QuickLink[];
    onLinksChange: (links: QuickLink[]) => void;
    bottomSpacing?: boolean;
    viewMode?: 'standard' | 'logo';
    scale?: number;
    onScaleChange?: (scale: number) => void;
    onHide?: () => void;
}

const getFaviconUrl = (url: string): string => {
    try {
        const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return '';
    }
};

export const QuickLinks = ({ links, onLinksChange, bottomSpacing = false, viewMode = 'standard', scale = 1, onScaleChange, onHide: _onHide }: QuickLinksProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        type: 'link' as 'link' | 'folder',
        icon: '',
        iconType: 'svg' as 'favicon' | 'svg' | 'custom' | 'none',
        selectedCategory: 'Social'
    });

    const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
    const [renamingTitle, setRenamingTitle] = useState('');
    const [expandedFolder, setExpandedFolder] = useState<string | null>(null);

    const handleRenameFolderStart = (folderId: string, currentTitle: string) => {
        setRenamingFolderId(folderId);
        setRenamingTitle(currentTitle);
    };

    const handleRenameFolderSave = () => {
        if (!renamingFolderId) return;

        const updatedLinks = links.map(link => {
            if (link.id === renamingFolderId) {
                return { ...link, title: renamingTitle || 'Folder' };
            }
            return link;
        });

        onLinksChange(updatedLinks);
        setRenamingFolderId(null);
        setRenamingTitle('');
    };

    const handleAdd = () => {
        if (!formData.title || (!formData.url && formData.type !== 'folder')) return;

        const newLink: QuickLink = {
            id: Date.now().toString(),
            title: formData.title,
            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
            type: 'link',
            iconType: formData.iconType,
            icon: formData.iconType === 'custom' ? formData.icon : formData.iconType === 'svg' ? formData.icon : undefined,
        };

        if (expandedFolder) {
            const updatedLinks = links.map(link => {
                if (link.id === expandedFolder && link.type === 'folder') {
                    return {
                        ...link,
                        children: [...(link.children || []), newLink]
                    };
                }
                return link;
            });
            onLinksChange(updatedLinks);
        } else {
            onLinksChange([...links, newLink]);
        }
        setFormData({ title: '', url: '', type: 'link', icon: '', iconType: 'svg', selectedCategory: 'Social' });
        setIsEditing(false);
    };

    const handleEdit = (link: QuickLink) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            type: link.type || 'link',
            icon: link.icon || '',
            iconType: link.iconType || 'svg',
            selectedCategory: 'Social'
        });
        setIsEditing(true);
    };

    const handleUpdate = () => {
        if (!editingLink || !formData.title || (!formData.url && editingLink.type !== 'folder')) return;

        const updatedLinks = links.map((link) => {
            if (link.id === editingLink.id) {
                return {
                    ...link,
                    title: formData.title,
                    url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
                    iconType: formData.iconType,
                    icon: (formData.iconType === 'custom' || formData.iconType === 'svg') ? formData.icon : undefined,
                };
            }
            if (link.type === 'folder' && link.children) {
                return {
                    ...link,
                    children: link.children.map(child =>
                        child.id === editingLink.id ? {
                            ...child,
                            title: formData.title,
                            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
                            iconType: formData.iconType,
                            icon: (formData.iconType === 'custom' || formData.iconType === 'svg') ? formData.icon : undefined,
                        } : child
                    )
                };
            }
            return link;
        });

        onLinksChange(updatedLinks);
        setEditingLink(null);
        setFormData({ title: '', url: '', type: 'link', icon: '', iconType: 'svg', selectedCategory: 'Social' });
        setIsEditing(false);
    };

    const cleanLinks = (linksToClean: QuickLink[]) => {
        return linksToClean.filter(link => {
            if (link.type === 'folder') {
                return link.children && link.children.length > 0;
            }
            return true;
        });
    };

    const handleDelete = (id: string, parentId?: string) => {
        if (parentId) {
            const parentFolder = links.find(l => l.id === parentId);
            if (parentFolder && parentFolder.children) {
                const remainingChildren = parentFolder.children.filter(child => child.id !== id);

                if (remainingChildren.length <= 1) {
                    const newLinks = links.map(link => {
                        if (link.id === parentId) {
                            return remainingChildren[0] || null;
                        }
                        return link;
                    }).filter(Boolean) as QuickLink[];

                    onLinksChange(newLinks);
                    setExpandedFolder(null);
                } else {
                    const updatedLinks = links.map(link => {
                        if (link.id === parentId) {
                            return { ...link, children: remainingChildren };
                        }
                        return link;
                    });
                    onLinksChange(cleanLinks(updatedLinks));
                }
            }
        } else {
            onLinksChange(links.filter((link) => link.id !== id));
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingLink(null);
        setFormData({ title: '', url: '', type: 'link', icon: '', iconType: 'svg', selectedCategory: 'Social' });
    };

    const handleDragStart = (e: React.DragEvent, id: string, parentId?: string) => {
        e.dataTransfer.setData('application/json', JSON.stringify({ id, parentId }));
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId?: string, targetType: 'link' | 'folder' | 'container' = 'link', targetParentId?: string) => {
        e.preventDefault();
        e.stopPropagation();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;

        const { id: draggedId, parentId: draggedParentId } = JSON.parse(data);

        if (targetType === 'container' && draggedParentId && !targetParentId) {
            const parentFolder = links.find(l => l.id === draggedParentId);
            const draggedLink = parentFolder?.children?.find(c => c.id === draggedId);

            if (parentFolder && draggedLink) {
                const remainingChildren = parentFolder.children?.filter(c => c.id !== draggedId) || [];

                let newLinks: QuickLink[] = [];

                if (remainingChildren.length <= 1) {
                    newLinks = links.map(l => {
                        if (l.id === draggedParentId) {
                            return remainingChildren[0] || null;
                        }
                        return l;
                    }).filter(Boolean) as QuickLink[];
                } else {
                    const updatedFolder = { ...parentFolder, children: remainingChildren };
                    newLinks = links.map(l => l.id === draggedParentId ? updatedFolder : l);
                }

                newLinks.push(draggedLink);

                newLinks = cleanLinks(newLinks);
                onLinksChange(newLinks);
                setDraggedItem(null);
                setExpandedFolder(null);
            }
            return;
        }

        if (!targetId) return;

        if (draggedId === targetId) return;

        if (targetType === 'folder' && !draggedParentId) {
            const draggedLink = links.find(l => l.id === draggedId);
            if (!draggedLink) return;

            if (draggedLink.type !== 'folder') {
                const updatedLinks = links.filter(l => l.id !== draggedId).map(link => {
                    if (link.id === targetId) {
                        return {
                            ...link,
                            children: [...(link.children || []), draggedLink]
                        };
                    }
                    return link;
                });
                onLinksChange(updatedLinks);
                setDraggedItem(null);
                return;
            }
        }

        if (!draggedParentId && !targetParentId && targetType === 'link') {
            const draggedIndex = links.findIndex(l => l.id === draggedId);
            const targetIndex = links.findIndex(l => l.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return;

            const targetElement = e.currentTarget as HTMLElement;
            const rect = targetElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const boundaryX = rect.width * 0.35;
            const boundaryY = rect.height * 0.35;

            const isCentral = x > boundaryX && x < rect.width - boundaryX &&
                y > boundaryY && y < rect.height - boundaryY;

            if (isCentral) {
                const folderId = Date.now().toString();
                const draggedLink = links[draggedIndex];
                const targetLink = links[targetIndex];

                if (draggedLink.type === 'folder') return;
                if (targetLink.type === 'folder') return;

                const newFolder: QuickLink = {
                    id: folderId,
                    title: 'New Folder',
                    url: '',
                    type: 'folder',
                    iconType: 'svg',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13.65a.35.35 0 0 0 .35.35Z"/></svg>',
                    children: [targetLink, draggedLink]
                };

                const newLinks = links.filter(l => l.id !== draggedId && l.id !== targetId);
                newLinks.splice(Math.min(draggedIndex, targetIndex), 0, newFolder);

                onLinksChange(newLinks);
                setDraggedItem(null);
                return;
            }
        }

        if (draggedParentId === targetParentId) {
            if (draggedParentId) {
                const updatedLinks = links.map(link => {
                    if (link.id === draggedParentId && link.children) {
                        const newChildren = [...link.children];
                        const dIndex = newChildren.findIndex(c => c.id === draggedId);
                        const tIndex = newChildren.findIndex(c => c.id === targetId);

                        if (dIndex !== -1 && tIndex !== -1) {
                            const [removed] = newChildren.splice(dIndex, 1);
                            newChildren.splice(tIndex, 0, removed);
                        }

                        return { ...link, children: newChildren };
                    }
                    return link;
                });
                onLinksChange(updatedLinks);
            } else {
                const draggedIndex = links.findIndex(link => link.id === draggedId);
                const targetIndex = links.findIndex(link => link.id === targetId);

                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const newLinks = [...links];
                    const [removed] = newLinks.splice(draggedIndex, 1);
                    newLinks.splice(targetIndex, 0, removed);
                    onLinksChange(newLinks);
                }
            }
        }

        setDraggedItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const visibleLinks = links.filter((link) => !link.hidden);

    const handleZoomIn = () => onScaleChange?.(Math.min((scale || 1) + 0.1, 2));
    const handleZoomOut = () => onScaleChange?.(Math.max((scale || 1) - 0.1, 0.5));

    return (
        <div
            className={`quick-links-container-wrapper ${viewMode === 'logo' ? 'logo-mode' : ''} ${isEditing ? 'editing' : ''}`}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}
        >
            <div className="widget-controls">
                <button onClick={handleZoomIn} title="Zoom In">+</button>
                <button onClick={handleZoomOut} title="Zoom Out">-</button>
            </div>

            <div className={`quick-links ${bottomSpacing ? 'bottom-spacing-enabled' : ''} ${isEditing ? 'editing' : ''} ${viewMode === 'logo' ? 'logo-mode' : ''}`}>
                <div className="quick-links-grid">
                    {visibleLinks.map((link) => {
                        if (link.type === 'folder') {
                            return (
                                <div
                                    key={link.id}
                                    className={`quick-link folder ${draggedItem === link.id ? 'dragging' : ''}`}
                                    draggable={isEditing}
                                    onDragStart={(e) => handleDragStart(e, link.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, link.id, 'folder')}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => setExpandedFolder(link.id)}
                                    title={viewMode === 'logo' ? link.title : undefined}
                                >
                                    <div className="quick-link-content">
                                        <div className="folder-grid">
                                            {(link.children || []).slice(0, 4).map((child) => {
                                                const showIcon = child.iconType !== 'none';
                                                const isSvgIcon = child.iconType === 'svg';
                                                const iconUrl = child.iconType === 'custom' && child.icon
                                                    ? child.icon
                                                    : child.iconType === 'favicon'
                                                        ? getFaviconUrl(child.url)
                                                        : '';
                                                return (
                                                    <div key={child.id} className="folder-mini-icon">
                                                        {showIcon && isSvgIcon && child.icon && (
                                                            <div className="mini-svg" dangerouslySetInnerHTML={{ __html: sanitizeSVG(child.icon) }} />
                                                        )}
                                                        {showIcon && !isSvgIcon && iconUrl && (
                                                            <img src={iconUrl} alt="" className="mini-img" />
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <span className="quick-link-title">{link.title}</span>
                                        {isEditing && (
                                            <>
                                                <button
                                                    className="quick-link-delete"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                        handleDelete(link.id);
                                                    }}
                                                    aria-label="Delete folder"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M18 6 6 18" />
                                                        <path d="m6 6 12 12" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        const showIcon = link.iconType !== 'none';
                        const isSvgIcon = link.iconType === 'svg';
                        const iconUrl = link.iconType === 'custom' && link.icon
                            ? link.icon
                            : link.iconType === 'favicon'
                                ? getFaviconUrl(link.url)
                                : '';

                        return (
                            <a
                                key={link.id}
                                href={link.url}
                                className={`quick-link ${draggedItem === link.id ? 'dragging' : ''}`}
                                draggable={isEditing}
                                onDragStart={(e) => handleDragStart(e, link.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, link.id, 'link')}
                                onDragEnd={handleDragEnd}
                                title={viewMode === 'logo' ? link.title : undefined}
                                onClick={(e) => {
                                    if (isEditing) e.preventDefault();
                                }}
                            >
                                <div className="quick-link-content">
                                    {showIcon && isSvgIcon && link.icon && (
                                        <div className="quick-link-icon-svg" dangerouslySetInnerHTML={{ __html: sanitizeSVG(link.icon) }} />
                                    )}
                                    {showIcon && !isSvgIcon && iconUrl && (
                                        <img src={iconUrl} alt="" className="quick-link-icon" />
                                    )}
                                    <span className="quick-link-title">{link.title}</span>
                                    {isEditing && (
                                        <>
                                            <button
                                                className="quick-link-edit"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEdit(link);
                                                }}
                                                aria-label="Edit link"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </button>
                                            <button
                                                className="quick-link-delete"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDelete(link.id);
                                                }}
                                                aria-label="Delete link"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M18 6 6 18" />
                                                    <path d="m6 6 12 12" />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </a>
                        );
                    })}

                    {isEditing && (
                        <button className="quick-link quick-link-add" onClick={() => setEditingLink({} as QuickLink)}>
                            <span className="add-icon">+</span>
                            <span className="add-text">Add Link</span>
                        </button>
                    )}
                </div>

                {expandedFolder && createPortal(
                    <div
                        className="folder-overlay"
                        onClick={() => setExpandedFolder(null)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, undefined, 'container')}
                    >
                        <div className="folder-content" onClick={(e) => e.stopPropagation()}>
                            <div className="folder-header">
                                {renamingFolderId === expandedFolder ? (
                                    <input
                                        className="folder-title-input"
                                        value={renamingTitle}
                                        onChange={(e) => setRenamingTitle(e.target.value)}
                                        onBlur={handleRenameFolderSave}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameFolderSave()}
                                        autoFocus
                                    />
                                ) : (
                                    <h3 onClick={() => {
                                        const folder = links.find(l => l.id === expandedFolder);
                                        if (folder) handleRenameFolderStart(folder.id, folder.title);
                                    }}>
                                        {links.find(l => l.id === expandedFolder)?.title}
                                    </h3>
                                )}
                                <button className="close-btn" onClick={() => setExpandedFolder(null)}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                                </button>
                            </div>
                            <div className="folder-links-grid">
                                {(links.find(l => l.id === expandedFolder)?.children || []).map(child => {
                                    const showIcon = child.iconType !== 'none';
                                    const isSvgIcon = child.iconType === 'svg';
                                    const iconUrl = child.iconType === 'custom' && child.icon
                                        ? child.icon
                                        : child.iconType === 'favicon'
                                            ? getFaviconUrl(child.url)
                                            : '';

                                    return (
                                        <a
                                            key={child.id}
                                            href={child.url}
                                            className={`quick-link ${draggedItem === child.id ? 'dragging' : ''}`}
                                            draggable={true} // Allow dragging directly without editing mode needed in folder
                                            onDragStart={(e) => handleDragStart(e, child.id, expandedFolder)}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(e, child.id, 'link', expandedFolder)}
                                            onDragEnd={handleDragEnd}
                                            onClick={(e) => {
                                                if (isEditing) e.preventDefault();
                                            }}
                                        >
                                            <div className="quick-link-content">
                                                {showIcon && isSvgIcon && child.icon && (
                                                    <div className="quick-link-icon-svg" dangerouslySetInnerHTML={{ __html: sanitizeSVG(child.icon) }} />
                                                )}
                                                {showIcon && !isSvgIcon && iconUrl && (
                                                    <img src={iconUrl} alt="" className="quick-link-icon" />
                                                )}
                                                <span className="quick-link-title">{child.title}</span>
                                                {isEditing && (
                                                    <>
                                                        <button
                                                            className="quick-link-edit"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleEdit(child);
                                                            }}
                                                            aria-label="Edit link"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="quick-link-delete"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDelete(child.id, expandedFolder);
                                                            }}
                                                            aria-label="Delete link"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M18 6 6 18" />
                                                                <path d="m6 6 12 12" />
                                                            </svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
                <div className="quick-links-header">
                    <button
                        className="edit-mode-toggle"
                        onClick={() => setIsEditing(!isEditing)}
                        title={isEditing ? "Finish Editing" : "Edit Links"}
                    >
                        {isEditing ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                            </svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        )}
                    </button>
                </div>

                {editingLink && createPortal(
                    <div className="quick-link-editor">
                        <div className="quick-link-editor-content">
                            <h3>{editingLink.id ? 'Edit Link' : 'Add New Link'}</h3>
                            <input
                                type="text"
                                placeholder="Title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="editor-input"
                                autoFocus
                            />
                            <input
                                type="text"
                                placeholder="URL (e.g., github.com)"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                className="editor-input"
                            />

                            <div className="icon-selector">
                                <label className="icon-option">
                                    <input
                                        type="radio"
                                        name="iconType"
                                        value="svg"
                                        checked={formData.iconType === 'svg'}
                                        onChange={(e) => setFormData({ ...formData, iconType: e.target.value as 'svg' })}
                                    />
                                    <span>SVG Icon</span>
                                </label>
                                <label className="icon-option">
                                    <input
                                        type="radio"
                                        name="iconType"
                                        value="favicon"
                                        checked={formData.iconType === 'favicon'}
                                        onChange={(e) => setFormData({ ...formData, iconType: e.target.value as 'favicon' })}
                                    />
                                    <span>Favicon</span>
                                </label>
                                <label className="icon-option">
                                    <input
                                        type="radio"
                                        name="iconType"
                                        value="custom"
                                        checked={formData.iconType === 'custom'}
                                        onChange={(e) => setFormData({ ...formData, iconType: e.target.value as 'custom' })}
                                    />
                                    <span>Custom</span>
                                </label>
                                <label className="icon-option">
                                    <input
                                        type="radio"
                                        name="iconType"
                                        value="none"
                                        checked={formData.iconType === 'none'}
                                        onChange={(e) => setFormData({ ...formData, iconType: e.target.value as 'none' })}
                                    />
                                    <span>None</span>
                                </label>
                            </div>

                            {formData.iconType === 'svg' && (
                                <>
                                    <div className="icon-category-selector">
                                        {iconCategories.map((category) => (
                                            <button
                                                key={category}
                                                className={`category-btn ${formData.selectedCategory === category ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, selectedCategory: category })}
                                                type="button"
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="icon-grid">
                                        {iconLibrary
                                            .filter((icon) => icon.category === formData.selectedCategory)
                                            .map((icon) => (
                                                <button
                                                    key={icon.name}
                                                    className={`icon-grid-item ${formData.icon === icon.svg ? 'selected' : ''}`}
                                                    onClick={() => setFormData({ ...formData, icon: icon.svg })}
                                                    title={icon.name}
                                                    type="button"
                                                >
                                                    <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                                                </button>
                                            ))}
                                    </div>
                                </>
                            )}

                            {formData.iconType === 'custom' && (
                                <input
                                    type="text"
                                    placeholder="Icon URL"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="editor-input"
                                />
                            )}
                            <div className="editor-actions">
                                <button onClick={handleCancel} className="btn-cancel">
                                    Cancel
                                </button>
                                <button
                                    onClick={editingLink.id ? handleUpdate : handleAdd}
                                    className="btn-save"
                                    disabled={!formData.title || !formData.url}
                                >
                                    {editingLink.id ? 'Update' : 'Add'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        </div>
    );
};
