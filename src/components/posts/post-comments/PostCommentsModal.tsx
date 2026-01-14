// src/components/posts/post-comments/PostCommentsModal.tsx
'use client';

import React, { useEffect } from 'react';
import styles from './PostCommentsModal.module.css';
import { HiX } from 'react-icons/hi';
import CommentsList from './comments-list/CommentsList';
import CommentForm from './comment-form/CommentForm';
import { useUserData } from '@/hooks/useUserData'; // ← أضف هذا الاستيراد

interface PostCommentsModalProps {
    post: {
        id: number;
        user: {
            id: number;
            full_name: string;
            image: string;
        };
        title: string;
        caption: string;
        images: string[];
        created_at: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onCommentAdded: () => void;
}

const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
    post,
    isOpen,
    onClose,
    onCommentAdded
}) => {
    // 🔑 استخدم useUserData للحصول على المستخدم الحالي
    const { userData } = useUserData();
    const currentUserId = userData?.id; // ← هذا هو المستخدم المسجل دخوله
    
    console.log('👤 User data in modal:', {
        currentUserId,
        postOwnerId: post.user.id,
        userData
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'الآن';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقيقة`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعة`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} يوم`;

        return date.toLocaleDateString('ar-EG', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                {/* الهيدر - زر إغلاق والعنوان */}
                <div className={styles.header}>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="إغلاق"
                    >
                        <HiX size={24} />
                    </button>
                    <h3 className={styles.title}>التعليقات</h3>
                </div>

                {/* البوست نفسه - كما في الفيسبوك */}
                <div className={styles.postContent}>
                    <div className={styles.postHeader}>
                        <img
                            src={post.user.image}
                            alt={post.user.full_name}
                            className={styles.userAvatar}
                            onError={(e) => {
                                e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.user.full_name);
                            }}
                        />
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>
                                {post.user.full_name}
                            </span>
                            <span className={styles.postTime}>
                                {formatDate(post.created_at)}
                            </span>
                        </div>
                    </div>

                    {post.caption && (
                        <p className={styles.postCaption}>{post.caption}</p>
                    )}

                    {post.images && post.images.length > 0 && (
                        <div className={styles.postImages}>
                            <img
                                src={post.images[0]}
                                alt="Post"
                                className={styles.mainImage}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* قائمة التعليقات */}
                <div className={styles.commentsListWrapper}>
                    <CommentsList
                        key={`comments-${post.id}-${Date.now()}`}
                        postId={post.id}
                        currentUserId={currentUserId} // ← التعديل هنا! استخدم currentUserId
                    />
                </div>

                {/* نموذج إضافة تعليق */}
                <div className={styles.commentFormWrapper}>
                    <CommentForm
                        postId={post.id}
                        onCommentAdded={onCommentAdded}
                    />
                </div>
            </div>
        </div>
    );
};

export default PostCommentsModal;