declare const chrome: any;

import { useState, type FormEvent, useEffect, useRef } from 'react';
import './SearchBar.css';

interface SearchEngine {
    id: string;
    name: string;
    url: string | null;
    icon: React.ReactNode;
}

const SEARCH_ENGINES: SearchEngine[] = [
    {
        id: 'default',
        name: 'Default',
        url: null,
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M469.297 439.13L347.982 317.816C370.466 288.907 384 252.707 384 213.334c0-94.104-76.562-170.667-170.666-170.667S42.667 119.23 42.667 213.334S119.23 384 213.334 384c39.373 0 75.573-13.534 104.481-36.018l121.316 121.315zm-255.963-97.796c-70.584 0-128-57.417-128-128c0-70.584 57.416-128 128-128c70.583 0 128 57.416 128 128c0 70.583-57.417 128-128 128" /></svg>
    },
    {
        id: 'google',
        name: 'Google',
        url: 'https://www.google.com/search?q=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12a6 6 0 0 0 11.659 2H12v-4h9.805v4H21.8c-.927 4.564-4.962 8-9.8 8c-5.523 0-10-4.477-10-10S6.477 2 12 2a9.99 9.99 0 0 1 8.282 4.393l-3.278 2.295A6 6 0 0 0 6 12" /></svg>
    },
    {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        url: 'https://duckduckgo.com/?q=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12s12-5.37 12-12S18.63 0 12 0m0 .984C18.083.984 23.016 5.916 23.016 12S18.084 23.016 12 23.016S.984 18.084.984 12S5.916.984 12 .984m0 .938C6.434 1.922 1.922 6.434 1.922 12c0 4.437 2.867 8.205 6.85 9.55c-.237-.82-.776-2.753-1.6-6.052c-1.184-4.741-2.064-8.606 2.379-9.813c.047-.011.064-.064.03-.093c-.514-.467-1.382-.548-2.233-.38a.06.06 0 0 1-.07-.058c0-.011 0-.023.011-.035c.205-.286.572-.507.822-.64a1.8 1.8 0 0 0-.607-.335c-.059-.022-.059-.12-.006-.144q.008-.01.024-.012c1.749-.233 3.586.292 4.49 1.448a.1.1 0 0 0 .035.023c2.968.635 3.509 4.837 3.328 5.998a9.6 9.6 0 0 0 2.346-.576c.746-.286 1.008-.222 1.101-.053c.1.193-.018.513-.28.81c-.496.567-1.393 1.01-2.974 1.137c-.546.044-1.029.024-1.445.006c-.789-.035-1.339-.059-1.633.39c-.192.298-.041.998 1.487 1.22c1.09.157 2.078.047 2.798-.034c.643-.07 1.073-.118 1.172.069c.21.402-.996 1.207-3.066 1.224q-.238-.002-.467-.011c-1.283-.065-2.227-.414-2.816-.735a.1.1 0 0 1-.035-.017c-.105-.059-.31.045-.188.267c.07.134.444.478 1.004.776c-.058.466.087 1.184.338 2l.088-.016q.063-.015.134-.025c.507-.082.775.012.926.175c.717-.536 1.913-1.294 2.03-1.154c.583.694.66 2.332.53 2.99q-.006.018-.04.035c-.274.117-1.783-.296-1.783-.511c-.059-1.075-.26-1.173-.493-1.225h-.156a.1.1 0 0 1 .018.03l.052.12c.093.257.24 1.063.13 1.26c-.112.199-.835.297-1.284.303c-.443.006-.543-.158-.637-.408c-.07-.204-.103-.675-.103-.95a1 1 0 0 1 .012-.216c-.134.058-.333.193-.397.281c-.017.262-.017.682.123 1.149c.07.221-1.518 1.164-1.74.99c-.227-.181-.634-1.952-.459-2.67c-.187.017-.338.075-.42.191c-.367.508.093 2.933.582 3.248c.257.169 1.54-.553 2.176-1.095c.105.145.305.158.553.158c.326-.012.782-.06 1.103-.158c.192.45.423.972.613 1.388c4.47-1.032 7.803-5.037 7.803-9.82c0-5.566-4.512-10.078-10.078-10.078m1.791 5.646c-.42 0-.678.146-.795.332c-.023.047.047.094.094.07c.14-.075.357-.161.701-.156c.328.006.516.09.67.159l.023.01c.041.017.088-.03.059-.065c-.134-.18-.332-.35-.752-.35m-5.078.198a1.2 1.2 0 0 0-.522.082c-.454.169-.67.526-.67.76c0 .051.112.057.141.011c.081-.123.21-.31.617-.478c.408-.17.73-.146.951-.094c.047.012.083-.041.041-.07a1 1 0 0 0-.558-.211m5.434 1.423a.65.65 0 0 0-.655.647a.652.652 0 0 0 1.307 0a.646.646 0 0 0-.652-.647m.283.262h.008a.17.17 0 0 1 .17.17c0 .093-.077.17-.17.17a.17.17 0 0 1-.17-.17c0-.09.072-.165.162-.17m-5.358.076a.75.75 0 0 0-.758.758c0 .42.338.758.758.758s.758-.337.758-.758a.756.756 0 0 0-.758-.758m.328.303h.01a.199.199 0 1 1 0 .397a.195.195 0 0 1-.197-.198c0-.107.082-.194.187-.199" /></svg>
    },
    {
        id: 'brave',
        name: 'Brave',
        url: 'https://search.brave.com/search?q=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m15.013 2l1.716 1.983s1.507-.426 2.218.299a62 62 0 0 1 1.298 1.364l-.46 1.152l.585 1.705s-1.723 6.65-1.925 7.463c-.398 1.599-.67 2.217-1.8 3.027a152 152 0 0 1-3.742 2.584c-.287.2-.608.423-.903.423s-.617-.224-.904-.423q-.117-.083-.226-.153a152 152 0 0 1-3.516-2.43c-1.13-.811-1.402-1.43-1.8-3.028c-.202-.812-1.925-7.463-1.925-7.463l.586-1.705l-.46-1.152s.585-.64 1.297-1.364c.711-.725 2.218-.299 2.218-.299L8.986 2zM7.751 5.241s-2.207 2.719-2.207 3.3c0 .48.19.668.414.89q.07.069.143.146l1.655 1.79l.054.057c.165.169.409.418.237.832l-.035.084c-.189.449-.42 1.002-.125 1.563c.314.597.853.995 1.199.93c.345-.067 1.156-.498 1.454-.696s1.243-.991 1.243-1.295c0-.253-.68-.675-1.01-.88l-.147-.093l-.162-.104c-.301-.19-.845-.536-.859-.688c-.017-.188-.01-.244.233-.709c.051-.099.112-.205.174-.315c.232-.405.49-.86.433-1.184c-.064-.368-.63-.578-1.107-.757l-.175-.065l-.498-.19v-.001a44 44 0 0 1-1.096-.426c-.12-.057-.09-.11.277-.146l.178-.019c.455-.05 1.292-.14 1.7-.024l.264.073c.457.127 1.018.281 1.072.37l.027.042c.052.075.085.123.028.44l-.094.508c-.127.672-.324 1.724-.349 1.96l-.011.095c-.032.263-.053.438.247.508l.078.018c.338.08.834.195 1.014.195c.179 0 .675-.116 1.013-.195l.078-.018c.3-.07.279-.245.247-.508l-.01-.095c-.026-.236-.223-1.285-.35-1.957l-.094-.51c-.057-.318-.024-.366.028-.44l.027-.043c.054-.089.615-.243 1.072-.37l.265-.073c.407-.116 1.245-.025 1.699.024l.178.019c.367.035.398.09.277.146c-.087.041-.618.244-1.096.426l-.498.19l-.174.066c-.479.179-1.043.39-1.108.757c-.058.325.202.779.433 1.185c.062.109.123.215.175.314c.242.465.249.52.232.709c-.014.153-.558.497-.86.688c-.07.044-.127.08-.16.104l-.148.093c-.33.205-1.01.627-1.01.88c0 .304.945 1.098 1.243 1.295c.298.198 1.11.63 1.455.695c.345.066.884-.332 1.198-.929c.296-.56.064-1.114-.124-1.563l-.036-.084c-.171-.414.072-.663.237-.832l.054-.056l1.655-1.791q.074-.078.144-.146c.223-.222.413-.41.413-.89c0-.581-2.207-3.3-2.207-3.3s-1.863.363-2.114.363c-.2 0-.587-.136-.99-.277l-.307-.107c-.503-.17-.837-.172-.837-.172h.009h-.018H12c-.006 0-.34.003-.838.172q-.152.052-.306.107c-.404.141-.79.277-.99.277c-.252 0-2.115-.363-2.115-.363m5.688 9.78c-.59-.31-1.325-.575-1.44-.575s-.85.265-1.439.576l-.374.196c-.395.207-.674.354-.78.422c-.137.087-.053.251.071.34c.125.09 1.797 1.41 1.96 1.556l.065.06c.156.143.356.326.498.326c.141 0 .34-.183.497-.326l.066-.06a99 99 0 0 1 1.959-1.555c.124-.09.208-.254.071-.341c-.105-.068-.385-.214-.778-.421z" clip-rule="evenodd" /></svg>
    },
    {
        id: 'yandex',
        name: 'Yandex',
        url: 'https://yandex.com/search/?text=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 12 24"><path fill="currentColor" d="M7.083 14.8L2.985 24H-.001l4.5-9.834C2.385 13.092.974 11.148.974 7.552C.969 2.518 4.159.001 7.953.001h3.858v24H9.229v-9.2H7.083zM9.23 2.18H7.852c-2.08 0-4.097 1.378-4.097 5.372c0 3.858 1.847 5.1 4.097 5.1H9.23z" /></svg>
    },
    {
        id: 'baidu',
        name: 'Baidu',
        url: 'https://www.baidu.com/s?wd=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.154 0C7.71 0 6.54 1.658 6.54 3.707c0 2.051 1.171 3.71 2.615 3.71c1.446 0 2.614-1.659 2.614-3.71C11.768 1.658 10.6 0 9.154 0m7.025.594C14.86.58 13.347 2.589 13.2 3.927c-.187 1.745.25 3.487 2.179 3.735c1.933.25 3.175-1.806 3.422-3.364c.252-1.555-.995-3.364-2.362-3.674a1.2 1.2 0 0 0-.261-.03zM3.582 5.535a3 3 0 0 0-.156.008c-2.118.19-2.428 3.24-2.428 3.24c-.287 1.41.686 4.425 3.297 3.864c2.617-.561 2.262-3.68 2.183-4.362c-.125-1.018-1.292-2.773-2.896-2.75m16.534 1.753c-2.308 0-2.617 2.119-2.617 3.616c0 1.43.121 3.425 2.988 3.362s2.553-3.238 2.553-3.988c0-.745-.62-2.99-2.924-2.99m-8.264 2.478c-1.424.014-2.708.925-3.323 1.947c-1.118 1.868-2.863 3.05-3.112 3.363c-.25.309-3.61 2.116-2.864 5.42c.746 3.301 3.365 3.237 3.365 3.237s1.93.19 4.171-.31c2.24-.495 4.17.123 4.17.123s5.233 1.748 6.665-1.616c1.43-3.364-.808-5.109-.808-5.109s-2.99-2.306-4.736-4.798c-1.072-1.665-2.348-2.268-3.528-2.257m-2.234 3.84l1.542.024v8.197H7.758c-1.47-.291-2.055-1.292-2.13-1.462c-.072-.173-.488-.976-.268-2.343c.635-2.049 2.447-2.196 2.447-2.196h1.81zm3.964 2.39v3.881c.096.413.612.488.612.488h1.614v-4.343h1.689v5.782h-3.915c-1.517-.39-1.59-1.465-1.59-1.465v-4.317zm-5.458 1.147c-.66.197-.978.708-1.05.928c-.076.22-.247.78-.1 1.269c.294 1.095 1.248 1.144 1.248 1.144h1.37v-3.34z" /></svg>
    },
    {
        id: 'wikipedia',
        name: 'Wikipedia',
        url: 'https://en.wikipedia.org/wiki/Special:Search?search=',
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640"><path fill="currentColor" d="m640 115.2l-.3 12.2c-28.1.8-45 15.8-55.8 40.3c-25 57.8-103.3 240-155.3 358.6H415l-81.9-193.1c-32.5 63.6-68.3 130-99.2 193.1c-.3.3-15 0-15-.3C172 416.3 122.8 307.4 75.8 197.4c-11.4-26.7-49.4-70-75.6-69.7c0-3.1-.3-10-.3-14.2h161.9v13.9c-19.2 1.1-52.8 13.3-43.3 34.2c21.9 49.7 103.6 240.3 125.6 288.6c15-29.7 57.8-109.2 75.3-142.8c-13.9-28.3-58.6-133.9-72.8-160c-9.7-17.8-36.1-19.4-55.8-19.7v-13.9l142.5.3v13.1c-19.4.6-38.1 7.8-29.4 26.1c18.9 40 30.6 68.1 48.1 104.7c5.6-10.8 34.7-69.4 48.1-100.8c8.9-20.6-3.9-28.6-38.6-29.4c.3-3.6 0-10.3.3-13.6c44.4-.3 111.1-.3 123.1-.6v13.6c-22.5.8-45.8 12.8-58.1 31.7l-59.2 122.8c6.4 16.1 63.3 142.8 69.2 156.7l122.4-282.6c-8.6-23.1-36.4-28.1-47.2-28.3v-13.9l127.8 1.1z" /></svg>
    }
];

interface SearchBarProps {
    engine?: string;
    onEngineChange?: (engine: string) => void;
}

export const SearchBar = ({ engine = 'default', onEngineChange }: SearchBarProps) => {
    const [query, setQuery] = useState('');
    const [calcResult, setCalcResult] = useState<string | null>(null);
    const [isExtension, setIsExtension] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const selectorRef = useRef<HTMLDivElement>(null);

    const activeEngine = SEARCH_ENGINES.find(e => e.id === engine) || SEARCH_ENGINES[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

        if (activeEngine.id === 'default') {
            if (isExtension) {
                chrome.search.query({
                    text: query,
                    disposition: 'CURRENT_TAB'
                });
            } else {
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        } else if (activeEngine.url) {
            window.location.href = `${activeEngine.url}${encodeURIComponent(query)}`;
        }
    };

    return (
        <div className="search-bar">
            <form className="search-form" onSubmit={handleSubmit}>

                <div className="search-engine-selector" ref={selectorRef}>
                    <button
                        type="button"
                        className={`engine-toggle-btn ${isDropdownOpen ? 'open' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        title={activeEngine.name}
                    >
                        {activeEngine.icon}
                        <span className="engine-label">{activeEngine.name}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`chevron ${isDropdownOpen ? 'open' : ''}`}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </button>

                    <div className={`engine-dropdown ${isDropdownOpen ? 'open' : ''}`}>
                        {SEARCH_ENGINES.map((eng) => (
                            <button
                                key={eng.id}
                                type="button"
                                className={`engine-option ${eng.id === engine ? 'selected' : ''}`}
                                onClick={() => {
                                    onEngineChange?.(eng.id);
                                    setIsDropdownOpen(false);
                                    inputRef.current?.focus();
                                }}
                            >
                                <span className="engine-icon">{eng.icon}</span>
                                <span className="engine-name">{eng.name}</span>
                                {eng.id === engine && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

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
