// src/components/posts/post-item/PostItem.tsx
'use client';

import { useState, useEffect } from 'react';
import PostHeader from '../post-header/PostHeader';
import PostContent from '../post-content/PostContent';
import PostImages from '../post-images/PostImages';
import UpdatePost from '../update-post/UpdatePost';
import { useUserData } from '@/hooks/useUserData';
import styles from './PostItem.module.css';
import LikeButton from '@/components/likes/LikeButton';
import Link from 'next/link';
import likesService from '@/services/api/likes/likesService';

interface PostItemProps {
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
        likes_count: number;
        comments_count: number;
        created_at: string;
    };
    onPostDeleted?: (postId: number) => void;
    onImagesUpdated?: () => void;
    onPostUpdated?: () => void;
}

const PostItem = ({ post, onPostDeleted, onImagesUpdated, onPostUpdated }: PostItemProps) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [commentsCount, setCommentsCount] = useState(post.comments_count);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const { userData } = useUserData();
    const isCurrentUser = userData?.id === post.user.id;

    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                console.log('Checking like status for post:', post.id);
                
                // 1. جيب من localStorage أولاً (فوري)
                const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
                const isLikedLocally = likedPosts.includes(post.id);
                
                if (isLikedLocally) {
                    setIsLiked(true);
                    console.log('Found in localStorage: liked');
                    return; // خرجي، ما تحتاجي تكملي للـ API
                }
                
                // 2. إذا مش موجود في localStorage، روح جيب من API
                const isLikedFromAPI = await likesService.checkUserLike(post.id);
                console.log('From API:', isLikedFromAPI);
                setIsLiked(isLikedFromAPI);
                
                // 3. خزن في localStorage للمرة الجاية
                if (isLikedFromAPI) {
                    const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
                    if (!likedPosts.includes(post.id)) {
                        likedPosts.push(post.id);
                        localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
                    }
                }
                
            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };

        checkLikeStatus();
    }, [post.id]);

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

    const handleEditClick = () => {
        setShowUpdateModal(true);
    };

    const handlePostUpdateSuccess = () => {
        console.log('✅ Post updated, calling parent refresh...');
        setShowUpdateModal(false);

        if (onPostUpdated) {
            onPostUpdated();
        } else {
            console.warn('⚠️ onPostUpdated prop is not provided to PostItem');
        }
    };

    // دالة تحديث عدد الإعجابات
    const handleLikeUpdate = (newCount: number, liked: boolean) => {
        setLikesCount(newCount);
        setIsLiked(liked);
        
        // تحديث localStorage
        try {
            const likedPosts = JSON.parse(localStorage.getItem('liked_posts') || '[]');
            
            if (liked) {
                // أضف إذا مش موجود
                if (!likedPosts.includes(post.id)) {
                    likedPosts.push(post.id);
                }
            } else {
                // شيل إذا موجود
                const index = likedPosts.indexOf(post.id);
                if (index > -1) {
                    likedPosts.splice(index, 1);
                }
            }
            
            localStorage.setItem('liked_posts', JSON.stringify(likedPosts));
            console.log('Updated localStorage for post:', post.id, 'liked:', liked);
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    };

    return (
        <>
            <article className={styles.postContainer}>
                <PostHeader
                    user={post.user}
                    postDate={formatDate(post.created_at)}
                    postId={post.id}
                    imagesCount={post.images.length}
                    onPostDeleted={onPostDeleted}
                    onImagesUpdated={onImagesUpdated}
                    onEditPost={handleEditClick}
                />

                <PostContent
                    title={post.title}
                    caption={post.caption}
                />

                {post.images && post.images.length > 0 && (
                    <PostImages
                        images={post.images}
                        compact={false}
                        maxHeight={post.images.length > 2 ? 300 : 400}
                    />
                )}

                <div className={styles.postStats}>
                    {/* زر الإعجاب */}
                    <LikeButton
                        postId={post.id}
                        initialLikesCount={likesCount}
                        isInitiallyLiked={isLiked}
                        onLikeUpdate={handleLikeUpdate}
                    />

                    {/* قسم التعليقات */}
                    <Link 
                        href={`/post/${post.id}`} 
                        className={styles.statItem}
                    >
                        <span className={styles.statIcon}>💬</span>
                        <span className={styles.statCount}>{commentsCount}</span>
                        <span className={styles.statLabel}>Comments</span>
                    </Link>

                    {/* قسم المشاركة */}
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>↪️</span>
                        <span className={styles.statCount}>0</span>
                        <span className={styles.statLabel}>Share</span>
                    </div>
                </div>

                <div className={styles.commentPlaceholder}>
                    <button className={styles.commentButton}>
                        Write a comment...
                    </button>
                </div>
            </article>

            {showUpdateModal && (
                <UpdatePost
                    post={post}
                    onClose={() => setShowUpdateModal(false)}
                    onPostUpdated={handlePostUpdateSuccess}
                />
            )}
        </>
    );
};

export default PostItem;