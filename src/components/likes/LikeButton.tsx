// src/components/likes/LikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/components/likes/likes.module.css';
import LoadingIcon from '../shared/LoadingIcon/LoadingIcon';

interface LikeButtonProps {
    postId: number;
    initialLikesCount: number;
    isInitiallyLiked: boolean;
    onLikeUpdate?: (newCount: number, isLiked: boolean) => void;
}

export default function LikeButton({
    postId,
    initialLikesCount,
    isInitiallyLiked,
    onLikeUpdate
}: LikeButtonProps) {
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [isLiked, setIsLiked] = useState(isInitiallyLiked);
    const [isLoading, setIsLoading] = useState(false);

    // Live update with initial values
    useEffect(() => {
        setLikesCount(initialLikesCount);
        setIsLiked(isInitiallyLiked);
    }, [initialLikesCount, isInitiallyLiked, postId]);

    const handleLikeToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must login first');
            }

            // Live update without waiting
            const newLiked = !isLiked;
            const newCount = newLiked ? likesCount + 1 : likesCount - 1;

            // Update the interface immediately
            setLikesCount(newCount);
            setIsLiked(newLiked);

            // Inform the parent component immediately
            if (onLikeUpdate) {
                onLikeUpdate(newCount, newLiked);
            }

            // Sending the request to the API in the background
            sendLikeRequest(postId, token, newLiked, newCount);

        } catch (error: any) {
            console.error('Error in handleLikeToggle:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to send the API request in the background
    const sendLikeRequest = async (postId: number, token: string, expectedLiked: boolean, expectedCount: number) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/likes/toggle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post_id: postId })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                console.error('API request failed:', data.message);
                // If the API fails, revert the changes
                revertChanges(postId, expectedLiked, expectedCount);
                return;
            }

            // If the API succeeds, verify that the values match
            const apiLiked = data.action === 'added';
            const apiCount = data.data?.likes_count || expectedCount;
            if (apiLiked !== expectedLiked || apiCount !== expectedCount) {
                // If there is a difference, update the UI to match the API
                console.log('Updating UI to match API');
                setLikesCount(apiCount);
                setIsLiked(apiLiked);

                if (onLikeUpdate) {
                    onLikeUpdate(apiCount, apiLiked);
                }
            }

        } catch (error) {
            console.error('Error in API request:', error);
            revertChanges(postId, expectedLiked, expectedCount);
        }
    };

    // Function to revert changes if the API fails
    const revertChanges = (postId: number, expectedLiked: boolean, expectedCount: number) => {
        const revertedLiked = !expectedLiked;
        const revertedCount = revertedLiked ? expectedCount + 1 : expectedCount - 1;

        setLikesCount(revertedCount);
        setIsLiked(revertedLiked);

        if (onLikeUpdate) {
            onLikeUpdate(revertedCount, revertedLiked);
        }
    };

    return (
        <div className={styles.likeContainer}>
            {/* Heart button - color appears immediately based on isLiked */}
            <button
                onClick={handleLikeToggle}
                disabled={isLoading}
                className={`${styles.heartButton} ${isLiked ? styles.liked : ''}`}
                aria-label={isLiked ? 'Remove like' : 'Add a like'}
                title={isLiked ? 'Remove like' : 'Add a like'}
            >
                {isLoading ? (
                    <div className={styles.loadingSpinner}>
                        <LoadingIcon
                            size={20}
                            message="Updating like..."
                            position="absolute"
                        />
                    </div>
                ) : (
                    <span className={isLiked ? styles.redHeart : styles.whiteHeart}>
                        {isLiked ? '❤️' : '🤍'}
                    </span>
                )}
            </button>

            {/* View link with count - count updates immediately */}
            <Link
                href={`/post/${postId}/likes`}
                className={styles.likesLink}
                onClick={(e) => e.stopPropagation()}
            >
                <span className={styles.likesCount}>{likesCount}</span>
                <span className={styles.likesLabel}>Likes</span>
            </Link>
        </div>
    );
}