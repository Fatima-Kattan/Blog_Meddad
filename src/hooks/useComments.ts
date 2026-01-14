'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getPostComments,
    createComment,
    updateComment,
    deleteComment,
    getCommentsCount,
    Comment,
    CreateCommentData,
    UpdateCommentData
} from '@/services/api/comments';

interface UseCommentsReturn {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    totalComments: number;
    commentsCount: number;
    createNewComment: (data: CreateCommentData) => Promise<Comment | null>;
    updateExistingComment: (id: number, data: UpdateCommentData) => Promise<Comment | null>;
    deleteExistingComment: (id: number) => Promise<boolean>;
    loadMoreComments: () => void;
    refreshComments: () => void;
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export const useComments = (
    postId: number | string,
    initialPage = 1,
    limit = 10
): UseCommentsReturn => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [hasMore, setHasMore] = useState(true);
    const [totalComments, setTotalComments] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    // جلب تعليقات المنشور
    const fetchComments = useCallback(async (page: number, isLoadMore = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await getPostComments(postId, page, limit);

            if (response.success) {
                const commentsData = response.data.data || [];

                if (isLoadMore) {
                    setComments(prev => [...prev, ...commentsData]);
                } else {
                    setComments(commentsData);
                }

                setHasMore(response.data.current_page < response.data.last_page);
                setTotalComments(response.data.total);
            } else {
                setError(response.message || 'Failed to fetch comments');
            }
        } catch (err: any) {
            setError(err.message || 'A connection error occurred');
        } finally {
            setLoading(false);
        }
    }, [postId, limit]);

    // جلب عدد التعليقات
    const fetchCommentsCount = useCallback(async () => {
        try {
            const response = await getCommentsCount(postId);
            if (response.success) {
                setCommentsCount(response.data.comments_count);
            }
        } catch (err) {
            console.error('Error fetching comments count:', err);
        }
    }, [postId]);

    // التحميل الأولي
    useEffect(() => {
        fetchComments(currentPage, false);
        fetchCommentsCount();
    }, [fetchComments, fetchCommentsCount]);

    // إنشاء تعليق جديد
    const createNewComment = async (data: CreateCommentData): Promise<Comment | null> => {
        try {
            setError(null);

            const response = await createComment(data);

            if (response.success) {
                // إضافة التعليق الجديد للقائمة
                const newComment = response.data;
                setComments(prev => [newComment, ...prev]);

                // تحديث العدد
                if (response.comments_count !== undefined) {
                    setCommentsCount(response.comments_count);
                    setTotalComments(prev => prev + 1);
                }

                return newComment;
            } else {
                throw new Error(response.message || 'Failed to create comment');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create comment');
            throw err;
        }
    };

    // تحديث تعليق موجود
    const updateExistingComment = async (
        id: number,
        data: UpdateCommentData
    ): Promise<Comment | null> => {
        try {
            setError(null);

            const response = await updateComment(id, data);

            if (response.success) {
                // تحديث التعليق في القائمة
                setComments(prev =>
                    prev.map(comment =>
                        comment.id === id ? response.data : comment
                    )
                );

                return response.data;
            } else {
                throw new Error(response.message || 'Failed to update comment');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to update comment');
            throw err;
        }
    };

    // حذف تعليق
    const deleteExistingComment = async (id: number): Promise<boolean> => {
        try {
            setError(null);

            const response = await deleteComment(id);

            if (response.success) {
                // إزالة التعليق من القائمة
                setComments(prev => prev.filter(comment => comment.id !== id));

                // تحديث العدد
                if (response.remaining_comments !== undefined) {
                    setCommentsCount(response.remaining_comments);
                    setTotalComments(prev => prev - 1);
                }

                return true;
            } else {
                throw new Error(response.message || 'Failed to delete comment');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to delete comment');
            throw err;
        }
    };

    // تحميل المزيد
    const loadMoreComments = () => {
        if (hasMore && !loading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchComments(nextPage, true);
        }
    };

    // تحديث القائمة
    const refreshComments = () => {
        setCurrentPage(1);
        fetchComments(1, false);
        fetchCommentsCount();
    };

    return {
        comments,
        loading,
        error,
        hasMore,
        totalComments,
        commentsCount,
        createNewComment,
        updateExistingComment,
        deleteExistingComment,
        loadMoreComments,
        refreshComments,
        setComments
    };
};