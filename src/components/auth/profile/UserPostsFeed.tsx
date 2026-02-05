// components/profile/UserPostsFeed.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from '@/components/posts/post-item/PostItem';
import axios from 'axios';

// Define types
export interface ApiPost {
    id: number;
    user_id: number;
    title: string;
    caption: string;
    images: string[];
    created_at: string;
    likes_count: number;
    comments_count: number;
    user: {
        id: number;
        full_name: string;
        image: string;
    };
    likes: any[];
    comments: any[];
    tags: any[];
}

interface UserPostsFeedProps {
    userId: string | number;
    isOwnProfile?: boolean;
    posts?: ApiPost[]; // ⭐ Initial external data
    externalPagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    useExternalData?: boolean;
    filter?: string;
    sort?: string;
    onPostDeleted?: (deletedPostId: number) => void;
    onImagesUpdated?: () => void;
    onPostUpdated?: () => void;
    onRefreshNeeded?: () => void;
    onLoadMore?: () => Promise<void>; // ⭐ New function to load more external data
    hasMoreExternal?: boolean; // ⭐ Know if there is more in external data
    loadingExternal?: boolean; // ⭐ Loading state for external data
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({
    userId,
    isOwnProfile = false,
    posts = [],
    externalPagination,
    useExternalData = false,
    filter = 'all',
    sort = 'newest',
    onPostDeleted,
    onImagesUpdated,
    onPostUpdated,
    onRefreshNeeded,
    onLoadMore, // ⭐ New prop
    hasMoreExternal = false, // ⭐ Default value
    loadingExternal = false // ⭐ Default value
}) => {
    // States
    const [userPosts, setUserPosts] = useState<ApiPost[]>(useExternalData ? posts : []);
    const [postsLoading, setPostsLoading] = useState(!useExternalData);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(!useExternalData);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    // ⭐ Fetch function for normal profile
    const fetchUserPosts = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        if (!userId || useExternalData) return;

        try {
            setPostsLoading(pageNum === 1);
            setLoadingMore(pageNum > 1);
            
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/user/${userId}/posts`,
                {
                    params: { page: pageNum },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const newPosts = response.data.data.posts.data;
                
                if (isRefresh || pageNum === 1) {
                    setUserPosts(newPosts);
                } else {
                    setUserPosts(prev => [...prev, ...newPosts]);
                }
                
                setHasMore(pageNum < response.data.data.posts.last_page);
                setPage(pageNum + 1);
                setPostsError(null);
            } else {
                setPostsError(response.data.message || 'Failed to fetch user posts');
            }
        } catch (err: any) {
            setPostsError(err.response?.data?.message || 'Error fetching user posts');
            console.error('Error fetching user posts:', err);
        } finally {
            setPostsLoading(false);
            setLoadingMore(false);
        }
    }, [userId, useExternalData]);

    // ⭐ Update posts when external props change
    useEffect(() => {
        if (useExternalData) {
            console.log('External posts updated:', posts);
            setUserPosts(posts);
            setPostsLoading(false);
            setPostsError(null);
            // ⭐ Don't change hasMore here, use hasMoreExternal
        }
    }, [posts, useExternalData]);

    // Event handlers
    const handlePostDeleted = (deletedPostId: number) => {
        setUserPosts(prev => prev.filter(post => post.id !== deletedPostId));
        if (onPostDeleted) {
            onPostDeleted(deletedPostId);
        }
        if (onRefreshNeeded) {
            onRefreshNeeded();
        }
    };

    const handleImagesUpdated = () => {
        if (!useExternalData) {
            fetchUserPosts(1, true);
        } else if (onRefreshNeeded) {
            onRefreshNeeded();
        }
        
        if (onImagesUpdated) {
            onImagesUpdated();
        }
    };

    const handlePostUpdated = () => {
        if (!useExternalData) {
            fetchUserPosts(1, true);
        } else if (onRefreshNeeded) {
            onRefreshNeeded();
        }
        
        if (onPostUpdated) {
            onPostUpdated();
        }
    };

    // ⭐ Load more function for external data
    const loadMoreExternal = async () => {
        if (!onLoadMore || loadingExternal || !hasMoreExternal) return;
        
        try {
            await onLoadMore();
        } catch (error) {
            console.error('Error loading more external posts:', error);
        }
    };

    // ⭐ General load more function
    const loadMore = async () => {
        if (useExternalData) {
            await loadMoreExternal();
        } else if (!postsLoading && hasMore) {
            fetchUserPosts(page, false);
        }
    };

    // Initial fetch - for profile only
    useEffect(() => {
        if (userId && !useExternalData) {
            fetchUserPosts(1, true);
        }
    }, [userId, useExternalData]);

    // Infinite scroll observer - works for both cases
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    // ⭐ Check appropriate state
                    if (useExternalData) {
                        if (hasMoreExternal && !loadingExternal && !loadingMore) {
                            console.log('⬇️ Loading more external posts...');
                            loadMore();
                        }
                    } else {
                        if (hasMore && !postsLoading && !loadingMore) {
                            console.log('⬇️ Loading more internal posts...');
                            loadMore();
                        }
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, postsLoading, loadingMore, useExternalData, hasMoreExternal, loadingExternal]);

    const refreshUserPosts = useCallback(() => {
        if (!useExternalData) {
            setPage(1);
            setHasMore(true);
            fetchUserPosts(1, true);
        } else if (onRefreshNeeded) {
            onRefreshNeeded();
        }
    }, [fetchUserPosts, useExternalData, onRefreshNeeded]);

    // ⭐ Determine active loading state
    const isLoading = useExternalData ? loadingExternal : postsLoading || loadingMore;
    const canLoadMore = useExternalData ? hasMoreExternal : hasMore;
    const showLoadMoreButton = canLoadMore && !isLoading;
    const showEndMessage = !canLoadMore && userPosts.length > 0;

    // Styles
    const styles = {
        feedContainer: {
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto'
        },
        errorContainer: {
            textAlign: 'center' as const,
            padding: '2rem',
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: '8px',
            marginBottom: '1rem'
        },
        errorText: {
            color: '#e53e3e',
            marginBottom: '1rem'
        },
        retryButton: {
            background: '#3182ce',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600' as const
        },
        emptyState: {
            textAlign: 'center' as const,
            padding: '3rem 1rem',
            background: '#341c53',
            borderRadius: '12px',
            border: '1px solid #7c3aed'
        },
        emptyText: {
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#ffffffff',
            marginBottom: '0.5rem'
        },
        loadingSpinner: {
            width: '40px',
            height: '40px',
            border: '3px solid #0c0d0dff',
            borderTop: '3px solid #7409c6ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
        },
        loadMoreButton: {
            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600' as const,
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            margin: '1rem auto',
            display: 'block'
        },
        loadMoreTrigger: {
            textAlign: 'center' as const,
            padding: '2rem'
        },
        endMessage: {
            textAlign: 'center' as const,
            padding: '2rem',
            color: '#718096',
            fontStyle: 'italic' as const,
            borderTop: '1px solid #e2e8f0',
            marginTop: '1rem'
        },
        paginationInfo: {
            textAlign: 'center' as const,
            padding: '1rem',
            color: '#666',
            fontSize: '0.9rem',
            background: '#f7fafc',
            borderRadius: '8px',
            marginBottom: '1rem'
        }
    };

    return (
        <div style={styles.feedContainer}>
            {postsError ? (
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{postsError}</p>
                    <button
                        onClick={refreshUserPosts}
                        style={styles.retryButton}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <>
                    {userPosts.length === 0 && !isLoading ? (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyText}>
                                There are no posts yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Posts list */}
                            {userPosts.map((post) => (
                                <PostItem 
                                    key={post.id} 
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                    onImagesUpdated={handleImagesUpdated}
                                    onPostUpdated={handlePostUpdated}
                                />
                            ))}

                            {/* Loading state */}
                            {isLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={styles.loadingSpinner}></div>
                                    <p>
                                        {useExternalData 
                                            ? "Loading more posts..." 
                                            : "Loading user's posts..."
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Load More button for Intersection Observer */}
                            {showLoadMoreButton && (
                                <div ref={observerRef} style={styles.loadMoreTrigger}>
                                    <button
                                        onClick={loadMore}
                                        style={styles.loadMoreButton}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.3)';
                                        }}
                                    >
                                        Load More Posts
                                    </button>
                                </div>
                            )}

                            {/* End message */}
                            {showEndMessage && (
                                <div style={styles.endMessage}>
                                    <p>
                                        {isOwnProfile 
                                            ? "✨ You've reached the end of your posts" 
                                            : "✨ You've seen all of this user's posts"
                                        }
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <style >{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UserPostsFeed;