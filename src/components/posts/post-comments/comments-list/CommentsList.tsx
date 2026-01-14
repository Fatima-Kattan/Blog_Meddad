// src/components/posts/post-comments/comments-list/CommentsList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from './CommentsList.module.css';
import { HiTrash, HiPencil, HiDotsVertical } from 'react-icons/hi';
import { useComments } from '@/hooks/useComments';

interface CommentsListProps {
    postId: number | string;
    currentUserId?: number;
}

const CommentsList: React.FC<CommentsListProps> = ({
    postId,
    currentUserId
}) => {
    // 🔍 أضف console.log للتحقق من postId
    console.log('🔍 CommentsList - postId:', postId, 'type:', typeof postId);
    
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editText, setEditText] = useState('');
    const [showActionsForComment, setShowActionsForComment] = useState<number | null>(null);

    // استخدام الهوك
    const {
        comments,
        loading,
        error,
        hasMore,
        totalComments,
        updateExistingComment,
        deleteExistingComment,
        loadMoreComments,
        refreshComments
    } = useComments(postId);

    // 🔍 أضف useEffect لمراقبة البيانات
    useEffect(() => {
        console.log('📊 CommentsList data:', {
            comments,
            commentsLength: comments?.length || 0,
            loading,
            error,
            totalComments
        });
    }, [comments, loading, error, totalComments]);

    const handleEdit = (comment: any) => {
        setEditingCommentId(comment.id);
        setEditText(comment.comment_text);
        setShowActionsForComment(null);
    };

    const handleUpdate = async (commentId: number) => {
        try {
            await updateExistingComment(commentId, {
                comment_text: editText
            });
            setEditingCommentId(null);
            setEditText('');
        } catch (error) {
            console.error('Error updating comment:', error);
        }
    };

    const handleDelete = async (commentId: number) => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await deleteExistingComment(commentId);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
        setShowActionsForComment(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}m`;
        } else if (diffHours < 24) {
            return `${diffHours}h`;
        } else if (diffDays < 7) {
            return `${diffDays}d`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const toggleActionsMenu = (commentId: number) => {
        setShowActionsForComment(prev => prev === commentId ? null : commentId);
    };

    if (loading && comments.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Loading comments...</p>
            </div>
        );
    }

    if (error && comments.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p className={styles.errorText}>{error}</p>
                <button
                    onClick={refreshComments}
                    className={styles.retryButton}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <p className={styles.emptyText}>No comments yet</p>
                <p className={styles.emptySubtext}>Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className={styles.commentsList}>
            {/* Comments statistics */}
            <div className={styles.commentsHeader}>
                <h3 className={styles.commentsTitle}>
                    Comments ({totalComments})
                </h3>
            </div>

            {/* Comments list */}
            <div className={styles.commentsContainer}>
                {comments.map((comment) => {
                    // 🔍 تحقق من كل تعليق
                    const isCommentOwner = currentUserId === comment.user_id;
                    
                    return (
                        <div key={comment.id} className={styles.commentItem}>
                            <div className={styles.commentContent}>
                                <img
                                    src={comment.user?.image || 'https://ui-avatars.com/api/?name=' + (comment.user?.full_name || 'User')}
                                    alt={comment.user?.full_name || 'User'}
                                    className={styles.avatar}
                                    onError={(e) => {
                                        e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + (comment.user?.full_name || 'User');
                                    }}
                                />

                                <div className={styles.commentBody}>
                                    <div className={styles.commentHeader}>
                                        <div className={styles.commentInfo}>
                                            <span className={styles.userName}>
                                                {comment.user?.full_name || 'User'}
                                            </span>
                                            <span className={styles.timestamp}>
                                                {formatDate(comment.created_at)}
                                                {comment.is_edited && ' • Edited'}
                                            </span>
                                        </div>

                                        {/* ✅ الأزرار - فقط الثلاث نقاط لصاحب التعليق */}
                                        <div className={styles.actionsContainer}>
                                            {isCommentOwner && (
                                                <div className={styles.moreActionsContainer}>
                                                    <button
                                                        className={styles.moreActionsButton}
                                                        onClick={() => toggleActionsMenu(comment.id)}
                                                        aria-label="More"
                                                    >
                                                        <HiDotsVertical />
                                                    </button>

                                                    {showActionsForComment === comment.id && (
                                                        <div className={styles.actionsMenu}>
                                                            <button
                                                                className={styles.actionMenuItem}
                                                                onClick={() => handleEdit(comment)}
                                                            >
                                                                <HiPencil className={styles.editIcon} />
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                className={styles.actionMenuItemDelete}
                                                                onClick={() => handleDelete(comment.id)}
                                                            >
                                                                <HiTrash className={styles.deleteIcon} />
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.commentTextContainer}>
                                        {editingCommentId === comment.id ? (
                                            <div className={styles.editContainer}>
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className={styles.editTextarea}
                                                    rows={3}
                                                />
                                                <div className={styles.editButtons}>
                                                    <button
                                                        className={styles.cancelEdit}
                                                        onClick={() => {
                                                            setEditingCommentId(null);
                                                            setEditText('');
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className={styles.saveEdit}
                                                        onClick={() => handleUpdate(comment.id)}
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className={styles.commentText}>{comment.comment_text}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Load more */}
            {hasMore && (
                <div className={styles.loadMoreContainer}>
                    <button
                        onClick={loadMoreComments}
                        className={styles.loadMoreButton}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Load more'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentsList;