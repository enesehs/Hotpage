export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  fonts: {
    primary: string;
    secondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export type ThemeMode = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'purple' | 'rose' | 'midnight' | 'custom';

export interface CustomThemeColors {
  primary: string;
  secondary: string;
  background: string;
  foreground: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
}
