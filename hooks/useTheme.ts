'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Load theme from localStorage
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else {
      setTheme('system');
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.style.setProperty('--background', '#0f0f0f');
        root.style.setProperty('--surface', '#1e1e1e');
        root.style.setProperty('--surface-raised', '#282828');
        root.style.setProperty('--foreground', '#e3e3e3');
        root.style.setProperty('--foreground-heading', '#ffffff');
        root.style.setProperty('--muted', '#a0a0a0');
        root.style.setProperty('--accent', '#722f37');
        root.style.setProperty('--accent-hover', '#8a3842');
        root.style.setProperty('--border-color', '#383838');
        root.style.setProperty('--border-focus', '#505050');
        setResolvedTheme('dark');
      } else {
        root.style.setProperty('--background', '#f5f5f5');
        root.style.setProperty('--surface', '#ffffff');
        root.style.setProperty('--surface-raised', '#f9f9f9');
        root.style.setProperty('--foreground', '#1a1a1a');
        root.style.setProperty('--foreground-heading', '#000000');
        root.style.setProperty('--muted', '#666666');
        root.style.setProperty('--accent', '#722f37');
        root.style.setProperty('--accent-hover', '#8a3842');
        root.style.setProperty('--border-color', '#e0e0e0');
        root.style.setProperty('--border-focus', '#c0c0c0');
        setResolvedTheme('light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return { theme, resolvedTheme, setTheme: changeTheme };
}
