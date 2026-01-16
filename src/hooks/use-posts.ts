// hooks/use-posts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosts, Post, PostsResponse } from '@/services/api/posts/get-posts';
import { getUserPosts, UserPostsResponse } from '@/services/api/posts/get-user-posts';

interface UsePostsReturn {
    posts: Post[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refreshPosts: () => void;
}

export const usePosts = (initialPage = 1, limit = 10, userId?: number): UsePostsReturn => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (page: number, isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            console.log('🎯 usePosts - userId:', userId);
            
            let response: PostsResponse | UserPostsResponse;
            
            if (userId) {
                console.log(`📡 جلب بوستات المستخدم ${userId}`);
                response = await getUserPosts(userId, page, limit);
            } else {
                console.log(`📡 جلب كل البوستات`);
                response = await getPosts(page, limit);
            }

            if (response.success) {
                const postsData = response.data.data || [];
                console.log(`✅ تم جلب ${postsData.length} بوست`);
                
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
            console.error('❌ خطأ في جلب البوستات:', err);
            setError(err.message || 'A connection error occurred');
        } finally {
            setLoading(false);
        }
    }, [limit, userId]);

    useEffect(() => {
        fetchPosts(currentPage, false);
    }, [fetchPosts, currentPage]);

    const loadMore = () => {
        if (hasMore && !loading) {
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
    };
};