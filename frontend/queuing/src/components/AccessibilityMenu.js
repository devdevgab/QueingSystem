import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../css/AccessibilityMenuStyles.css';
import accessibilityIcon from '../assets/icons/accessibility.svg';

const AccessibilityMenu = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [fontSize, setFontSize] = useState(16); // Default font size
    const menuRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const increaseFontSize = () => {
        setFontSize(prev => Math.min(prev + 2, 24));
        document.documentElement.style.fontSize = `${fontSize + 2}px`;
    };

    const decreaseFontSize = () => {
        setFontSize(prev => Math.max(prev - 2, 12));
        document.documentElement.style.fontSize = `${fontSize - 2}px`;
    };

    const resetSettings = () => {
        setFontSize(16);
        document.documentElement.style.fontSize = '16px';
        if (isDarkMode) {
            toggleTheme();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="accessibility-menu" ref={menuRef}>
            <button
                className="accessibility-toggle"
                onClick={toggleMenu}
                aria-label="Accessibility Options"
                type="button"
            >
                <img src={accessibilityIcon} alt="Accessibility" className="accessibility-icon" />
            </button>

            {isOpen && (
                <div className="accessibility-panel">
                    <h3>Accessibility Options</h3>

                    <div className="accessibility-option">
                        <label>Dark Mode</label>
                        <button
                            onClick={toggleTheme}
                            className={`toggle-button ${isDarkMode ? 'active' : ''}`}
                            type="button"
                        >
                            {isDarkMode ? 'On' : 'Off'}
                        </button>
                    </div>

                    <div className="accessibility-option">
                        <label>Font Size</label>
                        <div className="font-size-controls">
                            <button onClick={decreaseFontSize} aria-label="Decrease font size" type="button">A-</button>
                            <span>{fontSize}px</span>
                            <button onClick={increaseFontSize} aria-label="Increase font size" type="button">A+</button>
                        </div>
                    </div>

                    <div className="accessibility-option">
                        <button onClick={resetSettings} className="reset-button" type="button">
                            Reset to Default
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessibilityMenu; 