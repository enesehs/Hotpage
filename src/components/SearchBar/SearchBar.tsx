/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;

import { useState, type FormEvent, useEffect } from 'react';
import './SearchBar.css';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [isExtension, setIsExtension] = useState(false);

    useEffect(() => {
        // Check if running in extension context with search API
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
            // Use Chrome Search API - respects user's default search engine
            chrome.search.query({
                text: query,
                disposition: 'CURRENT_TAB'
            });
        } else {
            // Fallback for dev mode - redirect to Google
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    };

    return (
        <div className="search-bar">
            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </div>

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
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </form>
        </div>
    );
};
