// components/LikesModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './likes.module.css';
import LoadingIcon from '../shared/LoadingIcon/LoadingIcon';

interface LikeUser {
    id: number;
    full_name: string;
    image: string | null;
}

interface Like {
    id: number;
    user_id: number;
    post_id: number;
    user: LikeUser;
    created_at: string;
}

interface LikesModalProps {
    postId: string;
    postTitle?: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function LikesModal({ postId, postTitle = '', isOpen, onClose }: LikesModalProps) {
    const [likes, setLikes] = useState<Like[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLikes, setTotalLikes] = useState(0);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    const fetchLikes = useCallback(async (page = 1) => {
        if (!postId || !isOpen) return;

        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_URL}/posts/${postId}/likes?page=${page}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch likes: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setLikes(data.data.likes?.data || []);
                setTotalLikes(data.data.total_likes || 0);
                setCurrentPage(data.data.likes?.current_page || 1);
                setTotalPages(data.data.likes?.last_page || 1);
            } else {
                setError(data.message || 'Unknown error occurred');
            }
        } catch (err: any) {
            setError(err.message || 'Error occurred while fetching likes');
            console.error('Error fetching likes:', err);
        } finally {
            setLoading(false);
        }
    }, [postId, isOpen, API_URL]);

    useEffect(() => {
        if (isOpen && postId) {
            fetchLikes();
        }
    }, [isOpen, postId, fetchLikes]);

    const formatDate = useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 60) return `${diffMins} minutes ago`;
            if (diffHours < 24) return `${diffHours} hours ago`;
            if (diffDays < 7) return `${diffDays} days ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    }, []);

    const getInitials = useCallback((name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, []);

    // إغلاق المودال عند الضغط على ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden'; // منع التمرير خلف المودال
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, onClose]);

    // إغلاق عند الضغط خارج المودال
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
            <div className={styles.modalContainer}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <button onClick={onClose} className={styles.closeButton}>
                        &times;
                    </button>
                    <h2 className={styles.modalTitle}>Likes</h2>
                </div>

                {/* Post Info */}
                {postTitle && (
                    <div className={styles.postInfo}>
                        <h3 className={styles.postTitle}>{postTitle}</h3>
                        <div className={styles.stats}>
                            <div className={styles.statItem}>
                                <span className={styles.statCount}>{totalLikes}</span>
                                <span className={styles.statLabel}>Total Likes</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className={styles.modalContent}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <LoadingIcon 
                                size={45}
                                message="Loading likes..."
                                position="absolute"
                            />
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <div className={styles.errorIcon}>!</div>
                            <h3>Error</h3>
                            <p>{error}</p>
                            <button onClick={() => fetchLikes()} className={styles.retryButton}>
                                Retry
                            </button>
                        </div>
                    ) : likes.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🤍</div>
                            <h3>No likes yet</h3>
                            <p>Be the first to like this post</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.listHeader}>
                                <span className={styles.listTitle}>people who liked this post</span>
                                <span className={styles.listCount}>{totalLikes}</span>
                            </div>

                            <div className={styles.likesList}>
                                {likes.map((like) => (
                                    <div key={like.id} className={styles.likeItem}>
                                        <div className={styles.userInfo}>
                                            <a
                                                href={`/profile/${like.user?.id || ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onClose(); // إغلاق المودال عند الذهاب للبروفايل
                                                }}
                                                className={styles.userAvatar}
                                            >
                                                {like.user?.image ? (
                                                    <img
                                                        src={like.user.image}
                                                        alt={like.user.full_name || 'User'}
                                                        className={styles.avatarImage}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            const parent = target.parentElement;
                                                            if (parent) {
                                                                const div = document.createElement('div');
                                                                div.className = styles.avatarFallback;
                                                                div.textContent = getInitials(like.user?.full_name);
                                                                parent.appendChild(div);
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <div className={styles.avatarFallback}>
                                                        {getInitials(like.user?.full_name || '??')}
                                                    </div>
                                                )}
                                            </a>
                                            <div className={styles.userDetails}>
                                                <h4 className={styles.userName}>{like.user?.full_name || 'User'}</h4>
                                                <span className={styles.likeTime}>{formatDate(like.created_at)}</span>
                                            </div>
                                        </div>

                                        <div className={styles.likeBadge}>
                                            <span className={styles.heartIcon}>❤️</span>
                                            <span className={styles.likedText}>Liked</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <div className={styles.modalFooter}>
                        <div className={styles.pagination}>
                            <button
                                onClick={() => fetchLikes(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={styles.pageButton}
                            >
                                Previous
                            </button>

                            <div className={styles.pageNumbers}>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchLikes(pageNum)}
                                            className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => fetchLikes(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={styles.pageButton}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}