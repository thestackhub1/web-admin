// Client-side only — no server secrets or database access here

/**
 * HTML Sanitization Utility
 * Safely sanitizes HTML content using DOMPurify
 */

import DOMPurify from 'dompurify';

/**
 * Configuration for DOMPurify
 * Allows math equations, tables, images, and standard formatting
 */
const sanitizeConfig = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote',
    'a',
    'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'span', 'div',
    'sub', 'sup',
    'mark',
  ],
  ALLOWED_ATTR: [
    'href', 'target', 'rel',
    'src', 'alt', 'width', 'height',
    'style', 'class',
    'data-type', 'data-formula', 'data-display',
    'align',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (will be sanitized on client)
    return html;
  }

  return DOMPurify.sanitize(html, sanitizeConfig);
}

/**
 * Check if HTML contains rich content (math, images, tables, etc.)
 */
export function hasRichContent(html: string): boolean {
  if (!html) return false;

  const richContentPatterns = [
    /<img[^>]*>/i,
    /<table[^>]*>/i,
    /data-type="math"/i,
    /data-formula=/i,
    /<span[^>]*class="blank-mark"/i,
  ];

  return richContentPatterns.some(pattern => pattern.test(html));
}

/**
 * Convert plain text to HTML (for backward compatibility)
 */
export function textToHtml(text: string): string {
  if (!text) return '';

  // If already HTML, return as-is
  if (text.trim().startsWith('<')) {
    return text;
  }

  // Convert newlines to <br> and escape HTML
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}




