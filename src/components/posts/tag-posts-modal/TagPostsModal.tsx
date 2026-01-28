// components/posts/tag-posts-modal/TagPostsModal.tsx
'use client';

import { useEffect } from 'react';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import styles from './TagPostsModal.module.css';

interface TagPostsModalProps {
    tagName: string;
    isOpen: boolean;
    onClose: () => void;
}

const TagPostsModal = ({ tagName, isOpen, onClose }: TagPostsModalProps) => {
    useEffect(() => {
        if (isOpen) {
            // ⭐ منع scroll للصفحة الرئيسية عند فتح المودال
            document.body.style.overflow = 'hidden';
            
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            document.addEventListener('keydown', handleEsc);
            
            return () => {
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>
                        Posts with <span className={styles.tagHighlight}>#{tagName}</span>
                    </h2>
                    <button 
                        className={styles.closeButton} 
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ✕
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <PostFeed 
                        tagName={tagName}
                        hideInfiniteScroll={true}
                        hideTitle={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default TagPostsModal;