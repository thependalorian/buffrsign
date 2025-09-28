import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import Button from './button';

/**
 * BuffrSign Theme Toggle Component
 * 
 * Purpose: Toggle between light and dark themes
 * Location: /components/ui/ThemeToggle.tsx
 * Features: Design system compliant, accessible, persistent theme
 */

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('buffrsign-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldBeDark);
    document.documentElement.setAttribute('data-theme', shouldBeDark ? 'buffrsign-dark' : 'buffrsign');
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    // Update HTML data-theme attribute
    document.documentElement.setAttribute('data-theme', newTheme ? 'buffrsign-dark' : 'buffrsign');
    
    // Save preference
    localStorage.setItem('buffrsign-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};

export default ThemeToggle;
