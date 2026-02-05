import React from 'react';
import styles from './LoadingIcon.module.css';

const LoadingIcon = ({
    size = 40,
    message = '',
    zIndex = 1000,
    position = 'absolute'
}) => {
    // ✅ فقط الأنماط الديناميكية inline
    const dynamicStyles = {
        '--dot-size': `${size}px`,
        '--font-size': `${Math.max(12, size / 3)}px`,
        '--z-index': zIndex,
        position: position,
    } as React.CSSProperties;

    return (
        <div 
            className={styles.loadingIconContainer} 
            style={dynamicStyles}
        >
            <div className={styles.skCircle}>
                {[...Array(12)].map((_, index) => (
                    <div
                        key={index}
                        className={`${styles[`skCircle${index + 1}`]} ${styles.skChild}`}
                    ></div>
                ))}
            </div>
            {message && <div className={styles.loadingMessage}>{message}</div>}
        </div>
    );
};

export default LoadingIcon;