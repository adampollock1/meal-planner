import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAccount } from './AccountContext';

type Theme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

function resolveTheme(preference: ThemePreference): Theme {
  if (preference === 'system') {
    return getSystemTheme();
  }
  return preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useAccount();
  const themePreference = settings.theme;

  // Resolve the actual theme based on preference
  const theme = useMemo(() => resolveTheme(themePreference), [themePreference]);
  const isDark = theme === 'dark';

  // Update theme preference
  const setThemePreference = useCallback((preference: ThemePreference) => {
    updateSettings({ theme: preference });
  }, [updateSettings]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (themePreference !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      const newTheme = getSystemTheme();
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  // Add transition class after initial load to prevent flash
  useEffect(() => {
    // Small delay to ensure initial theme is applied without transition
    const timeout = setTimeout(() => {
      document.documentElement.classList.add('theme-transition');
    }, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  const value: ThemeContextType = {
    theme,
    themePreference,
    setThemePreference,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
