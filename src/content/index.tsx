import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentApp } from './ContentApp';

declare let chrome: any;

if (window.location.protocol === 'chrome-extension:' ||
    window.location.protocol === 'moz-extension:' ||
    document.getElementById('hotpage-app')) {
} else {

    const container = document.createElement('div');
    container.id = 'hotpage-sticky-notes-root';
    document.body.appendChild(container);

    const shadow = container.attachShadow({ mode: 'open' });

    const mountPoint = document.createElement('div');
    shadow.appendChild(mountPoint);

    const cssUrl = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.getURL('assets/main.css') : '';
    if (cssUrl) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssUrl;
        shadow.appendChild(link);
    }


    createRoot(mountPoint).render(
        <React.StrictMode>
            <ContentApp />
        </React.StrictMode>
    );
}
