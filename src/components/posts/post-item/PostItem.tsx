'use client';

import { useState, useEffect } from 'react';
import PostHeader from '../post-header/PostHeader';
import PostContent from '../post-content/PostContent';
import PostImages from '../post-images/PostImages';
import UpdatePost from '../update-post/UpdatePost';
import PostCommentsModal from '../post-comments/PostCommentsModal';
import TagPostsModal from '../tag-posts-modal/TagPostsModal'; 
import { useUserData } from '@/hooks/useUserData';
import styles from './PostItem.module.css';
import LikeButton from '@/components/likes/LikeButton';
import likesService from '@/services/api/likes/likesService';
import LikesModal from '@/components/likes/LikesModal';

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
        showUserInfo?: boolean;
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
    const [showCommentsModal, setShowCommentsModal] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [currentPost, setCurrentPost] = useState(post);
    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);

    const { userData } = useUserData();
    const isCurrentUser = userData?.id === post.user.id;

    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                
                if (!userData?.id) {
                    setIsLiked(false);
                    return;
                }

                
                const likedKey = `liked_posts_user_${userData.id}`;
                const likedPosts = JSON.parse(localStorage.getItem(likedKey) || '[]');
                const isLikedLocally = likedPosts.includes(post.id);

                if (isLikedLocally) {
                    setIsLiked(true);
                    return;
                }

                
                const isLikedFromAPI = await likesService.checkUserLike(post.id);
                setIsLiked(isLikedFromAPI);

                
                if (isLikedFromAPI) {
                    if (!likedPosts.includes(post.id)) {
                        likedPosts.push(post.id);
                        localStorage.setItem(likedKey, JSON.stringify(likedPosts));
                    }
                }

            } catch (error) {
                console.error('Error checking like status:', error);
            }
        };

        checkLikeStatus();
    }, [post.id, userData?.id]);

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

    
    const extractTagsFromText = (text: string): string[] => {
        if (!text) return [];
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex);
        if (!matches) return [];
        return matches.map(tag => tag.substring(1));
    };

    
    const getUniqueTags = () => {
        const allTags = new Set<string>();
        const uniqueTags: Array<{ id: number, name: string, source: 'api' | 'text' }> = [];

        
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

        
        const textTags = extractTagsFromText(currentPost.caption);
        let textTagId = 1000;

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

    const uniqueTags = getUniqueTags();

    
    const handleTagClick = (tagName: string) => {
        setSelectedTag(tagName);
        setShowTagModal(true);
    };

    
    const handleTagModalClose = () => {
        setShowTagModal(false);
        setSelectedTag('');
    };

    const handleCommentsClick = () => {
        setShowCommentsModal(true);
    };

    const handleEditClick = () => {
        setShowUpdateModal(true);
    };

    const handleLikesModalOpen = () => {
        setIsLikesModalOpen(true);
    };

    const handleLikesModalClose = () => {
        setIsLikesModalOpen(false);
    };

    const handleCommentAdded = () => {
        setCommentsCount(prev => prev + 1);
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
        }
    };

    const handleLikeUpdate = (newCount: number, liked: boolean) => {
        setLikesCount(newCount);
        setIsLiked(liked);

        
        if (userData?.id) {
            try {
                const likedKey = `liked_posts_user_${userData.id}`;
                const likedPosts = JSON.parse(localStorage.getItem(likedKey) || '[]');

                if (liked) {
                    
                    if (!likedPosts.includes(post.id)) {
                        likedPosts.push(post.id);
                    }
                } else {
                    
                    const index = likedPosts.indexOf(post.id);
                    if (index > -1) {
                        likedPosts.splice(index, 1);
                    }
                }

                localStorage.setItem(likedKey, JSON.stringify(likedPosts));
            } catch (error) {
                console.error('Error updating localStorage:', error);
            }
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

                
                <PostContent 
                    title={currentPost.title} 
                    caption={currentPost.caption}
                    onTagClick={handleTagClick}
                />
                
                
                {uniqueTags.length > 0 && (
                    <div className={styles.tagsContainer}>
                        <div className={styles.tagsLabel}></div>
                        <div className={styles.tagsList}>
                            {uniqueTags.map(tag => (
                                <span
                                    key={`${tag.source}-${tag.id}`}
                                    className={`${styles.tag} ${tag.source === 'api' ? styles.tagApi : styles.tagText}`}
                                    onClick={() => handleTagClick(tag.name)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    #{tag.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {currentPost.images && currentPost.images.length > 0 && (
                    <PostImages
                        images={currentPost.images}
                        compact={false}
                        maxHeight={post.images.length > 2 ? 300 : 400}
                    />
                )}

                <div className={styles.postStats}>
                    <div onClick={handleLikesModalOpen} style={{ cursor: 'pointer' }}>
                        <LikeButton
                            postId={post.id}
                            initialLikesCount={likesCount}
                            isInitiallyLiked={isLiked}
                            onLikeUpdate={handleLikeUpdate}
                        />
                    </div>
                    
                    <div 
                        className={styles.statItem}
                        onClick={handleCommentsClick}
                        style={{ cursor: 'pointer' }}
                    >
                        <span className={styles.statIcon}>💬</span>
                        <span className={styles.statCount}>{commentsCount}</span>
                        <span className={styles.statLabel}>Comments</span>
                    </div>
                </div>

                <LikesModal
                    postId={post.id.toString()}
                    postTitle={post.title}
                    isOpen={isLikesModalOpen}
                    onClose={handleLikesModalClose}
                />

                <div className={styles.commentPlaceholder}>
                    <button
                        className={styles.commentButton}
                        onClick={handleCommentsClick}
                    >
                        Write a comment...
                    </button>
                </div>
            </article>

            {/* Modals */}
            {showUpdateModal && (
                <UpdatePost
                    post={currentPost}
                    onClose={() => setShowUpdateModal(false)}
                    onPostUpdated={handlePostUpdateSuccess}
                />
            )}

            {showCommentsModal && (
                <PostCommentsModal
                    post={currentPost}
                    isOpen={showCommentsModal}
                    onClose={() => setShowCommentsModal(false)}
                    onCommentAdded={handleCommentAdded}
                />
            )}

            
            {showTagModal && (
                <TagPostsModal
                    tagName={selectedTag}
                    isOpen={showTagModal}
                    onClose={handleTagModalClose}
                />
            )}
        </>
    );
};

export default PostItem;