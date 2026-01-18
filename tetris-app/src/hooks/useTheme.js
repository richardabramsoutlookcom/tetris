import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tetris-theme';
const THEMES = ['modern', 'gameboy'];
const DEFAULT_THEME = 'modern';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && THEMES.includes(stored)) {
        return stored;
      }
    }
    return DEFAULT_THEME;
  });

  // Sync theme to document and localStorage
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === 'modern' ? 'gameboy' : 'modern'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
