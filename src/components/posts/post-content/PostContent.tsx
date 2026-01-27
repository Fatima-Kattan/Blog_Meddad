'use client';

import { useState } from 'react';
import styles from './PostContent.module.css';

interface PostContentProps {
    title: string;
    caption: string;
    onTagClick?: (tagName: string) => void; // ⬅️ أضفنا هذا
}

const PostContent = ({ title, caption, onTagClick }: PostContentProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 200;

    // ⭐ دالة لتقسيم النص إلى أجزاء (نص عادي و تاغات)
    const renderCaptionWithClickableTags = () => {
        if (!caption) return null;

        const parts = caption.split(/(#\w+)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                const tagName = part.substring(1); // إزالة #
                return (
                    <span
                        key={index}
                        className={styles.hashtag}
                        onClick={() => onTagClick && onTagClick(tagName)}
                        style={{ 
                            cursor: 'pointer',
                            color: '#007bff',
                            fontWeight: 500 
                        }}
                    >
                        {part}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const shouldTruncate = caption.length > maxLength;
    const displayText = isExpanded || !shouldTruncate 
        ? caption 
        : caption.substring(0, maxLength) + '...';

    return (
        <div className={styles.postContent}>
            {/* Post Title */}
            {title && (
                <h2 className={styles.postTitle}>{title}</h2>
            )}
            
            {/* Post Caption */}
            {caption && (
                <div className={styles.captionContainer}>
                    <p className={`${styles.captionText} ${!isExpanded && shouldTruncate ? styles.truncated : ''}`}>
                        {shouldTruncate ? (
                            <>
                                {displayText.split(/(#\w+)/g).map((part, index) => {
                                    if (part.startsWith('#')) {
                                        const tagName = part.substring(1);
                                        return (
                                            <span
                                                key={index}
                                                className={styles.hashtag}
                                                onClick={() => onTagClick && onTagClick(tagName)}
                                                style={{ 
                                                    cursor: 'pointer',
                                                    color: '#007bff',
                                                    fontWeight: 500 
                                                }}
                                            >
                                                {part}
                                            </span>
                                        );
                                    }
                                    return <span key={index}>{part}</span>;
                                })}
                            </>
                        ) : (
                            renderCaptionWithClickableTags()
                        )}
                    </p>
                    
                    {/* Show More/Less Button */}
                    {shouldTruncate && (
                        <button 
                            className={styles.toggleButton}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostContent;