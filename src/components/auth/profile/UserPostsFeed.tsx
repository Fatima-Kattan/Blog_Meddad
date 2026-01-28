// components/profile/UserPostsFeed.tsx
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import PostItem from '@/components/posts/post-item/PostItem';
import axios from 'axios';

// تعريف الأنواع (Interfaces)
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

export interface UserPostsResponse {
    success: boolean;
    data: {
        user: {
            id: number;
            full_name: string;
            image: string;
            bio: string;
            created_at: string;
        };
        posts: {
            current_page: number;
            data: ApiPost[];
            total: number;
            last_page: number;
        };
        stats: {
            total_posts: number;
            total_likes: number;
            total_comments: number;
        };
    };
    message: string;
}

interface UserPostsFeedProps {
    userId: string | number;
    isOwnProfile?: boolean;
    onPostDeleted?: (deletedPostId: number) => void;
    onImagesUpdated?: () => void;
    onPostUpdated?: () => void;
}

const UserPostsFeed: React.FC<UserPostsFeedProps> = ({
    userId,
    isOwnProfile = false,
    onPostDeleted,
    onImagesUpdated,
    onPostUpdated
}) => {
    // States
    const [userPosts, setUserPosts] = useState<ApiPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement>(null);

    // Fetch posts function
    const fetchUserPosts = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        if (!userId) {
            setPostsError('No user ID provided');
            setPostsLoading(false);
            return;
        }

        try {
            setPostsLoading(true);
            const response = await axios.get<UserPostsResponse>(
                `http://localhost:8000/api/v1/user/${userId}/posts`,
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
                
                if (isRefresh) {
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
        }
    }, [userId]);

    // Load more function
    const loadMore = () => {
        if (!postsLoading && hasMore) {
            fetchUserPosts(page, false);
        }
    };

    // Refresh function
    const refreshUserPosts = useCallback(() => {
        setPage(1);
        setHasMore(true);
        fetchUserPosts(1, true);
    }, [fetchUserPosts]);

    // Event handlers
    const handlePostDeleted = (deletedPostId: number) => {
        setUserPosts(prev => prev.filter(post => post.id !== deletedPostId));
        if (onPostDeleted) {
            onPostDeleted(deletedPostId);
        }
    };

    const handleImagesUpdated = () => {
        refreshUserPosts();
        if (onImagesUpdated) {
            onImagesUpdated();
        }
    };

    const handlePostUpdated = () => {
        refreshUserPosts();
        if (onPostUpdated) {
            onPostUpdated();
        }
    };

    // Initial fetch
    useEffect(() => {
        if (userId) {
            fetchUserPosts(1, true);
        }
    }, [userId, fetchUserPosts]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !postsLoading) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, postsLoading]);

    const styles = {
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
            cursor: 'pointer'
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
            background: '#edf2f7',
            color: '#2d3748',
            border: '1px solid #cbd5e0',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '200' as const,
            transition: 'all 0.2s'
        },
        endMessage: {
            textAlign: 'center' as const,
            padding: '2rem',
            color: '#718096',
            fontStyle: 'italic' as const
        }
    };

    return (
        <div className="recent-activity">
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
                    {userPosts.length === 0 && !postsLoading ? (
                        <div style={styles.emptyState}>
                            <p style={styles.emptyText}>
                                There are no posts yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            {userPosts.map((post) => (
                                <PostItem 
                                    key={post.id} 
                                    post={post}
                                    onPostDeleted={handlePostDeleted}
                                    onImagesUpdated={handleImagesUpdated}
                                    onPostUpdated={handlePostUpdated}
                                />
                            ))}

                            {postsLoading && (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div style={styles.loadingSpinner}></div>
                                    <p>Loading user's posts...</p>
                                </div>
                            )}

                            {hasMore && !postsLoading && (
                                <div ref={observerRef} style={{ textAlign: 'center', padding: '1rem' }}>
                                    <button
                                        onClick={loadMore}
                                        style={styles.loadMoreButton}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = '#e2e8f0';
                                            e.currentTarget.style.borderColor = '#a0aec0';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = '#edf2f7';
                                            e.currentTarget.style.borderColor = '#cbd5e0';
                                        }}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}

                            {!hasMore && userPosts.length > 0 && (
                                <div style={styles.endMessage}>
                                    <p>
                                        {isOwnProfile 
                                            ? "You've seen all your posts" 
                                            : "You've seen all of this user's posts"
                                        }
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default UserPostsFeed;