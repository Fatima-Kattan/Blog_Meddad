// app/search/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/use-search';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import Link from 'next/link';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import { SearchResponse } from '@/services/api/search/search';
import styles from './SearchPage.module.css';

// مكون داخلي يستخدم useSearchParams في Suspense boundary
function SearchResults() {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [shouldSearch, setShouldSearch] = useState(false);

    const { results, loading, error, search, clearResults } = useSearch();

    // قراءة search params عند تحميل المكون
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlQuery = params.get('q') || '';
            const urlTab = params.get('type') || 'all';

            setQuery(urlQuery);
            setActiveTab(urlTab);

            if (urlQuery) {
                search(urlQuery, urlTab);
            } else {
                clearResults();
            }
        }
        setIsInitialLoad(false);
    }, []);

    // الاستماع لتغيير التبويب من المكون الرئيسي
    useEffect(() => {
        const handleTabChange = (event: CustomEvent) => {
            const { tab } = event.detail;
            setActiveTab(tab);
            if (query && !isInitialLoad) {
                search(query, tab);
            }
        };

        window.addEventListener('tabChange', handleTabChange as EventListener);

        return () => {
            window.removeEventListener('tabChange', handleTabChange as EventListener);
        };
    }, [query, isInitialLoad]);

    // الاستماع لتحديث الـ query من المكون الرئيسي
    useEffect(() => {
        const handleQueryUpdate = (event: CustomEvent) => {
            const { newQuery } = event.detail;
            setQuery(newQuery);
            if (newQuery && !isInitialLoad) {
                search(newQuery, activeTab);
            } else {
                clearResults();
            }
        };

        window.addEventListener('queryUpdate', handleQueryUpdate as EventListener);

        return () => {
            window.removeEventListener('queryUpdate', handleQueryUpdate as EventListener);
        };
    }, [activeTab, isInitialLoad]);

    // تحديث البحث عند تغيير التبويب
    useEffect(() => {
        if (query && !isInitialLoad && shouldSearch) {
            search(query, activeTab);
        }
    }, [activeTab, isInitialLoad, shouldSearch]);

    // إعادة البحث عند تغيير الـ query
    useEffect(() => {
        if (query && !isInitialLoad) {
            search(query, activeTab);
            setShouldSearch(true);
        }
    }, [query]);

    const searchData = results as SearchResponse;

    // تمرير البيانات للوالد
    useEffect(() => {
        if (searchData) {
            window.dispatchEvent(new CustomEvent('searchDataUpdate', {
                detail: { data: searchData, activeTab, query }
            }));
        }
    }, [searchData, activeTab, query]);

    // عرض شاشة التحميل أثناء جلب البيانات
    if (loading) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p className={styles.loadingText}>Searching...</p>
                </div>
            </div>
        );
    }

    // عرض خطأ إذا حدث
    if (error) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.errorState}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3 className={styles.errorTitle}>Search Error</h3>
                    <p className={styles.errorMessage}>An error occurred while searching</p>
                    <button
                        onClick={() => search(query, activeTab)}
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

    // إذا لم يكن هناك query
    if (!query) {
        return (
            <div className={styles.resultsContainer}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>🔍</div>
                    <h3 className={styles.emptyTitle}>Start Searching</h3>
                    <p className={styles.emptyText}>
                        Enter keywords to find posts, users, or tags
                    </p>
                </div>
            </div>
        );
    }

    // إذا كانت النتائج فارغة
    if (searchData && searchData.total === 0) {
        return (
            <div className={styles.resultsContainer}>
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
            </div>
        );
    }

    // عرض النتائج
    return (
        <div className={styles.resultsContainer}>
            {searchData ? (
                <div className={styles.resultsContent}>
                    {/* Users Section - يعرض فقط إذا كان التبويب "all" أو "users" */}
                    {((activeTab === 'all' && searchData.results.users.length > 0) ||
                        (activeTab === 'users' && searchData.results.users.length > 0)) && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Users</h2>
                                    <span className={styles.sectionCount}>{searchData.users_count} users</span>
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

                    {/* Posts Section - يعرض فقط إذا كان التبويب "all" أو "posts" */}
                    {((activeTab === 'all' && searchData.results.posts.length > 0) ||
                        (activeTab === 'posts' && searchData.results.posts.length > 0)) && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Posts</h2>
                                    <span className={styles.sectionCount}>{searchData.posts_count} posts</span>
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

                    {/* Tags Section - يعرض فقط إذا كان التبويب "all" أو "tags" */}
                    {((activeTab === 'all' && searchData.results.tags.length > 0) ||
                        (activeTab === 'tags' && searchData.results.tags.length > 0)) && (
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Tags</h2>
                                    <span className={styles.sectionCount}>{searchData.tags_count} tags</span>
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
            ) : null}
        </div>
    );
}

// المكون الرئيسي
export default function SearchPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('all');
    const [query, setQuery] = useState('');
    const [searchData, setSearchData] = useState<SearchResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // قراءة الـ query والتبويب الأولي من URL
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlQuery = params.get('q') || '';
            const urlTab = params.get('type') || 'all';

            setQuery(urlQuery);
            setActiveTab(urlTab);

            // إرسال حدث لتحديث الـ query في المكون الداخلي
            if (urlQuery) {
                window.dispatchEvent(new CustomEvent('queryUpdate', {
                    detail: { newQuery: urlQuery }
                }));
            }
        }
    }, []);

    // استماع لتحديثات بيانات البحث
    useEffect(() => {
        const handleSearchDataUpdate = (event: CustomEvent) => {
            setSearchData(event.detail.data);
            setIsSearching(false);
        };

        window.addEventListener('searchDataUpdate', handleSearchDataUpdate as EventListener);

        return () => {
            window.removeEventListener('searchDataUpdate', handleSearchDataUpdate as EventListener);
        };
    }, []);

    const handleSearch = (newQuery: string) => {
        if (newQuery.trim()) {
            setIsSearching(true);
            setQuery(newQuery);

            // تحديث URL
            router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);

            // إرسال حدث لتحديث الـ query في المكون الداخلي
            window.dispatchEvent(new CustomEvent('queryUpdate', {
                detail: { newQuery }
            }));
        } else {
            // إذا كان البحث فارغاً
            setQuery('');
            router.push(`/search`);

            // إرسال حدث لتحديث الـ query في المكون الداخلي
            window.dispatchEvent(new CustomEvent('queryUpdate', {
                detail: { newQuery: '' }
            }));
        }
    };

    const navigateToHome = () => {
        router.push('/');
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);

        // تحديث URL عند تغيير التبويب
        if (query) {
            router.push(`/search?q=${encodeURIComponent(query)}&type=${tab}`, { scroll: false });
        }

        // إرسال حدث لتحديث التبويب في المكون الداخلي
        window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab } }));
    };

    return (
        <div className={styles.searchPage}>
            <div className={styles.container}>
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
                            {searchData && <span className={styles.tabCount}>{searchData.total}</span>}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('users')}
                        >
                            <span className={styles.tabLabel}>Users</span>
                            {searchData && <span className={styles.tabCount}>{searchData.users_count}</span>}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'posts' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('posts')}
                        >
                            <span className={styles.tabLabel}>Posts</span>
                            {searchData && <span className={styles.tabCount}>{searchData.posts_count}</span>}
                        </button>
                        <button
                            className={`${styles.tab} ${activeTab === 'tags' ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange('tags')}
                        >
                            <span className={styles.tabLabel}>Tags</span>
                            {searchData && <span className={styles.tabCount}>{searchData.tags_count}</span>}
                        </button>
                    </div>
                </div>

                {/* عرض النتائج مع Suspense */}
                <Suspense fallback={
                    <div className={styles.resultsContainer}>
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p className={styles.loadingText}>Loading search results...</p>
                        </div>
                    </div>
                }>
                    <SearchResults />
                </Suspense>
            </div>
        </div>
    );
}