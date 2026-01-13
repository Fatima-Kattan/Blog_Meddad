// hooks/use-posts.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPosts, Post, PostsResponse } from '@/services/api/posts/get-posts';

interface UsePostsReturn {
    posts: Post[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refreshPosts: () => void;
}

export const usePosts = (initialPage = 1, limit = 10): UsePostsReturn => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);

    const fetchPosts = useCallback(async (page: number, isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            const response: PostsResponse = await getPosts(page, limit);

            if (response.success) {
                // الـ Laravel يعيد البيانات في response.data.data
                const postsData = response.data.data || [];
                
                if (isLoadMore) {
                    setPosts(prev => [...prev, ...postsData]);
                } else {
                    setPosts(postsData);
                }
                
                // تحقق إذا في صفحات أكثر
                setHasMore(response.data.current_page < response.data.last_page);
            } else {
                setError(response.message || 'فشل في جلب المنشورات');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ في الاتصال');
        } finally {
            setLoading(false);
        }
    }, [limit]);

    useEffect(() => {
        fetchPosts(currentPage, false);
    }, [fetchPosts]);

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