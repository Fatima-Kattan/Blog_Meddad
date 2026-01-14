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
        tags?: Array<{
            id: number;
            tag_name: string;
        }>;
    };
    onPostDeleted?: (postId: number) => void;
    onImagesUpdated?: () => void;
    onPostUpdated?: (updatedPost?: any) => void;
}

const PostItem = ({ post, onPostDeleted, onImagesUpdated, onPostUpdated }: PostItemProps) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes_count);
    const [commentsCount, setCommentsCount] = useState(post.comments_count);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);

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

    // ⭐ دالة لتمييز التاغات داخل النص
    const highlightHashtagsInText = (text: string) => {
        if (!text) return '';
        return text.replace(
            /#(\w+)/g, 
            '<span class="hashtag-inline">#$1</span>'
        );
    };

    // ⭐ دالة لاستخراج التاغات من النص
    const extractTagsFromText = (text: string): string[] => {
        if (!text) return [];
        
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex);
        
        if (!matches) return [];
        
        // إزالة علامة # والحصول على اسم التاغ فقط
        return matches.map(tag => tag.substring(1));
    };

    // ⭐ دالة لاستخراج التاغات الفريدة (من API أو النص)
    const getUniqueTags = () => {
        const allTags = new Set<string>();
        const uniqueTags: Array<{id: number, name: string, source: 'api' | 'text'}> = [];

        // جمع التاغات من API أولاً
        if (currentPost.tags && currentPost.tags.length > 0) {
            currentPost.tags.forEach(tag => {
                if (!allTags.has(tag.tag_name.toLowerCase())) {
                    allTags.add(tag.tag_name.toLowerCase());
                    uniqueTags.push({
                        id: tag.id,
                        name: tag.tag_name,
                        source: 'api'
                    });
                }
            });
        }

        // جمع التاغات من النص (تجاهل المكررة)
        const textTags = extractTagsFromText(currentPost.caption);
        let textTagId = 1000; // ID مؤقت للتاغات من النص
        
        textTags.forEach(tag => {
            if (!allTags.has(tag.toLowerCase())) {
                allTags.add(tag.toLowerCase());
                uniqueTags.push({
                    id: textTagId++,
                    name: tag,
                    source: 'text'
                });
            }
        });

        return uniqueTags;
    };

    const highlightedCaption = highlightHashtagsInText(currentPost.caption);
    const uniqueTags = getUniqueTags();

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

    const handlePostUpdateSuccess = (updatedPost?: any) => {
        console.log('✅ Post updated successfully:', updatedPost);
        setShowUpdateModal(false);

        if (updatedPost) {
            setCurrentPost(prev => ({
                ...prev,
                title: updatedPost.title || prev.title,
                caption: updatedPost.caption || prev.caption,
                images: updatedPost.images || prev.images,
                tags: updatedPost.tags || prev.tags,
                likes_count: updatedPost.likes_count || prev.likes_count,
                comments_count: updatedPost.comments_count || prev.comments_count,
                updated_at: updatedPost.updated_at || prev.created_at
            }));

            if (updatedPost.likes_count !== undefined) {
                setLikesCount(updatedPost.likes_count);
            }
            if (updatedPost.comments_count !== undefined) {
                setCommentsCount(updatedPost.comments_count);
            }
        }

        if (onPostUpdated) {
            onPostUpdated(updatedPost);
        } else {
            console.warn('⚠️ onPostUpdated prop is not provided to PostItem');
        }
    };

    return (
        <>
            <article className={styles.postContainer}>
                <PostHeader
                    user={currentPost.user}
                    postDate={formatDate(currentPost.created_at)}
                    postId={currentPost.id}
                    imagesCount={currentPost.images.length}
                    onPostDeleted={onPostDeleted}
                    onImagesUpdated={onImagesUpdated}
                    onEditPost={handleEditClick}
                />

                <div className={styles.postContent}>
                    <h2 className={styles.postTitle}>{currentPost.title}</h2>

                    {/* ⭐ عرض النص مع التاغات ملوّنة */}
                    {currentPost.caption && (
                        <div className={styles.captionContainer}>
                            <p 
                                className={styles.postCaption}
                                dangerouslySetInnerHTML={{ __html: highlightedCaption }}
                            />
                        </div>
                    )}

                    {/* ⭐ قسم التاغات تحت النص */}
                    {uniqueTags.length > 0 && (
                        <div className={styles.tagsContainer}>
                            <div className={styles.tagsLabel}></div>
                            <div className={styles.tagsList}>
                                {uniqueTags.map(tag => (
                                    <span 
                                        key={`${tag.source}-${tag.id}`} 
                                        className={`${styles.tag} ${tag.source === 'api' ? styles.tagApi : styles.tagText}`}
                                    >
                                        #{tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {currentPost.images && currentPost.images.length > 0 && (
                    <PostImages
                        images={currentPost.images}
                        compact={false}
                        maxHeight={currentPost.images.length > 2 ? 300 : 400}
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
                    post={currentPost}
                    onClose={() => setShowUpdateModal(false)}
                    onPostUpdated={handlePostUpdateSuccess}
                />
            )}
        </>
    );
};

export default PostItem;