declare const chrome: any;

import { useState, type FormEvent, useEffect } from 'react';
import './SearchBar.css';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isExtension, setIsExtension] = useState(false);

    useEffect(() => {
        setIsExtension(
            typeof chrome !== 'undefined' &&
            chrome.search &&
            typeof chrome.search.query === 'function'
        );
    }, []);

    const handleSubmit = (e?: FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        if (isExtension) {
            chrome.search.query({
                text: query,
                disposition: 'CURRENT_TAB'
            });
        } else {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    };

    return (
        <div className="search-bar">
            <form className="search-form" onSubmit={handleSubmit}>

                <input
                    type="text"
                    className="search-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    autoFocus
                />

                <button
                    type="submit"
                    className="search-submit-btn"
                    aria-label="Search"
                    title="Search"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
