import type { Theme } from '../types/theme';

export const lightTheme: Theme = {
  name: 'Light',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    foreground: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    accent: '#10b981',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const darkTheme: Theme = {
  name: 'Dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#1e293b',
    foreground: '#334155',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#475569',
    accent: '#34d399',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const oceanTheme: Theme = {
  name: 'Ocean',
  colors: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    background: '#f0f9ff',
    foreground: '#e0f2fe',
    text: '#0c4a6e',
    textSecondary: '#075985',
    border: '#bae6fd',
    accent: '#0284c7',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(14, 165, 233, 0.1)',
    md: '0 4px 6px -1px rgba(14, 165, 233, 0.15)',
    lg: '0 10px 15px -3px rgba(14, 165, 233, 0.2)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const forestTheme: Theme = {
  name: 'Forest',
  colors: {
    primary: '#10b981',
    secondary: '#059669',
    background: '#f0fdf4',
    foreground: '#dcfce7',
    text: '#064e3b',
    textSecondary: '#065f46',
    border: '#bbf7d0',
    accent: '#22c55e',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(16, 185, 129, 0.1)',
    md: '0 4px 6px -1px rgba(16, 185, 129, 0.15)',
    lg: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const sunsetTheme: Theme = {
  name: 'Sunset',
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    background: '#fff7ed',
    foreground: '#ffedd5',
    text: '#7c2d12',
    textSecondary: '#9a3412',
    border: '#fed7aa',
    accent: '#fb923c',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(249, 115, 22, 0.1)',
    md: '0 4px 6px -1px rgba(249, 115, 22, 0.15)',
    lg: '0 10px 15px -3px rgba(249, 115, 22, 0.2)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const purpleTheme: Theme = {
  name: 'Purple',
  colors: {
    primary: '#a855f7',
    secondary: '#9333ea',
    background: '#faf5ff',
    foreground: '#f3e8ff',
    text: '#581c87',
    textSecondary: '#6b21a8',
    border: '#e9d5ff',
    accent: '#c084fc',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(168, 85, 247, 0.1)',
    md: '0 4px 6px -1px rgba(168, 85, 247, 0.15)',
    lg: '0 10px 15px -3px rgba(168, 85, 247, 0.2)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const roseTheme: Theme = {
  name: 'Rose',
  colors: {
    primary: '#ec4899',
    secondary: '#db2777',
    background: '#fdf2f8',
    foreground: '#fce7f3',
    text: '#831843',
    textSecondary: '#9f1239',
    border: '#fbcfe8',
    accent: '#f472b6',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(236, 72, 153, 0.1)',
    md: '0 4px 6px -1px rgba(236, 72, 153, 0.15)',
    lg: '0 10px 15px -3px rgba(236, 72, 153, 0.2)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const midnightTheme: Theme = {
  name: 'Midnight',
  colors: {
    primary: '#60a5fa',
    secondary: '#818cf8',
    background: '#0f172a',
    foreground: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#334155',
    accent: '#38bdf8',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
  },
  fonts: {
    primary: '"Mona Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    secondary: '"Mona Sans Expanded", system-ui, sans-serif',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
};

export const predefinedThemes = {
  light: lightTheme,
  dark: darkTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  purple: purpleTheme,
  rose: roseTheme,
  midnight: midnightTheme,
};

export const defaultThemes = predefinedThemes;
