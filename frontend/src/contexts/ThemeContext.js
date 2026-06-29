import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { colors as lightColors } from '../theme';

const STORAGE_KEY = '@icu_theme_mode';

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceAlt: '#282828',
  border: '#2A2A2A',
  text: { primary: '#FFFFFF', secondary: '#A0A0A0', tertiary: '#666666', inverse: '#121212' },
  brand: { primary: '#4DA6FF', primarySoft: '#1E3A5F', primaryDeep: '#0D2137' },
  status: { critical: '#FF4C4C', warning: '#FFB84D', safe: '#4CAF50', info: '#4DA6FF', pending: '#666666' },
  chip: { blue: '#1E3A5F', green: '#1A3A2A', orange: '#3A2A1A', red: '#3A1A1A', gray: '#2A2A2A' },
};

export const darkTheme = {
  bg: '#121212',
  card: '#1E1E1E',
  cardBorder: '#2A2A2A',
  input: '#2D2D2D',
  text: { primary: '#FFFFFF', secondary: '#A0A0A0', disabled: '#666666' },
  semantic: { critical: '#FF4C4C', warning: '#FFB84D', stable: '#4CAF50', info: '#4DA6FF' },
  surfaceAlt: '#282828',
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') setMode(stored);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;
  const theme = isDark ? darkTheme : null;

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, isDark, colors, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}
