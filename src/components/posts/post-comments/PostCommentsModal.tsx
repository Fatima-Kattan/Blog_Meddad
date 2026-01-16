// src/components/posts/post-comments/PostCommentsModal.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from './PostCommentsModal.module.css';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import CommentsList from './comments-list/CommentsList';
import CommentForm from './comment-form/CommentForm';
import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'next/navigation'; // ⭐ إضافة useRouter

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
    const { userData } = useUserData();
    const currentUserId = userData?.id;
    const [isLongPost, setIsLongPost] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showImageModal, setShowImageModal] = useState(false);
    const postContentRef = useRef<HTMLDivElement>(null);
    const commentsListRef = useRef<HTMLDivElement>(null);
    const router = useRouter(); // ⭐ إضافة useRouter

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // التحقق إذا كان المنشور طويلاً
            setTimeout(() => {
                if (postContentRef.current) {
                    const postHeight = postContentRef.current.scrollHeight;
                    const viewportHeight = window.innerHeight;
                    const shouldLimitPostHeight = postHeight > viewportHeight * 0.3;
                    
                    setIsLongPost(shouldLimitPostHeight);
                    
                    // تحسين ارتفاع منطقة الكومنتات بناءً على طول المنشور
                    if (shouldLimitPostHeight) {
                        console.log('Post is long, giving more space to comments');
                    }
                }
            }, 100);
        } else {
            document.body.style.overflow = 'unset';
            setIsLongPost(false);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // ⭐ دالة الذهاب إلى البروفايل
    const navigateToProfile = (userId: number) => {
        onClose(); // إغلاق المودال أولاً
        router.push(`/profile/${userId}`);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setShowImageModal(true);
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev => 
            prev < post.images.length - 1 ? prev + 1 : 0
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev => 
            prev > 0 ? prev - 1 : post.images.length - 1
        );
    };

    const handleCloseImageModal = () => {
        setShowImageModal(false);
    };

    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={handleOverlayClick}>
                <div className={`${styles.modal} ${isLongPost ? styles.hasLongPost : ''}`}>
                    {/* Header */}
                    <div className={styles.header}>
                        <button
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <HiX size={24} />
                        </button>
                        <h3 className={styles.title}>Comments</h3>
                    </div>

                    {/* Post Content */}
                    <div 
                        className={styles.postContent}
                        ref={postContentRef}
                    >
                        <div className={styles.postHeader}>
                            {/* ⭐ تعديل صورة المستخدم - جعلها قابلة للنقر */}
                            <div 
                                className={styles.userAvatarContainer}
                                onClick={() => navigateToProfile(post.user.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={post.user.image}
                                    alt={post.user.full_name}
                                    className={styles.userAvatar}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.user.full_name);
                                    }}
                                />
                            </div>
                            <div className={styles.userDetails}>
                                {/* ⭐ تعديل اسم المستخدم - جعله قابلاً للنقر */}
                                <span 
                                    className={styles.userName}
                                    onClick={() => navigateToProfile(post.user.id)}
                                    style={{ cursor: 'pointer' }}
                                >
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
                                {/* عرض الصورة الأولى فقط */}
                                <div 
                                    className={styles.mainImageContainer}
                                    onClick={() => handleImageClick(0)}
                                >
                                    <img
                                        src={post.images[0]}
                                        alt="Post"
                                        className={styles.mainImage}
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    
                                    {/* زر إذا كان هناك أكثر من صورة */}
                                    {post.images.length > 1 && (
                                        <div className={styles.moreImagesIndicator}>
                                            <button className={styles.viewMoreButton}>
                                                View all {post.images.length} photos
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* عرض الصور المصغرة (thumbnail) للصور الإضافية */}
                                {post.images.length > 1 && (
                                    <div className={styles.imageThumbnails}>
                                        {post.images.slice(1, 4).map((image, index) => (
                                            <div 
                                                key={index + 1}
                                                className={styles.thumbnailContainer}
                                                onClick={() => handleImageClick(index + 1)}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`Post image ${index + 2}`}
                                                    className={styles.thumbnailImage}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                {index === 2 && post.images.length > 4 && (
                                                    <div className={styles.moreOverlay}>
                                                        +{post.images.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Comments List */}
                    <div className={styles.commentsListWrapper} ref={commentsListRef}>
                        <CommentsList
                            key={`comments-${post.id}-${Date.now()}`}
                            postId={post.id}
                            currentUserId={currentUserId}
                        />
                    </div>

                    {/* Comment Form */}
                    <div className={styles.commentFormWrapper}>
                        <CommentForm
                            postId={post.id}
                            onCommentAdded={onCommentAdded}
                        />
                    </div>
                </div>
            </div>

            {/* Modal لعرض جميع الصور */}
            {showImageModal && (
                <div className={styles.imageModalOverlay} onClick={handleCloseImageModal}>
                    <div className={styles.imageModal} onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className={styles.imageModalHeader}>
                            <button
                                className={styles.imageModalCloseButton}
                                onClick={handleCloseImageModal}
                                aria-label="Close"
                            >
                                <HiX size={24} />
                            </button>
                            <span className={styles.imageCounter}>
                                {currentImageIndex + 1} / {post.images.length}
                            </span>
                        </div>

                        {/* الصورة الحالية */}
                        <div className={styles.imageModalContent}>
                            <img
                                src={post.images[currentImageIndex]}
                                alt={`Post image ${currentImageIndex + 1}`}
                                className={styles.fullSizeImage}
                                onError={(e) => {
                                    e.currentTarget.src = '/default-image.png';
                                }}
                            />
                        </div>

                        {/* أزرار التنقل */}
                        {post.images.length > 1 && (
                            <>
                                <button
                                    className={`${styles.navButton} ${styles.prevButton}`}
                                    onClick={handlePrevImage}
                                    aria-label="Previous image"
                                >
                                    <HiChevronLeft size={30} />
                                </button>
                                <button
                                    className={`${styles.navButton} ${styles.nextButton}`}
                                    onClick={handleNextImage}
                                    aria-label="Next image"
                                >
                                    <HiChevronRight size={30} />
                                </button>
                            </>
                        )}

                        {/* الصور المصغرة في الأسفل */}
                        {post.images.length > 1 && (
                            <div className={styles.imageThumbnailsModal}>
                                {post.images.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.thumbnailModal} ${
                                            index === currentImageIndex ? styles.activeThumbnail : ''
                                        }`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={styles.thumbnailImageModal}
                                            onError={(e) => {
                                                e.currentTarget.src = '/default-image.png';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PostCommentsModal;