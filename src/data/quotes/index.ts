import { quotes as enQuotes, type Quote } from './en';
import { quotes as trQuotes } from './tr';
import { quotes as esQuotes } from './es';
import { quotes as frQuotes } from './fr';
import { quotes as itQuotes } from './it';
import { quotes as jaQuotes } from './ja';

export type { Quote };

const quotesByLocale: Record<string, Quote[]> = {
  'en': enQuotes,
  'en-US': enQuotes,
  'en-GB': enQuotes,
  'tr': trQuotes,
  'tr-TR': trQuotes,
  'es': esQuotes,
  'es-ES': esQuotes,
  'es-MX': esQuotes,
  'fr': frQuotes,
  'fr-FR': frQuotes,
  'it': itQuotes,
  'it-IT': itQuotes,
  'ja': jaQuotes,
  'ja-JP': jaQuotes,
};

export const getRandomQuote = (locale: string = 'en'): Quote => {
  // Extract language code from locale (e.g., 'en-US' -> 'en')
  const langCode = locale.split('-')[0];
  
  // Try full locale first, then language code, then fallback to English
  const quotes = quotesByLocale[locale] || quotesByLocale[langCode] || enQuotes;
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};
