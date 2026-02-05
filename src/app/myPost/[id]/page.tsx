'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserPostsFeed from '@/components/auth/profile/UserPostsFeed';
import {
    FaFeatherAlt,
    FaQuoteLeft,
    FaHeart,
    FaPenAlt,
    FaStar,
    FaRocket,
    FaMagic,
    FaFire,
    FaComments,
    FaEye
} from 'react-icons/fa';
import {
    HiOutlineDocumentText,
    HiOutlineLightningBolt,
    HiOutlineSparkles,
    HiOutlinePencilAlt
} from 'react-icons/hi';
import {
    FiZap,
    FiTrendingUp,
    FiAward,
    FiClock
} from 'react-icons/fi';
import {
    GiMagicPortal,
    GiStaryu
} from 'react-icons/gi';
import styles from './MyPostsPage.module.css';
import { getUserStats, getFilteredUserPosts } from '@/services/api/posts/get-user-posts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Inspiring quotes collection
const INSPIRING_QUOTES = [
    "Every word you write is a step in your creative journey ✨",
    "Your story deserves to be told, your ideas deserve to be shared 🌟",
    "Creativity starts with a pen and courage, and you have both 🚀",
    "Every post is a new window into your inner world 💫",
    "The words you write today create your legacy tomorrow 📖"
];

// Updated stats cards
const STATS_CARDS = [
    {
        label: "Total Posts",
        key: "total_posts",
        icon: HiOutlineDocumentText,
        color: "#8B5CF6",
        description: "All published posts"
    },
    {
        label: "Most Liked",
        key: "most_liked",
        icon: FaHeart,
        color: "#EC4899",
        description: "Highest liked post"
    },
    {
        label: "Latest Post",
        key: "latest_post",
        icon: FiClock,
        color: "#10B981",
        description: "Most recent creation"
    },
    {
        label: "Total Comments",
        key: "total_comments",
        icon: FaComments,
        color: "#3B82F6",
        description: "All post comments"
    }
];

export default function MyPostsPage() {
    const params = useParams();
    const userId = parseInt(params.id as string);

    const [stats, setStats] = useState({
        total_posts: 0,
        most_liked: 0,
        latest_post: 0,
        total_comments: 0
    });

    const [loading, setLoading] = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [randomQuote, setRandomQuote] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [activeSort, setActiveSort] = useState('newest');
    const [postsData, setPostsData] = useState<any>(null);
    const [hasMore, setHasMore] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    // Select random quote on load
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * INSPIRING_QUOTES.length);
        setRandomQuote(INSPIRING_QUOTES[randomIndex]);
    }, []);

    // Function to fetch user statistics
    const fetchUserStats = async () => {
        try {
            const response = await getUserStats(userId);

            if (response.success) {
                setStats(response.data.stats);
            } else {
                setError('Failed to load statistics');
            }
        } catch (error: any) {
            console.error('Error fetching user stats:', error);
            setError('Unable to load data. Please try again.');
        }
    };

    // Function to fetch filtered posts
    const fetchFilteredPosts = async (page: number = 1, loadMore: boolean = false) => {
        try {
            if (loadMore) {
                setLoadingMore(true);
            } else {
                setFilterLoading(true);
            }

            console.log('📡 Fetching posts:', {
                userId,
                filter: activeFilter,
                sort: activeSort,
                page,
                loadMore
            });

            const limit = 10;
            const response = await getFilteredUserPosts(userId, activeFilter, activeSort, page, limit);

            console.log('✅ API Response:', {
                success: response.success,
                hasData: !!response.data,
                dataLength: response.data?.length || 0,
                total: response.total,
                current_page: response.current_page,
                last_page: response.last_page,
                has_more: response.has_more
            });

            if (response.success) {
                if (loadMore && postsData?.data) {
                    setPostsData({
                        ...response,
                        data: [...postsData.data, ...response.data]
                    });
                } else {
                    setPostsData(response);
                }

                const totalLoaded = loadMore
                    ? (postsData?.data?.length || 0) + response.data.length
                    : response.data.length;

                setHasMore(totalLoaded < response.total && response.has_more);
            }
        } catch (error: any) {
            console.error('❌ Error fetching filtered posts:', error);
            if (!loadMore) {
                setError('Failed to load posts. Please try again.');
            }
        } finally {
            if (loadMore) {
                setLoadingMore(false);
            } else {
                setFilterLoading(false);
            }
        }
    };

    const handleLoadMore = async () => {
        if (postsData && hasMore && !loadingMore && !filterLoading) {
            const nextPage = postsData.current_page + 1;
            await fetchFilteredPosts(nextPage, true);
        }
    };

    const handleLoadAll = async () => {
        if (postsData && hasMore && !loadingMore && !filterLoading) {
            const remainingPosts = postsData.total - postsData.data.length;
            const pagesNeeded = Math.ceil(remainingPosts / 10);

            console.log(`🔄 Loading all remaining posts: ${remainingPosts} posts, ${pagesNeeded} pages`);

            for (let i = 1; i <= pagesNeeded; i++) {
                if (!hasMore) break;

                const pageNum = postsData.current_page + i;
                await fetchFilteredPosts(pageNum, true);
            }
        }
    };

    // Initialize - fetch both stats and posts
    useEffect(() => {
        const initializeData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch statistics first
                await fetchUserStats();
                
                // Then fetch initial posts
                await fetchFilteredPosts(1, false);
                
                setInitialLoadComplete(true);
            } catch (error: any) {
                console.error('❌ Error initializing data:', error);
                setError('Failed to load page. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            initializeData();
        }
    }, [userId]);

    // Handle filter change
    const handleFilterChange = async (filterId: string) => {
        setActiveFilter(filterId);
        // Loading will be handled by the useEffect below
    };

    // Handle sort change
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setActiveSort(e.target.value);
        // Loading will be handled by the useEffect below
    };

    useEffect(() => {
        if (initialLoadComplete && userId) {
            fetchFilteredPosts(1, false);
        }
    }, [activeFilter, activeSort, initialLoadComplete]);

    // Handle post deletion
    const handlePostDeleted = () => {
        fetchUserStats();
        fetchFilteredPosts(1, false);
    };

    // Handle post creation/update
    const handlePostCreated = () => {
        fetchUserStats();
        fetchFilteredPosts(1, false);
    };

    // Post filters
    const filters = [
        { id: 'all', label: 'All Posts', icon: HiOutlineDocumentText },
        { id: 'popular', label: 'Most Liked', icon: FaHeart },
        { id: 'recent', label: 'Latest', icon: FiClock },
        { id: 'commented', label: 'Most Discussed', icon: FaComments }
    ];

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'comments', label: 'Most Comments' }
    ];

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
                <div className={styles.heroBackground}></div>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>
                            <FaMagic className={styles.titleIcon} />
                            Creative
                            <span className={styles.titleHighlight}>Library</span>
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Showcase your writing journey and creative achievements
                        </p>
                    </div>
                    <div className={styles.heroQuote}>
                        <FaQuoteLeft className={styles.quoteIcon} />
                        <p className={styles.quoteText}>{randomQuote}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className={styles.statsSection}>
                <div className={styles.statsGrid}>
                    {STATS_CARDS.map((stat, index) => {
                        const Icon = stat.icon;
                        const value = stats[stat.key as keyof typeof stats];

                        return (
                            <div
                                key={stat.key}
                                className={styles.statCard}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={styles.statIconContainer}>
                                    <Icon
                                        className={styles.statIcon}
                                        style={{ color: stat.color }}
                                    />
                                </div>
                                <div className={styles.statContent}>
                                    <span className={styles.statValue}>
                                        {loading ? '...' : value}
                                    </span>
                                    <span className={styles.statLabel}>{stat.label}</span>
                                    <span className={styles.statDescription}>{stat.description}</span>
                                </div>
                                <div
                                    className={styles.statGlow}
                                    style={{ background: `radial-gradient(circle, ${stat.color}40 0%, transparent 70%)` }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {/* Filters and Sort */}
                <div className={styles.filtersSection}>
                    <div className={styles.filtersContainer}>
                        {filters.map(filter => {
                            const Icon = filter.icon;
                            return (
                                <button
                                    key={filter.id}
                                    className={`${styles.filterButton} ${activeFilter === filter.id ? styles.filterButtonActive : ''
                                        }`}
                                    onClick={() => handleFilterChange(filter.id)}
                                    disabled={filterLoading || loading}
                                >
                                    <Icon className={styles.filterIcon} />
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.sortContainer}>
                        <span className={styles.sortLabel}>Sort by:</span>
                        <select
                            className={styles.sortSelect}
                            value={activeSort}
                            onChange={handleSortChange}
                            disabled={filterLoading || loading}
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Posts Grid Header */}
                <div className={styles.postsHeader}>
                    <div className={styles.headerLeft}>
                        <FaFeatherAlt className={styles.headerIcon} />
                        <h2 className={styles.headerTitle}>
                            Writing Journey
                            <span className={styles.headerSubtitle}>
                                {loading || filterLoading ? 'Loading...' : `${stats.total_posts} creative posts`}
                            </span>
                        </h2>
                    </div>
                    <div className={styles.headerRight}>
                        <GiMagicPortal className={styles.magicIcon} />
                        <span className={styles.magicText}>Your Creative Space</span>
                    </div>
                </div>

                {/* Loading State للتحميل الأولي */}
                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingAnimation}>
                            <GiStaryu className={styles.loadingStar} />
                            <GiStaryu className={styles.loadingStar} style={{ animationDelay: '0.2s' }} />
                            <GiStaryu className={styles.loadingStar} style={{ animationDelay: '0.4s' }} />
                        </div>
                        <p className={styles.loadingText}>Loading your creative journey...</p>
                    </div>
                )}

                {/* Loading State للفلتر فقط */}
                {!loading && filterLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingAnimation}>
                            <GiStaryu className={styles.loadingStar} />
                            <GiStaryu className={styles.loadingStar} style={{ animationDelay: '0.2s' }} />
                            <GiStaryu className={styles.loadingStar} style={{ animationDelay: '0.4s' }} />
                        </div>
                        <p className={styles.loadingText}>Loading posts...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && !filterLoading && (
                    <div className={styles.errorContainer}>
                        <div className={styles.errorIconContainer}>
                            <HiOutlinePencilAlt className={styles.errorIcon} />
                        </div>
                        <h3 className={styles.errorTitle}>Unable to Load Content</h3>
                        <p className={styles.errorMessage}>
                            {error}
                        </p>
                        <button
                            className={styles.retryButton}
                            onClick={() => {
                                setError(null);
                                fetchUserStats();
                                fetchFilteredPosts(1, false);
                            }}
                        >
                            <FiZap className={styles.retryIcon} />
                            Try Again
                        </button>
                    </div>
                )}

                {/* Posts Content */}
                {!loading && !filterLoading && !error && postsData && (
                    <div className={styles.postsContent}>
                        <div className={styles.contentBackground}>
                            <div className={styles.contentGrid}>
                                <div className={styles.contentMain}>
                                    {postsData.data && postsData.data.length > 0 ? (
                                        <>
                                            {/* User Posts Feed */}
                                            <UserPostsFeed
                                                userId={userId}
                                                isOwnProfile={false}
                                                posts={postsData.data}
                                                useExternalData={true}
                                                externalPagination={{
                                                    current_page: postsData.current_page || 1,
                                                    last_page: postsData.last_page || 1,
                                                    total: postsData.total || 0,
                                                    per_page: 10
                                                }}
                                                filter={activeFilter}
                                                sort={activeSort}
                                                onPostDeleted={handlePostDeleted}
                                                onPostUpdated={handlePostCreated}
                                                onRefreshNeeded={() => fetchFilteredPosts(1, false)}
                                                onLoadMore={handleLoadMore}
                                                hasMoreExternal={hasMore}
                                                loadingExternal={loadingMore}
                                            />
                                        </>
                                    ) : (
                                        <div className={styles.noPosts}>
                                            <div className={styles.noPostsIcon}>
                                                <HiOutlinePencilAlt />
                                            </div>
                                            <h3>No posts found</h3>
                                            <p>Try changing your filter or create a new post!</p>
                                            <button
                                                onClick={() => fetchFilteredPosts(1, false)}
                                                className={styles.retryButton}
                                            >
                                                Refresh Posts
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className={styles.contentSidebar}>
                                    <div className={styles.sidebarCard}>
                                        <div className={styles.sidebarHeader}>
                                            <FaRocket className={styles.sidebarIcon} />
                                            <h4 className={styles.sidebarTitle}>Creative Tips</h4>
                                        </div>
                                        <ul className={styles.sidebarTips}>
                                            <li>✍️ Write regularly to improve</li>
                                            <li>💡 Use personal experiences</li>
                                            <li>🌟 Share unique ideas</li>
                                            <li>📈 Track reader engagement</li>
                                        </ul>
                                    </div>

                                    <div className={styles.sidebarCard}>
                                        <div className={styles.sidebarHeader}>
                                            <FaStar className={styles.sidebarIcon} />
                                            <h4 className={styles.sidebarTitle}>Your Milestones</h4>
                                        </div>
                                        <div className={styles.achievements}>
                                            <div className={styles.achievement}>
                                                <span className={styles.achievementBadge}>🥇</span>
                                                <span className={styles.achievementText}>
                                                    {stats.total_posts >= 10 ? 'Active Writer' : 'New Writer'}
                                                </span>
                                            </div>
                                            <div className={styles.achievement}>
                                                <span className={styles.achievementBadge}>🔥</span>
                                                <span className={styles.achievementText}>
                                                    {stats.most_liked >= 50 ? 'Viral Creator' : 'Growing Popularity'}
                                                </span>
                                            </div>
                                            <div className={styles.achievement}>
                                                <span className={styles.achievementBadge}>🚀</span>
                                                <span className={styles.achievementText}>
                                                    {stats.total_comments >= 100 ? 'Engaged Community' : 'Building Audience'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}