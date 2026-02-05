import React from 'react';
import styles from './LoadingIcon.module.css';

const LoadingIcon = ({
    size = 40,
    message = '',
    zIndex = 1000,
    position = 'absolute' // ✅ خاصية position مع قيمة افتراضية
}) => {
    // ✅ position ديناميكي يأتي من props
    const containerStyle = {
        position: position, // ✅ ديناميكي
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: zIndex,
        backgroundColor: 'transparent'
    };

    const circleStyle = {
        width: `${size}px`,
        height: `${size}px`
    };

    const messageStyle = {
        marginTop: '10px',
        color: '#a78bfa',
        fontSize: `${Math.max(12, size / 3)}px`,
        textAlign: 'center'
    };

    return (
        <div className={styles.loadingIconContainer} style={containerStyle}>
            <div className={styles.skCircle} style={circleStyle}>
                {[...Array(12)].map((_, index) => (
                    <div
                        key={index}
                        className={`${styles[`skCircle${index + 1}`]} ${styles.skChild}`}
                    ></div>
                ))}
            </div>
            {message && <div className={styles.loadingMessage} style={messageStyle}>{message}</div>}
        </div>
    );
};

export default LoadingIcon;