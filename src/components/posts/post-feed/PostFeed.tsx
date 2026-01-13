// src/components/posts/post-feed/PostFeed.tsx
'use client';

import { usePosts } from '@/hooks/use-posts';
import PostItem from '../post-item/PostItem';
import styles from './PostFeed.module.css';
import { useEffect, useRef } from 'react';

const PostFeed = () => {
    const { posts, loading, error, hasMore, loadMore, refreshPosts } = usePosts();
    const observerRef = useRef<HTMLDivElement>(null);

    // Auto infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loading, loadMore]);

    const handlePostDeleted = (deletedPostId: number) => {
        refreshPosts();
    };
    
    const handleImagesUpdated = () => {
        refreshPosts();
    };

    // ✅ أضف هذه الدالة
    const handlePostUpdated = () => {
        console.log('🔄 Post updated, refreshing feed...');
        refreshPosts();
    };

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorMessage}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className={styles.retryButton}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className={styles.feedContainer}>
            {posts.length === 0 && !loading ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyMessage}>No posts to display</p>
                    <p className={styles.emptySubtitle}>Be the first to post!</p>
                </div>
            ) : (
                <>
                    {/* ✅ تأكد من أن posts هو array */}
                    {Array.isArray(posts) && posts.map((post) => (
                        <PostItem 
                            key={post.id} 
                            post={post}
                            onPostDeleted={handlePostDeleted}
                            onImagesUpdated={handleImagesUpdated}
                            onPostUpdated={handlePostUpdated} // ✅ أضف هذا
                        />
                    ))}

                    {/* Loading indicator */}
                    {loading && (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Loading posts...</p>
                        </div>
                    )}

                    {/* Load more trigger */}
                    {hasMore && !loading && (
                        <div ref={observerRef} className={styles.loadMoreTrigger}>
                            <button
                                onClick={loadMore}
                                className={styles.loadMoreButton}
                            >
                                Load More
                            </button>
                        </div>
                    )}

                    {/* End of feed message */}
                    {!hasMore && posts.length > 0 && (
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