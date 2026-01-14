// src/components/posts/post-comments/comment-form/CommentForm.tsx
'use client';

import React, { useState } from 'react';
import styles from './CommentForm.module.css';
import { HiPaperAirplane } from 'react-icons/hi';
import { useComments } from '@/hooks/useComments';

interface CommentFormProps {
    postId: number | string;
    onCommentAdded: (comment: any) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ postId, onCommentAdded }) => {
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // استخدام الهوك للتعامل مع التعليقات
    const { createNewComment, commentsCount } = useComments(postId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!commentText.trim() || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // استخدام API حقيقي لإضافة التعليق
            const newComment = await createNewComment({
                post_id: postId,
                comment_text: commentText
            });

            if (newComment) {
                // تمرير التعليق للـ parent
                onCommentAdded(newComment);
                setCommentText('');
            }

        } catch (err: any) {
            console.error('Error adding comment:', err);
            setError(err.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Write a comment..."
                    className={styles.input}
                    disabled={isSubmitting}
                />

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={!commentText.trim() || isSubmitting}
                    aria-label="Send comment"
                >
                    {isSubmitting ? (
                        <div className={styles.spinner}></div>
                    ) : (
                        <HiPaperAirplane className={styles.icon} />
                    )}
                </button>
            </div>

            <div className={styles.stats}>
                <span className={styles.countText}>
                    {commentsCount} comments
                </span>
            </div>
        </form>
    );
};

export default CommentForm;