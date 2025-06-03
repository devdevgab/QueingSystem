import React, { useState, useEffect } from 'react';
import '../css/LoadingScreenStyles.css';

const LoadingScreen = ({ onFadeComplete }) => {
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // Start fade out after 1.5 seconds
        const timer = setTimeout(() => {
            setIsFading(true);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const handleAnimationEnd = () => {
        if (isFading && onFadeComplete) {
            onFadeComplete();
        }
    };

    return (
        <div
            className={`loading-screen ${isFading ? 'fade-out' : ''}`}
            onAnimationEnd={handleAnimationEnd}
        >
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <h2>Loading...</h2>
                <p>Please wait while we prepare your dashboard</p>
            </div>
        </div>
    );
};

export default LoadingScreen; 