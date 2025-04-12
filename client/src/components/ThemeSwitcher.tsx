import React from 'react';
import { FiSun, FiMoon, FiLoader } from 'react-icons/fi';
import { useTheme } from '../hooks/use-theme';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isLoading } = useTheme();
  
  return (
    <button
      className={`p-2 rounded-lg transition-colors ${className} ${
        theme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      }`}
      onClick={toggleTheme}
      disabled={isLoading}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {isLoading ? (
        <FiLoader className="h-5 w-5 animate-spin" />
      ) : theme === 'dark' ? (
        <FiSun className="h-5 w-5" />
      ) : (
        <FiMoon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeSwitcher;