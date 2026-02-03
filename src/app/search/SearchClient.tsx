// app/search/SearchClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import Link from 'next/link';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import { getSearch, SearchResponse } from '@/services/api/search/search';
import styles from './SearchPage.module.css';

interface SearchClientProps {
  initialQuery: string;
  initialType: string;
}

export default function SearchClient({ initialQuery, initialType }: SearchClientProps) {
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState(initialType);
    const [query, setQuery] = useState(initialQuery);
    const [searchData, setSearchData] = useState<SearchResponse | null>(null);
    const [originalAllData, setOriginalAllData] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // دالة البحث الأساسية
    const performSearch = useCallback(async (searchQuery: string, tab: string) => {
        if (!searchQuery.trim()) {
            setSearchData(null);
            setOriginalAllData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getSearch(searchQuery, tab);
            
            if (data.success) {
                setSearchData(data);
                
                // حفظ البيانات الأصلية عندما يكون التبويب "all"
                if (tab === 'all') {
                    setOriginalAllData(data);
                }
            } else {
                setError('Search failed');
            }
        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    }, []);

    // البحث الأولي عند التحميل
    useEffect(() => {
        if (initialQuery) {
            performSearch(initialQuery, initialType);
        }
    }, [initialQuery, initialType, performSearch]);

    // تحديث البحث عند تغيير التبويب
    useEffect(() => {
        if (query && query !== initialQuery) {
            performSearch(query, activeTab);
        }
    }, [activeTab, query, performSearch]);

    // معالجة البحث من شريط البحث
    const handleSearch = (newQuery: string) => {
        setQuery(newQuery);
        
        if (newQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);
            performSearch(newQuery, activeTab);
        } else {
            router.push('/search');
            setSearchData(null);
            setOriginalAllData(null);
        }
    };

    // تغيير التبويب
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        
        if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}&type=${tab}`, { scroll: false });
            performSearch(query, tab);
        }
    };

    const navigateToHome = () => {
        router.push('/');
    };

    // دالة للحصول على الأرقام المناسبة لكل تبويب
    const getTabCounts = () => {
        if (!searchData && !originalAllData) return null;

        // استخدم البيانات الأصلية للـ "all" عند توفرها
        const displayData = originalAllData || searchData;
        
        if (!displayData) return null;

        return {
            total: displayData.total,
            users_count: displayData.users_count,
            posts_count: displayData.posts_count,
            tags_count: displayData.tags_count
        };
    };

    const tabCounts = getTabCounts();

    // عرض حالة التحميل
    if (loading && !searchData) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Searching...</p>
                </div>
            </div>
        );
    }

    // عرض حالة الخطأ
    if (error) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3 className={styles.errorTitle}>Search Error</h3>
                    <p className={styles.errorMessage}>{error}</p>
                    <button
                        onClick={() => performSearch(query, activeTab)}
                        className={styles.retryButton}
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className={styles.homeButtonError}
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* زر العودة للصفحة الرئيسية */}
            <div className={styles.homeButtonContainer}>
                <button
                    onClick={navigateToHome}
                    className={styles.homeButton}
                >
                    ← Back to Home
                </button>
            </div>

            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>
                    {query ? `Search results for "${query}"` : 'Search'}
                </h1>
                <div className={styles.searchBarWrapper}>
                    <SearchBar
                        initialQuery={query}
                        onSearch={handleSearch}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'all' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('all')}
                    >
                        <span className={styles.tabLabel}>All</span>
                        {tabCounts && <span className={styles.tabCount}>{tabCounts.total}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('users')}
                    >
                        <span className={styles.tabLabel}>Users</span>
                        {tabCounts && <span className={styles.tabCount}>{tabCounts.users_count}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('posts')}
                    >
                        <span className={styles.tabLabel}>Posts</span>
                        {tabCounts && <span className={styles.tabCount}>{tabCounts.posts_count}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'tags' ? styles.activeTab : ''}`}
                        onClick={() => handleTabChange('tags')}
                    >
                        <span className={styles.tabLabel}>Tags</span>
                        {tabCounts && <span className={styles.tabCount}>{tabCounts.tags_count}</span>}
                    </button>
                </div>
            </div>

            {/* Results Container */}
            <div className={styles.resultsContainer}>
                {/* إذا لم يكن هناك query */}
                {!query && !loading && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3 className={styles.emptyTitle}>Start Searching</h3>
                        <p className={styles.emptyText}>
                            Enter keywords to find posts, users, or tags
                        </p>
                    </div>
                )}

                {/* إذا كانت النتائج فارغة */}
                {query && searchData && searchData.total === 0 && (
                    <div className={styles.noResults}>
                        <div className={styles.noResultsIcon}>😕</div>
                        <h3 className={styles.noResultsTitle}>No Results Found</h3>
                        <p className={styles.noResultsText}>
                            No results found for "{query}"
                        </p>
                        <p className={styles.noResultsHint}>
                            Try different keywords or search in all categories
                        </p>
                    </div>
                )}

                {/* عرض النتائج */}
                {query && searchData && searchData.total > 0 && (
                    <div className={styles.resultsContent}>
                        {/* Users Section */}
                        {((activeTab === 'all' && searchData.results.users.length > 0) ||
                            (activeTab === 'users' && searchData.results.users.length > 0)) && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Users</h2>
                                        <span className={styles.sectionCount}>
                                            {activeTab === 'all' && originalAllData 
                                                ? originalAllData.users_count 
                                                : searchData.users_count} users
                                        </span>
                                    </div>
                                    <div className={styles.usersGrid}>
                                        {searchData.results.users.map((user) => (
                                            <Link
                                                key={user.id}
                                                href={`/profile/${user.id}`}
                                                className={styles.userCard}
                                            >
                                                <div className={styles.userCardContent}>
                                                    <div className={styles.userAvatar}>
                                                        <img
                                                            src={user.image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                                                            alt={user.full_name}
                                                            className={styles.avatarImage}
                                                        />
                                                        <div className={styles.onlineStatus}></div>
                                                    </div>
                                                    <div className={styles.userInfo}>
                                                        <h3 className={styles.userName}>{user.full_name}</h3>
                                                        <p className={styles.userEmail}>{user.email}</p>
                                                        {user.bio && (
                                                            <p className={styles.userBio}>
                                                                {user.bio.length > 80 ? user.bio.substring(0, 80) + '...' : user.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={styles.viewProfile}>
                                                        View Profile
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Posts Section */}
                        {((activeTab === 'all' && searchData.results.posts.length > 0) ||
                            (activeTab === 'posts' && searchData.results.posts.length > 0)) && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Posts</h2>
                                        <span className={styles.sectionCount}>
                                            {activeTab === 'all' && originalAllData 
                                                ? originalAllData.posts_count 
                                                : searchData.posts_count} posts
                                        </span>
                                    </div>
                                    <div className={styles.postsContainer}>
                                        {searchData.results.posts.map((post) => (
                                            <div key={post.id} className={styles.postWrapper}>
                                                <PostFeed
                                                    singlePostMode={true}
                                                    postId={post.id}
                                                    hideInfiniteScroll={true}
                                                    showLoadingOnly={false}
                                                    isSearchResults={true}
                                                    initialPosts={[post]}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        {/* Tags Section */}
                        {((activeTab === 'all' && searchData.results.tags.length > 0) ||
                            (activeTab === 'tags' && searchData.results.tags.length > 0)) && (
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Tags</h2>
                                        <span className={styles.sectionCount}>
                                            {activeTab === 'all' && originalAllData 
                                                ? originalAllData.tags_count 
                                                : searchData.tags_count} tags
                                        </span>
                                    </div>
                                    <div className={styles.tagsGrid}>
                                        {searchData.results.tags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={`/tags/${tag.id}`}
                                                className={styles.tagCard}
                                            >
                                                <div className={styles.tagContent}>
                                                    <div className={styles.tagIcon}>#</div>
                                                    <div className={styles.tagInfo}>
                                                        <h3 className={styles.tagName}>{tag.tag_name}</h3>
                                                        <p className={styles.tagDescription}>Click to explore posts</p>
                                                    </div>
                                                    <div className={styles.tagArrow}>→</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>
                )}

                {/* Loading أثناء وجود نتائج (للتحديث) */}
                {loading && searchData && (
                    <div className={styles.loadingOverlay}>
                        <div className={styles.spinner}></div>
                        <p>Updating results...</p>
                    </div>
                )}
            </div>
        </>
    );
}