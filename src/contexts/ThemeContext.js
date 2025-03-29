import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Get saved theme from localStorage or default to 'light'
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences);
        return parsedPreferences.theme || 'light';
      } catch (error) {
        return 'light';
      }
    }
    return 'light';
  });

  // Apply theme to body element and save to localStorage whenever it changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    
    // Save theme to localStorage immediately when it changes
    const savedPreferences = localStorage.getItem('userPreferences');
    let preferences = {};
    
    if (savedPreferences) {
      try {
        preferences = JSON.parse(savedPreferences);
      } catch (error) {
        console.error('Error parsing preferences:', error);
      }
    }
    
    // Update theme in preferences
    preferences = { ...preferences, theme };
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
