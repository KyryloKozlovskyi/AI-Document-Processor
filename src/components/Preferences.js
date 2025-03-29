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
        
        // If theme is changed, update the context too
        if (name === 'theme') {
            setTheme(value);
        }
    };

    const handleSave = () => {
        // Save preferences to local storage
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        alert('Preferences saved!');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Preferences</h2>
            <div style={{ marginBottom: '10px' }}>
                <label>
                    Theme:
                    <select name="theme" value={preferences.theme} onChange={handleChange}>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                    </select>
                </label>
            </div>
            <button onClick={handleSave}>Save Preferences</button>
        </div>
    );
};

export default Preferences;