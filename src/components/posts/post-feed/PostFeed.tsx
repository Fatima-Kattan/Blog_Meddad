'use client';

import { useState, useEffect, useRef } from 'react';
import { usePosts } from '@/hooks/use-posts';
import PostItem from '../post-item/PostItem';
import LoadingIcon from '@/components/shared/LoadingIcon/LoadingIcon'; // ✅ استيراد LoadingIcon
import styles from './PostFeed.module.css';

const PostFeed = (props: any) => {
    const {
        initialPosts = [],
        singlePostMode = false,
        postId,
        userId,
        hideInfiniteScroll = false,
        showLoadingOnly = false,
        searchKeyword,
        tagName,
        tagId,
        isSearchResults = false
    } = props;
    
    // 👇 نستخدم usePosts للبيانات العادية
    const { 
        posts: fetchedPosts, 
        loading: postsLoading, 
        error: postsError, 
        hasMore, 
        loadMore, 
        refreshPosts 
    } = usePosts({
        initialPosts: isSearchResults ? [] : initialPosts,
        singlePostMode,
        postId,
        userId,
        searchKeyword: isSearchResults ? undefined : searchKeyword,
        tagName,
        tagId, // 👈 مرر tagId هنا
        hideInfiniteScroll
    });

    // 👇 state للبيانات في حالة نتائج البحث
    const [searchPosts, setSearchPosts] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (isSearchResults) {
            // 👇 لنتائج البحث، نستخدم initialPosts مباشرة
            setSearchLoading(true);
            const formattedPosts = initialPosts.map(post => ({
                ...post,
                id: post.id || 0,
                title: post.title || '',
                caption: post.caption || '',
                content: post.caption || '',
                user: post.user || {
                    id: 0,
                    full_name: 'Unknown User',
                    image: null
                },
                tags: post.tags || [],
                created_at: post.created_at || new Date().toISOString(),
                likes_count: post.likes_count || post._count?.likes || 0,
                comments_count: post.comments_count || post._count?.comments || 0,
                likes: post.likes || [],
                comments: post.comments || [],
                images: post.images || [],
                _count: {
                    likes: post.likes_count || post._count?.likes || 0,
                    comments: post.likes_count || post._count?.comments || 0
                }
            }));
            setSearchPosts(formattedPosts);
            setSearchLoading(false);
        }
    }, [initialPosts, isSearchResults]);

    // 👇 تحديد أي posts نعرض
    const postsToDisplay = isSearchResults ? searchPosts : fetchedPosts;
    const loading = isSearchResults ? searchLoading : postsLoading;
    const error = isSearchResults ? null : postsError;

    // 🔧 **تصفية البوستات الناقصة**
    const validPosts = postsToDisplay.filter(post => {
        // تأكد من وجود post ووجود id
        if (!post || typeof post !== 'object') {
            console.warn('⚠️ Invalid post object:', post);
            return false;
        }
        
        const hasId = post.id !== undefined && post.id !== null;
        const hasUser = post.user && typeof post.user === 'object';
        
        if (!hasId) {
            console.warn('⚠️ Post missing id:', post);
            return false;
        }
        
        return true;
    });
    const observerRef = useRef<HTMLDivElement>(null);

    // Auto infinite scroll - للبيانات العادية فقط
    useEffect(() => {
        if (isSearchResults || hideInfiniteScroll || singlePostMode || userId || searchKeyword || tagName || tagId) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !postsLoading) {
                    console.log('⬇️ Loading more via scroll...');
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, postsLoading, loadMore, isSearchResults, hideInfiniteScroll, singlePostMode, userId, searchKeyword, tagName, tagId]);

    const handlePostDeleted = (deletedPostId: number) => {
        console.log('🗑️ Post deleted, refreshing...');
        if (isSearchResults) {
            setSearchPosts(prev => prev.filter(post => post.id !== deletedPostId));
        } else {
            refreshPosts();
        }
    };

    const handleImagesUpdated = () => {
        if (!isSearchResults) {
            refreshPosts();
        }
    };

    const handlePostUpdated = () => {
        if (!isSearchResults) {
            refreshPosts();
        }
    };

    // ✅ استخدام LoadingIcon لـ showLoadingOnly
    if (showLoadingOnly) {
        return (
            <div style={{
                textAlign: 'center', 
                padding: '200px 20px',
            }}>
                <LoadingIcon 
                    message="Loading post..."
                    size={50}
                    position="relative"
                    
                />
            </div>
        );
    }

    if (error) {
        console.error('❌ PostFeed error:', error);
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    onClick={refreshPosts}
                    className={styles.retryButton}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={`${styles.feedContainer} ${singlePostMode ? styles.singlePostMode : ''}`}>
            {validPosts.length === 0 && !loading ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyMessage}>
                        {tagId ? `No posts with tag ID: ${tagId}` :
                         tagName ? `No posts with #${tagName}` :
                         isSearchResults && searchKeyword ? `No posts found for "${searchKeyword}"` : 
                         singlePostMode ? 'Post not found' : 
                         userId ? 'No posts yet' : 
                         searchKeyword ? `No results for "${searchKeyword}"` :
                         'No posts to display'}
                    </p>
                    {postsToDisplay.length > 0 && validPosts.length === 0 && (
                        <p className={styles.emptySubtitle}>
                            ⚠️ Found {postsToDisplay.length} posts but none have valid data
                        </p>
                    )}
                    {!singlePostMode && !userId && !searchKeyword && !tagName && !tagId && !isSearchResults && (
                        <p className={styles.emptySubtitle}>Be the first to post!</p>
                    )}
                </div>
            ) : (
                <>
                    {
                        validPosts.map((post: any) => {
                            // 🔧 **أضف فحص إضافي قبل الـ render**
                            if (!post || !post.id) {
                                console.error('❌ Invalid post in map:', post);
                                return null;
                            }

                            // 🔧 **تأكد من وجود user object**
                            const safePost = {
                                ...post,
                                user: post.user || {
                                    id: 0,
                                    full_name: 'Unknown User',
                                    image: null
                                },
                                tags: post.tags || [],
                                images: post.images || [],
                                likes_count: post.likes_count || 0,
                                comments_count: post.comments_count || 0
                            };

                            return (
                                <PostItem
                                    key={safePost.id}
                                    post={safePost}
                                    onPostDeleted={handlePostDeleted}
                                    onImagesUpdated={handleImagesUpdated}
                                    onPostUpdated={handlePostUpdated}
                                />
                            );
                        })
                    }

                    
                    {loading && (
                        <div style={{
                            textAlign: 'center', 
                            padding: '200px 20px',
                        }}>
                            <LoadingIcon 
                                message={singlePostMode ? 'Loading post...' : 'Loading posts...'}
                                size={40}
                                position="relative"
                                
                            />
                        </div>
                    )}

                    {/* 👇 Load More للبيانات العادية فقط */}
                    {!isSearchResults && !tagId && hasMore && !loading && !hideInfiniteScroll && !singlePostMode && !userId && !searchKeyword && !tagName && (
                        <div ref={observerRef} className={styles.loadMoreTrigger}>
                            <button
                                onClick={loadMore}
                                className={styles.loadMoreButton}
                            >
                                Load More
                            </button>
                        </div>
                    )}

                    {!isSearchResults && !tagId && !hasMore && validPosts.length > 0 && !singlePostMode && !hideInfiniteScroll && !userId && !searchKeyword && !tagName && (
                        <div className={styles.endMessage}>
                            <p>You've reached the end of posts</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PostFeed;