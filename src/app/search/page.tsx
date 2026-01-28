'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/use-search';
import SearchBar from '@/components/shared/SearchBar/SearchBar';
import Link from 'next/link';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import { SearchResponse } from '@/services/api/search/search';
import styles from './SearchPage.module.css';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    
    const { results, loading, error, search, clearResults } = useSearch();
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        if (query) {
            search(query, activeTab);
        } else {
            clearResults();
        }
    }, [query, activeTab]);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        if (query) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', tab);
            router.push(`/search?${params.toString()}`);
        }
    };

    const handleSearch = (newQuery: string) => {
        if (newQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(newQuery)}&type=${activeTab}`);
        }
    };

    const navigateToHome = () => {
        router.push('/');
    };

    const searchData = results as SearchResponse;

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
                        <SearchBar initialQuery={query} onSearch={handleSearch} />
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

                {/* Results */}
                <div className={styles.resultsContainer}>
                    {loading ? (
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p className={styles.loadingText}>Searching...</p>
                        </div>
                    ) : error ? (
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
                                onClick={navigateToHome}
                                className={styles.homeButtonError}
                            >
                                Back to Home
                            </button>
                        </div>
                    ) : !query ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <h3 className={styles.emptyTitle}>Start Searching</h3>
                            <p className={styles.emptyText}>
                                Enter keywords to find posts, users, or tags
                            </p>
                        </div>
                    ) : searchData && searchData.total === 0 ? (
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
                    ) : searchData ? (
                        <div className={styles.resultsContent}>
                            {/* Users Section */}
                            {(activeTab === 'all' || activeTab === 'users') && 
                             searchData.results.users.length > 0 && (
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

                            {/* Posts Section - التصحيح */}
                            {(activeTab === 'all' || activeTab === 'posts') && 
                             searchData.results.posts.length > 0 && (
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
                                                    isSearchResults={true} // 👈 أضف هذا!
                                                    initialPosts={[post]}  // 👈 أرسل البيانات مباشرة
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags Section */}
                            {(activeTab === 'all' || activeTab === 'tags') && 
                             searchData.results.tags.length > 0 && (
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
            </div>
        </div>
    );
}