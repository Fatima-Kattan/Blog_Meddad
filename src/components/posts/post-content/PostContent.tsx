// components/posts/post-content/PostContent.tsx
'use client';

import { useState } from 'react';
import styles from './PostContent.module.css';

interface PostContentProps {
    title: string;
    caption: string;
}

const PostContent = ({ title, caption }: PostContentProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const maxLength = 200; // Character limit before truncation

    // ⭐ دالة لتمييز التاغات داخل النص
    const highlightHashtagsInText = (text: string) => {
        if (!text) return '';
        return text.replace(
            /#(\w+)/g,
            '<span style="color: #007bff; font-weight: 500;">#$1</span>'
        );
    };

    const shouldTruncate = caption.length > maxLength;
    const displayText = isExpanded || !shouldTruncate 
        ? caption 
        : caption.substring(0, maxLength) + '...';
    
    const highlightedText = highlightHashtagsInText(displayText);

    return (
        <div className={styles.postContent}>
            {/* Post Title */}
            {title && (
                <h2 className={styles.postTitle}>{title}</h2>
            )}
            
            {/* Post Caption */}
            {caption && (
                <div className={styles.captionContainer}>
                    <p 
                        className={`${styles.captionText} ${!isExpanded && shouldTruncate ? styles.truncated : ''}`}
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                    />
                    
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