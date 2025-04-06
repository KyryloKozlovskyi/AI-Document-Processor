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

    return (
        <div class='root-container'>
            <h2 className="page-title">User Preferences</h2>
            <div className="preferences-content">
                <div className="preference-section">
                    <div className="form-group">
                        <label htmlFor="theme-select">Theme:</label>
                        <select 
                            name="theme" 
                            value={preferences.theme} 
                            onChange={handleChange}
                            className="form-control"
                        >
                            <option value="light">Light Mode</option>
                            <option value="dark">Dark Mode</option>
                        </select>
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default Preferences;