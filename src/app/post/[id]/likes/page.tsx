// app/post/[id]/likes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '@/components/likes/likes.module.css';

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

export default function PostLikesPage() {
    const params = useParams();
    const id = params.id as string;

    const [likes, setLikes] = useState<Like[]>([]);
    const [postTitle, setPostTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLikes, setTotalLikes] = useState(0);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

    const fetchLikes = async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_URL}/posts/${id}/likes?page=${page}`,
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
                setPostTitle(data.data.post?.title || 'Post');
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
    };

    useEffect(() => {
        if (id) {
            fetchLikes();
        }
    }, [id]);

    const formatDate = (dateString: string) => {
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
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading likes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorIcon}>!</div>
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => fetchLikes()} className={styles.retryButton}>
                    Retry
                </button>
                <Link href={`/`} className={styles.backLink}>
                    back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Link href={`/`} className={styles.backButton}>
                    ← back
                </Link>
                <h1 className={styles.title}>Likes</h1>
            </div>

            {/* Post Info */}
            <div className={styles.postInfo}>
                <h2 className={styles.postTitle}>{postTitle}</h2>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statCount}>{totalLikes}</span>
                        <span className={styles.statLabel}>Total Likes</span>
                    </div>
                </div>
            </div>

            {/* Likes List */}
            <div className={styles.likesList}>
                {likes.length === 0 ? (
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

                        {likes.map((like) => (
                            <div key={like.id} className={styles.likeItem}>
                                <div className={styles.userInfo}>
                                    <a
                                        href={`/profile/${like.user?.id || ''}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className={styles.userAvatar}
                                    >
                                        {like.user?.image ? (
                                            <img
                                                src={like.user.image}
                                                alt={like.user.full_name || 'User'}
                                                className={styles.avatarImage}
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
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
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
            )}
        </div>
    );
}