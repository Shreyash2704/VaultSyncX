import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  // Swap bg for the button only
  const bg =
    theme === 'light'
      ? '#141A1F' // dark bg for light theme
      : '#F5F7FA'; // light bg for dark theme

  const color =
    theme === 'light'
      ? '#FFFFFF' // light font for dark bg
      : '#1A2233'; // dark font for light bg

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 px-2 py-2 rounded-full transition-colors duration-200 border"
      aria-label="Toggle theme"
      style={{
        background: bg,
        color,
        borderColor: theme === 'light' ? '#333' : '#ccc',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle; 