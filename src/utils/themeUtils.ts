import type { Theme, CustomThemeColors } from '../types/theme';
import { predefinedThemes } from './themes';

export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;

  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
    
    // Also set RGB versions for rgba() usage
    if (value.startsWith('#')) {
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      root.style.setProperty(`--color-${key}-rgb`, `${r}, ${g}, ${b}`);
    }
  });

  // Apply shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Apply border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  // Apply fonts
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--font-${key}`, value);
  });

  // Apply spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
};

export const getTheme = (themeName: string, customColors?: CustomThemeColors): Theme => {
  // If custom theme, create theme from custom colors
  if (themeName === 'custom' && customColors) {
    return createCustomTheme(customColors);
  }

  // Return predefined theme or default to ocean
  return predefinedThemes[themeName as keyof typeof predefinedThemes] || predefinedThemes.ocean;
};

export const createCustomTheme = (colors: CustomThemeColors): Theme => {
  // Calculate shadow color from primary
  const shadowColor = colors.primary;
  const r = parseInt(shadowColor.slice(1, 3), 16);
  const g = parseInt(shadowColor.slice(3, 5), 16);
  const b = parseInt(shadowColor.slice(5, 7), 16);

  return {
    name: 'Custom',
    colors,
    shadows: {
      sm: `0 1px 2px 0 rgba(${r}, ${g}, ${b}, 0.1)`,
      md: `0 4px 6px -1px rgba(${r}, ${g}, ${b}, 0.15)`,
      lg: `0 10px 15px -3px rgba(${r}, ${g}, ${b}, 0.2)`,
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
};
