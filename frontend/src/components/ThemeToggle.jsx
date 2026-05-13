import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('promptquill_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

// Apply theme to document immediately
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const [isMobile, setIsMobile] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 769;
      setIsMobile(mobile);
      if (!mobile) {
        applyTheme('dark');
      } else {
        applyTheme(theme);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggle = () => {
    const newTheme = isLight ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    window.localStorage.setItem('promptquill_theme', newTheme);
  };

  if (!isMobile) return null;

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      title={isLight ? 'Dark mode' : 'Light mode'}
      onClick={handleToggle}
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__orb">
          <Sun className="theme-toggle__icon theme-toggle__icon--sun" size={16} />
          <Moon className="theme-toggle__icon theme-toggle__icon--moon" size={15} />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
