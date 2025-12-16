import { useState } from 'react';
import type { QuickLink } from '../../types/settings';
import { iconLibrary, iconCategories } from '../../data/icons';
import { sanitizeSVG } from '../../utils/sanitize';
import './QuickLinks.css';

interface QuickLinksProps {
    links: QuickLink[];
    onLinksChange: (links: QuickLink[]) => void;
    spacingWidgetEnabled?: boolean;
}

const getFaviconUrl = (url: string): string => {
    try {
        const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return '';
    }
};

export const QuickLinks = ({ links, onLinksChange, spacingWidgetEnabled = true }: QuickLinksProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        icon: '',
        iconType: 'svg' as 'favicon' | 'svg' | 'custom' | 'none',
        selectedCategory: 'Social'
    });

    const handleAdd = () => {
        if (!formData.title || !formData.url) return;

        const newLink: QuickLink = {
            id: Date.now().toString(),
            title: formData.title,
            url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
            iconType: formData.iconType,
            icon: formData.iconType === 'custom' ? formData.icon : formData.iconType === 'svg' ? formData.icon : undefined,
        };

        onLinksChange([...links, newLink]);
        setFormData({ title: '', url: '', icon: '', iconType: 'svg', selectedCategory: 'Social' });
        setIsEditing(false);
    };

    const handleEdit = (link: QuickLink) => {
        setEditingLink(link);
        setFormData({
            title: link.title,
            url: link.url,
            icon: link.icon || '',
            iconType: link.iconType || 'svg',
            selectedCategory: 'Social'
        });
        setIsEditing(true);
    };

    const handleUpdate = () => {
        if (!editingLink || !formData.title || !formData.url) return;

        const updatedLinks = links.map((link) =>
            link.id === editingLink.id
                ? {
                    ...link,
                    title: formData.title,
                    url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
                    iconType: formData.iconType,
                    icon: (formData.iconType === 'custom' || formData.iconType === 'svg') ? formData.icon : undefined,
                }
                : link
        );

        onLinksChange(updatedLinks);
        setEditingLink(null);
        setFormData({ title: '', url: '', icon: '', iconType: 'svg', selectedCategory: 'Social' });
        setIsEditing(false);
    };

    const handleDelete = (id: string) => {
        onLinksChange(links.filter((link) => link.id !== id));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingLink(null);
        setFormData({ title: '', url: '', icon: '', iconType: 'svg', selectedCategory: 'Social' });
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItem(id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        const draggedIndex = links.findIndex(link => link.id === draggedItem);
        const targetIndex = links.findIndex(link => link.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newLinks = [...links];
        const [removed] = newLinks.splice(draggedIndex, 1);
        newLinks.splice(targetIndex, 0, removed);

        onLinksChange(newLinks);
        setDraggedItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const visibleLinks = links.filter((link) => !link.hidden);

    return (
        <div className={`quick-links ${spacingWidgetEnabled ? 'spacing-widget-enabled' : 'spacing-widget-compact'}`}>
            <div className="quick-links-header">
                <button
                    className="edit-mode-toggle"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {isEditing ? 'Done' : 'Edit Links'}
                </button>
            </div>
            <div className="quick-links-grid">
                {visibleLinks.map((link) => {
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
                            target="_blank"
                            rel="noopener noreferrer"
                            draggable={isEditing}
                            onDragStart={(e) => handleDragStart(e, link.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, link.id)}
                            onDragEnd={handleDragEnd}
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

            {editingLink && (
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
                </div>
            )}
        </div>
    );
};
