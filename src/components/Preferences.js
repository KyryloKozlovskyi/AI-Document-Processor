import React, { useState, useContext, useEffect } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

const Preferences = () => {
    const { theme, setTheme } = useContext(ThemeContext);
    const [preferences, setPreferences] = useState({
        theme: theme,
    });

    useEffect(() => {
        // Update local state when context theme changes
        setPreferences(prev => ({ ...prev, theme }));
    }, [theme]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;
        
        setPreferences({
            ...preferences,
            [name]: newValue,
        });
        
        // If theme is changed, update the context
        if (name === 'theme') {
            setTheme(value);
        }
    };

    const handleSave = () => {
        // For any other preferences besides theme
        // Theme is already saved by the ThemeContext
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        alert('Preferences saved successfully!');
    };

    return (
        <div className="preferences-container">
            <h2>User Preferences</h2>
            <div className="theme-selector">
                <label htmlFor="theme-select">Theme:</label>
                <select 
                    id="theme-select"
                    name="theme" 
                    value={preferences.theme} 
                    onChange={handleChange}
                >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                </select>
            </div>
            <p>Current theme: <strong>{preferences.theme.charAt(0).toUpperCase() + preferences.theme.slice(1)}</strong></p>
            <button className="save-button" onClick={handleSave}>
                Save All Preferences
            </button>
        </div>
    );
};

export default Preferences;