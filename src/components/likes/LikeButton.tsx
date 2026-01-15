// src/components/likes/LikeButton.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/components/likes/likes.module.css';

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

    // تحديث مباشر مع القيم الأولية
    useEffect(() => {
        console.log('LikeButton: initial state', {
            initialLikesCount,
            isInitiallyLiked,
            postId
        });
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
                throw new Error('يجب تسجيل الدخول أولاً');
            }

            // تحديث مباشر بدون انتظار
            const newLiked = !isLiked;
            const newCount = newLiked ? likesCount + 1 : likesCount - 1;

            console.log('Toggling like:', {
                from: isLiked,
                to: newLiked,
                countFrom: likesCount,
                countTo: newCount
            });

            // تحديث الواجهة فوراً
            setLikesCount(newCount);
            setIsLiked(newLiked);

            // إعلام المكون الأب فوراً
            if (onLikeUpdate) {
                onLikeUpdate(newCount, newLiked);
            }

            // إرسال الطلب للـ API في الخلفية
            sendLikeRequest(postId, token, newLiked, newCount);

        } catch (error: any) {
            console.error('Error in handleLikeToggle:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // دالة لإرسال الطلب للـ API في الخلفية
    const sendLikeRequest = async (postId: number, token: string, expectedLiked: boolean, expectedCount: number) => {
        try {
            console.log('Sending API request for post:', postId);

            const response = await fetch('http://localhost:8000/api/v1/likes/toggle', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ post_id: postId })
            });

            const data = await response.json();
            console.log('API response:', data);

            if (!response.ok || !data.success) {
                console.error('API request failed:', data.message);
                // إذا فشل الـ API، ارجعي للتغيير
                revertChanges(postId, expectedLiked, expectedCount);
                return;
            }

            // إذا نجح الـ API، تأكدي من أن القيم متطابقة
            const apiLiked = data.action === 'added';
            const apiCount = data.data?.likes_count || expectedCount;

            console.log('API returned:', { apiLiked, apiCount, expectedLiked, expectedCount });

            if (apiLiked !== expectedLiked || apiCount !== expectedCount) {
                // إذا في اختلاف، عدلي الواجهة لتتطابق مع الـ API
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

    // دالة للتراجع عن التغييرات إذا فشل الـ API
    const revertChanges = (postId: number, expectedLiked: boolean, expectedCount: number) => {
        const revertedLiked = !expectedLiked;
        const revertedCount = revertedLiked ? expectedCount + 1 : expectedCount - 1;

        console.log('Reverting changes:', {
            postId,
            from: expectedLiked,
            to: revertedLiked,
            countFrom: expectedCount,
            countTo: revertedCount
        });

        setLikesCount(revertedCount);
        setIsLiked(revertedLiked);

        if (onLikeUpdate) {
            onLikeUpdate(revertedCount, revertedLiked);
        }
    };

    return (
        <div className={styles.likeContainer}>
            {/* زر القلب - اللون يظهر فوراً بناءً على isLiked */}
            <button
                onClick={handleLikeToggle}
                disabled={isLoading}
                className={`${styles.heartButton} ${isLiked ? styles.liked : ''}`}
                aria-label={isLiked ? 'Remove like': 'Add a like'}
                title={isLiked ? 'Remove like' : 'Add a like'}
            >
                {isLoading ? (
                    <div className={styles.loadingSpinner}>
                        <svg className={styles.spinnerIcon} viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4"></circle>
                        </svg>
                    </div>
                ) : (
                    <span className={isLiked ? styles.redHeart : styles.whiteHeart}>
                        {isLiked ? '❤️' : '🤍'}
                    </span>
                )}
            </button>

            {/* رابط العرض مع العدد - العدد يتحدث فوراً */}
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