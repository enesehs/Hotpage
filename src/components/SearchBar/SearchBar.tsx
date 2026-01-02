declare const chrome: any;

import { useState, type FormEvent, useEffect, useRef } from 'react';
import './SearchBar.css';

export const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [calcResult, setCalcResult] = useState<string | null>(null);
    const [isExtension, setIsExtension] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsExtension(
            typeof chrome !== 'undefined' &&
            chrome.search &&
            typeof chrome.search.query === 'function'
        );
    }, []);

    useEffect(() => {
        const focusInput = () => {
            inputRef.current?.focus();
        };

        focusInput();
        const timeoutId = setTimeout(focusInput, 100);
        return () => clearTimeout(timeoutId);
    }, []);

    const calculateExpression = (expression: string) => {
        if (!/^[0-9+\-*/().\s]*$/.test(expression)) {
            return null;
        }

        try {
            if (/[+\-*/(]/.test(expression) && !/[+\-*/(]$/.test(expression.trim())) {
                const result = Function(`"use strict"; return (${expression})`)();
                if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
                    return Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/\.?0+$/, '');
                }
            }
        } catch {
            return null;
        }
        return null;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setCalcResult(calculateExpression(val));
    };

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

                <div className="input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        value={query}
                        onChange={handleInputChange}
                        placeholder="Search..."
                    />
                    {calcResult && (
                        <div className="calc-result" onClick={() => {
                            setQuery(calcResult);
                            setCalcResult(null);
                            inputRef.current?.focus();
                        }}>
                            = {calcResult}
                        </div>
                    )}
                </div>

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
