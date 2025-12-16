import DOMPurify from 'dompurify';

/**
 * Sanitizes SVG content to prevent XSS attacks
 * Removes potentially dangerous elements and attributes
 */
export const sanitizeSVG = (svg: string): string => {
    return DOMPurify.sanitize(svg, {
        USE_PROFILES: { svg: true, svgFilters: true },
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link', 'style'],
        FORBID_ATTR: [
            'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
            'onmousemove', 'onmouseenter', 'onmouseleave', 'onfocus', 'onblur',
            'onchange', 'onsubmit', 'onkeydown', 'onkeyup', 'onkeypress'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
    });
};

/**
 * Sanitizes HTML content - stricter than SVG sanitization
 */
export const sanitizeHTML = (html: string): string => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false
    });
};
