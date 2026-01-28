'use client';

import { useEffect, useState } from 'react';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import styles from './TagPostsModal.module.css';
import { HiHashtag, HiX, HiEmojiSad } from 'react-icons/hi';

interface TagPostsModalProps {
    tagName: string;
    isOpen: boolean;
    onClose: () => void;
}

const TagPostsModal = ({ tagName, isOpen, onClose }: TagPostsModalProps) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // منع scroll للصفحة الرئيسية عند فتح المودال
            document.body.style.overflow = 'hidden';
            setIsClosing(false);
            
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') handleClose();
            };
            document.addEventListener('keydown', handleEsc);
            
            return () => {
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 300);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div 
            className={styles.modalOverlay} 
            onClick={handleOverlayClick}
            style={{
                animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : undefined
            }}
        >
            <style jsx>{`
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideOut {
                    from { transform: translateY(0) scale(1); opacity: 1; }
                    to { transform: translateY(-30px) scale(0.95); opacity: 0; }
                }
            `}</style>
            
            <div 
                className={styles.modalContent} 
                onClick={handleModalClick}
                style={{
                    animation: isClosing ? 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards' : undefined
                }}
            >
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        <HiHashtag style={{ color: 'var(--color-primary)' }} />
                        Posts tagged with: <span className={styles.tagHighlight}>#{tagName}</span>
                    </h2>
                    <button 
                        className={styles.closeButton} 
                        onClick={handleClose}
                        aria-label="Close modal"
                    >
                        <HiX size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <PostFeed 
                        tagName={tagName}
                        hideInfiniteScroll={true}
                        hideTitle={true}
                        renderEmptyState={() => (
                            <div className={styles.noPosts}>
                                <HiEmojiSad className={styles.noPostsIcon} />
                                <p>No posts found with tag #{tagName}</p>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '8px' }}>
                                    Be the first to post using #{tagName}
                                </p>
                            </div>
                        )}
                        renderLoading={() => (
                            <div className={styles.loading}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Loading posts with #{tagName}...</p>
                                <div className={styles.loadingDots}>
                                    <span className={styles.loadingDot}></span>
                                    <span className={styles.loadingDot}></span>
                                    <span className={styles.loadingDot}></span>
                                </div>
                            </div>
                        )}
                        renderError={(error) => (
                            <div className={styles.error}>
                                <p>Error loading posts</p>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    {error}
                                </p>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

export default TagPostsModal;