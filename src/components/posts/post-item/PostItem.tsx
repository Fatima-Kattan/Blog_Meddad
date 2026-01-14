// src/components/posts/post-item/PostItem.tsx
'use client';

import { useState } from 'react';
import PostHeader from '../post-header/PostHeader';
import PostContent from '../post-content/PostContent';
import PostImages from '../post-images/PostImages';
import UpdatePost from '../update-post/UpdatePost';
import { useUserData } from '@/hooks/useUserData';
import styles from './PostItem.module.css';

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

    const handleLike = () => {
        if (isLiked) {
            setLikesCount(prev => prev - 1);
        } else {
            setLikesCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
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
                    <div className={styles.statItem} onClick={handleLike}>
                        <span className={styles.statIcon}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                        <span className={styles.statCount}>{likesCount}</span>
                        <span className={styles.statLabel}>Likes</span>
                    </div>

                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>💬</span>
                        <span className={styles.statCount}>{commentsCount}</span>
                        <span className={styles.statLabel}>Comments</span>
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