'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './NotFound.module.css';
import Navbar from '@/components/shared/navbar/Navbar';
import { 
    FaExclamationTriangle, 
    FaHome, 
    FaArrowLeft
} from 'react-icons/fa';

export default function NotFound() {
    const router = useRouter();

    const handleHomeClick = () => {
        router.push('/');
    };

    const handleGoBack = () => {
        // حل أكثر أماناً
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
        } else {
            router.push('/');
        }
    };

    return (
        <div className={styles.container}>
            <Navbar />

            <main className={styles.mainContent}>
                <div className={styles.illustrationContainer}>
                    <div className={styles.backgroundEffects}>
                        <div className={styles.glowEffect1}></div>
                        <div className={styles.glowEffect2}></div>
                        <div className={styles.glowEffect3}></div>
                    </div>

                    <div className={styles.errorIcon}>
                        <div className={styles.iconWrapper}>
                            <FaExclamationTriangle className={styles.mainIcon} />
                            <div className={styles.iconGlow}></div>
                        </div>
                        <div className={styles.errorCode}>
                            <span className={styles.codeNumber}>4</span>
                            <span className={styles.codeNumber}>0</span>
                            <span className={styles.codeNumber}>4</span>
                        </div>
                    </div>

                    <div className={styles.messageContainer}>
                        <h1 className={styles.title}>
                            Page Not Found
                        </h1>
                        <p className={styles.subtitle}>
                            Sorry, the page you are looking for may have been moved, deleted, or perhaps never existed!
                        </p>
                    </div>

                    <div className={styles.actionButtons}>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('Go Back clicked');
                                handleGoBack();
                            }}
                            className={`${styles.button} ${styles.backButton}`}
                            style={{ cursor: 'pointer', position: 'relative', zIndex: 100 }}
                            aria-label="Go back to previous page"
                        >
                            <FaArrowLeft />
                            <span>Go Back</span>
                        </button>

                        <button 
                            onClick={handleHomeClick}
                            className={`${styles.button} ${styles.homeButton}`}
                            style={{ cursor: 'pointer' }}
                            aria-label="Go to home page"
                        >
                            <FaHome />
                            <span>Home Page</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}