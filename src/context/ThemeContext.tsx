import { createContext, useContext, useState, useEffect,type ReactNode } from 'react';

// Define the color schemes
const themes = {
  light: {
    '--color-bg': '#fffcf1', // light background
    '--color-font': '#1A2233', // dark font
    '--color-component': '#eeeae6', // white components
    '--color-primary-btn':"#0D80F2",
    '--color-secondary-btn':"#FFFFFF",
    '--color-table-header':"#fff",
    '--color-table-row':"#FFFFFF",
    // New variables for Swap UI
    '--color-highlight-bg': '#fffbe6',
    '--color-highlight-text': '#b59f3b',
    '--color-card-section': '#f7f8fa',
    '--color-input-bg': '#fff',
    '--color-primary-btn-bg': '#ffda35',
    '--color-primary-btn-text': '#000',
    '--color-input-color': '#1A2233',
  },
  dark: {
    '--color-bg': '#141A1F', // dark background
    '--color-font': '#FFFFFF', // white font
    '--color-component': '#21364A', // blue components,
    '--color-primary-btn':"#0D80F2",
    '--color-secondary-btn':"#21364A",
    '--color-table-header':"#1F2126",
    '--color-table-row':"#141A1F",
    // New variables for Swap UI
    '--color-highlight-bg': '#2d2a1a',
    '--color-highlight-text': '#ffe066',
    '--color-card-section': '#232b36',
    '--color-input-bg': '#1a2233',
    '--color-primary-btn-bg': '#2e3d1f',
    '--color-primary-btn-text': '#b2c97f',
    '--color-input-color': '#fff',
  },
};

type Theme = 'light' | 'dark';

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('light');

  // Apply CSS variables to :root
  useEffect(() => {
    const root = document.documentElement;
    const themeVars = themes[theme];
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}; 