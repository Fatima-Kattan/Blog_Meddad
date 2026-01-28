'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiX, HiUser, HiNewspaper, HiTag, HiChevronRight } from 'react-icons/hi';
import { useSearch } from '@/hooks/use-search';
import styles from './SearchBar.module.css';

interface UserSuggestion {
    id: number;
    full_name: string;
    image: string | null;
    email?: string;
}

interface PostSuggestion {
    id: number;
    title: string;
    user_id: number;
    user?: {
        id: number;
        full_name: string;
        image: string | null;
    };
}

interface TagSuggestion {
    id: number;
    tag_name: string;
}

interface SearchBarProps {
    initialQuery?: string;
    onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = '', onSearch }) => {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const [suggestions, setSuggestions] = useState<{
        users: UserSuggestion[];
        posts: PostSuggestion[];
        tags: TagSuggestion[];
    }>({ users: [], posts: [], tags: [] });
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { quickSearch } = useSearch();

    useEffect(() => {
        setSearchQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = useCallback(async (value: string) => {
        setSearchQuery(value);

        if (value.trim().length >= 2) {
            setIsLoadingSuggestions(true);
            try {
                const results = await quickSearch(value);
                setSuggestions({
                    users: results.users.map(user => ({
                        id: user.id,
                        full_name: user.full_name,
                        image: user.image,
                        email: user.email
                    })),
                    posts: results.posts.map(post => ({
                        id: post.id,
                        title: post.title,
                        user_id: post.user_id,
                        user: post.user
                    })),
                    tags: results.tags.map(tag => ({
                        id: tag.id,
                        tag_name: tag.tag_name
                    }))
                });
            } catch (err) {
                console.error('Quick search error:', err);
                setSuggestions({ users: [], posts: [], tags: [] });
            } finally {
                setIsLoadingSuggestions(false);
            }
        } else {
            setSuggestions({ users: [], posts: [], tags: [] });
        }
    }, [quickSearch]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (onSearch) {
                onSearch(searchQuery);
            } else {
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
            setIsFocused(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions({ users: [], posts: [], tags: [] });
    };

    const handleSuggestionClick = (type: 'user' | 'post' | 'tag', id: number) => {
        switch (type) {
            case 'user':
                router.push(`/profile/${id}`);
                break;
            case 'post':
                router.push(`/post/${id}`);
                break;
            case 'tag':
                router.push(`/tags/${id}`);
                break;
        }
        setIsFocused(false);
    };

    return (
        <div className={styles.searchContainer} ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                    <HiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                        placeholder="Search posts, people, tags..."
                        className={styles.searchInput}
                        aria-label="Search"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className={styles.clearButton}
                            aria-label="Clear search"
                        >
                            <HiX size={18} />
                        </button>
                    )}
                </div>
            </form>

            {isFocused && searchQuery.length >= 1 && (
                <div className={styles.suggestionsDropdown}>
                    {isLoadingSuggestions ? (
                        <div className={styles.loadingState}>
                            <div className={styles.loadingSpinner}></div>
                            <span className={styles.loadingText}>Searching...</span>
                        </div>
                    ) : (
                        <div className={styles.suggestionsContent}>
                            {/* Users Section */}
                            {suggestions.users.length > 0 && (
                                <div className={styles.suggestionCategory}>
                                    <div className={styles.categoryHeader}>
                                        <HiUser className={styles.categoryIcon} />
                                        <span className={styles.categoryTitle}>People</span>
                                        <span className={styles.categoryCount}>{suggestions.users.length}</span>
                                    </div>
                                    <div className={styles.suggestionList}>
                                        {suggestions.users.slice(0, 3).map((user) => (
                                            <button
                                                key={`user-${user.id}`}
                                                onClick={() => handleSuggestionClick('user', user.id)}
                                                className={styles.suggestionCard}
                                            >
                                                <div className={styles.cardContent}>
                                                    <div className={styles.userAvatar}>
                                                        <img
                                                            src={user.image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                                                            alt={user.full_name}
                                                            className={styles.avatarImage}
                                                        />
                                                        <div className={styles.onlineIndicator}></div>
                                                    </div>
                                                    <div className={styles.cardInfo}>
                                                        <h4 className={styles.cardTitle}>{user.full_name}</h4>
                                                        {user.email && (
                                                            <p className={styles.cardSubtitle}>{user.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <HiChevronRight className={styles.cardArrow} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Posts Section */}
                            {suggestions.posts.length > 0 && (
                                <div className={styles.suggestionCategory}>
                                    <div className={styles.categoryHeader}>
                                        <HiNewspaper className={styles.categoryIcon} />
                                        <span className={styles.categoryTitle}>Posts</span>
                                        <span className={styles.categoryCount}>{suggestions.posts.length}</span>
                                    </div>
                                    <div className={styles.suggestionList}>
                                        {suggestions.posts.slice(0, 3).map((post) => (
                                            <button
                                                key={`post-${post.id}`}
                                                onClick={() => handleSuggestionClick('post', post.id)}
                                                className={styles.suggestionCard}
                                            >
                                                <div className={styles.cardContent}>
                                                    <div className={styles.postIconWrapper}>
                                                        <HiNewspaper className={styles.postIcon} />
                                                    </div>
                                                    <div className={styles.cardInfo}>
                                                        <h4 className={styles.cardTitle}>{post.title}</h4>
                                                        <div className={styles.postMeta}>
                                                            <span className={styles.postAuthor}>
                                                                {post.user?.full_name || 'Unknown'}
                                                            </span>
                                                            <span className={styles.postDot}>•</span>
                                                            <span className={styles.postType}>Post</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <HiChevronRight className={styles.cardArrow} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags Section */}
                            {suggestions.tags.length > 0 && (
                                <div className={styles.suggestionCategory}>
                                    <div className={styles.categoryHeader}>
                                        <HiTag className={styles.categoryIcon} />
                                        <span className={styles.categoryTitle}>Tags</span>
                                        <span className={styles.categoryCount}>{suggestions.tags.length}</span>
                                    </div>
                                    <div className={styles.tagList}>
                                        {suggestions.tags.slice(0, 3).map((tag) => (
                                            <button
                                                key={`tag-${tag.id}`}
                                                onClick={() => handleSuggestionClick('tag', tag.id)}
                                                className={styles.tagItem}
                                            >
                                                <div className={styles.tagContent}>
                                                    <div className={styles.tagIconWrapper}>
                                                        <HiTag className={styles.tagIcon} />
                                                    </div>
                                                    <span className={styles.tagName}>#{tag.tag_name}</span>
                                                </div>
                                                <span className={styles.tagCount}>Explore</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* View All Results */}
                            {(suggestions.users.length > 0 ||
                                suggestions.posts.length > 0 ||
                                suggestions.tags.length > 0) && (
                                <div className={styles.viewAllSection}>
                                    <button onClick={handleSearchSubmit} className={styles.viewAllButton}>
                                        <span>View all results for</span>
                                        <span className={styles.searchQueryHighlight}>"{searchQuery}"</span>
                                        <HiChevronRight className={styles.viewAllArrow} />
                                    </button>
                                </div>
                            )}

                            {/* No Results */}
                            {!isLoadingSuggestions &&
                                searchQuery.length >= 2 &&
                                suggestions.users.length === 0 &&
                                suggestions.posts.length === 0 &&
                                suggestions.tags.length === 0 && (
                                    <div className={styles.noResults}>
                                        <div className={styles.noResultsIcon}>
                                            <HiSearch />
                                        </div>
                                        <h4 className={styles.noResultsTitle}>No results found</h4>
                                        <p className={styles.noResultsText}>
                                            Try searching with different keywords
                                        </p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;