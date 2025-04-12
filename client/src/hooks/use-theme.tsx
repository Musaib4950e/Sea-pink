import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../interfaces';
import { apiRequest } from '../lib/queryClient';

type Theme = 'dark' | 'light';

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children, user }: { children: ReactNode, user: User | null }) => {
  // Default to user's preference or system preference, fallback to dark
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get user preference if available
    if (user && user.theme) {
      return user.theme as Theme;
    }
    
    // Get system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    
    // Default to dark
    return 'dark';
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
  }, [theme]);

  // Save theme to user preferences if logged in
  const saveThemePreference = async (newTheme: Theme) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await apiRequest('PUT', '/api/theme', { theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setThemeState(newTheme);
    saveThemePreference(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};