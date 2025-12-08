import { useState, useEffect, type FormEvent } from 'react';
import { getSearchEngine, searchEngines } from '../../utils/searchEngines';
import './SearchBar.css';

interface SearchBarProps {
  searchEngine: string;
  imageSearchMode: boolean;
  onEngineChange: (engine: string) => void;
  onImageModeChange: (enabled: boolean) => void;
}

export const SearchBar = ({
  searchEngine,
  imageSearchMode,
  onEngineChange,
  onImageModeChange,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    const engine = getSearchEngine(searchEngine);
    if (engine) {
      const url = imageSearchMode && engine.imageSearchUrl
        ? engine.imageSearchUrl + encodeURIComponent(query)
        : engine.searchUrl + encodeURIComponent(query);
      window.location.href = url;
    }
  };

  useEffect(() => {
    const input = document.getElementById('search-input');
    input?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-engine-selector')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const selectedEngine = searchEngines.find(e => e.id === searchEngine) || searchEngines[0];

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-engine-selector">
          <button
            type="button"
            className="engine-selector-btn"
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            }}
            aria-label={selectedEngine.name}
          >
            <span dangerouslySetInnerHTML={{ __html: selectedEngine.icon }} />
            <span className="engine-name">{selectedEngine.name}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {isDropdownOpen && (
            <div className="engine-dropdown">
              {searchEngines.map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  className={`engine-option ${searchEngine === engine.id ? 'active' : ''}`}
                  onClick={() => {
                    onEngineChange(engine.id);
                    setIsDropdownOpen(false);
                  }}
                >
                  <span dangerouslySetInnerHTML={{ __html: engine.icon }} />
                  <span>{engine.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />

        <button
          type="button"
          className={`image-search-btn ${imageSearchMode ? 'active' : ''}`}
          onClick={() => onImageModeChange(!imageSearchMode)}
          aria-label="Toggle image search"
          title="Image Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
        </button>

        <button
          type="submit"
          className="search-submit-btn"
          aria-label="Search"
          title="Search"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
        </button>
      </form>
    </div>
  );
};
