'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosts, getUserPosts, searchPosts, getPost, getPostsByTagId, Post } from '@/services/api/posts/getPost';

interface UsePostsOptions {
    initialPage?: number;
    limit?: number;
    initialPosts?: Post[];
    singlePostMode?: boolean;
    postId?: number;
    userId?: number;
    searchKeyword?: string;
    tagName?: string;
    tagId?: number;
    hideInfiniteScroll?: boolean;
}

interface UsePostsReturn {
    posts: Post[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refreshPosts: () => void;
    setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
    const {
        initialPage = 1,
        limit = 10,
        initialPosts = [],
        singlePostMode = false,
        postId,
        userId,
        searchKeyword,
        tagName,
        tagId,
        hideInfiniteScroll = false
    } = options;

    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [loading, setLoading] = useState(!initialPosts.length);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(false);

    const fetchPosts = useCallback(async (page: number, isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            if (singlePostMode && postId) {                
                const response = await getPost(postId);
                
                if (response.success && response.data) {
                    console.log('✅ [usePosts] Single post loaded');
                    setPosts([response.data]);
                } else {
                    setError(response.message || 'Post not found');
                    setPosts([]);
                }
                setHasMore(false);
                return;
            }

            
            if (tagId) {                
                const response = await getPostsByTagId(tagId, page, limit);
                
                console.log('🔍 [usePosts] Tag response:', {
                    success: response.success,
                    hasData: !!response.data,
                    dataLength: response.data?.data?.length || 0,
                    message: response.message
                });
                
                if (response.success && response.data) {
                    const postsData = response.data.data || [];
                    
                    if (isLoadMore) {
                        setPosts(prev => [...prev, ...postsData]);
                    } else {
                        setPosts(postsData);
                    }
                    
                    setHasMore(response.data.current_page < response.data.last_page);
                } else {
                    console.error(`❌ [usePosts] Failed to fetch tag posts: ${response.message}`);
                    setError(response.message || 'Failed to fetch tag posts');
                }
                return;
            }

            if (userId) {                
                const response = await getUserPosts(userId, page, limit);
                
                if (response.success && response.data) {
                    const postsData = response.data.data || [];
                    
                    if (isLoadMore) {
                        setPosts(prev => [...prev, ...postsData]);
                    } else {
                        setPosts(postsData);
                    }
                    
                    setHasMore(response.data.current_page < response.data.last_page);
                } else {
                    setError(response.message || 'Failed to fetch user posts');
                }
                return;
            }

            if (searchKeyword) {
                
                const response = await searchPosts(searchKeyword, page, limit);
                
                if (response.success && response.data) {
                    const postsData = response.data.data || [];
                    
                    if (isLoadMore) {
                        setPosts(prev => [...prev, ...postsData]);
                    } else {
                        setPosts(postsData);
                    }
                    
                    setHasMore(response.data.current_page < response.data.last_page);
                } else {
                    setError(response.message || 'Search failed');
                }
                return;
            }

            if (tagName) {
                
                const response = await searchPosts(`#${tagName}`, page, limit);
                
                if (response.success && response.data) {
                    const postsData = response.data.data || [];
                    
                    if (isLoadMore) {
                        setPosts(prev => [...prev, ...postsData]);
                    } else {
                        setPosts(postsData);
                    }
                    
                    setHasMore(response.data.current_page < response.data.last_page);
                } else {
                    setError(response.message || 'Failed to fetch tag posts');
                }
                return;
            }            
            const response = await getPosts(page, limit);
            
            if (response.success && response.data) {
                const postsData = response.data.data || [];
                
                if (isLoadMore) {
                    setPosts(prev => [...prev, ...postsData]);
                } else {
                    setPosts(postsData);
                }
                
                setHasMore(response.data.current_page < response.data.last_page);
            } else {
                setError(response.message || 'Failed to fetch posts');
            }
            
        } catch (err: any) {
            console.error('🔥 [usePosts] Error in fetchPosts:', err);
            setError(err.message || 'A connection error occurred');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [limit, singlePostMode, postId, userId, searchKeyword, tagName, tagId]);

    useEffect(() => {
        if (initialPosts.length > 0 && !tagId && !tagName && !searchKeyword && !userId && !postId) {
            setPosts(initialPosts);
            setLoading(false);
            setHasMore(false);
        } else {
            fetchPosts(1, false);
        }
    }, [initialPosts.length, tagId, tagName, searchKeyword, userId, postId, fetchPosts]);

    const loadMore = () => {
        if (hasMore && !loading && !hideInfiniteScroll) {
            console.log('⬇️ [usePosts] Loading more posts...');
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchPosts(nextPage, true);
        }
    };

    const refreshPosts = () => {
        setCurrentPage(1);
        fetchPosts(1, false);
    };

    return {
        posts,
        loading,
        error,
        hasMore,
        loadMore,
        refreshPosts,
        setPosts,
    };
};