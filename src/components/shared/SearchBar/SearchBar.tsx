'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiX, HiUser, HiNewspaper, HiTag } from 'react-icons/hi';
import { useSearch } from '@/hooks/use-search';
import styles from './SearchBar.module.css';

// تعريف الأنواع محلياً
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

// تعريف Props للـ SearchBar
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

    // تحديث searchQuery عندما يتغير initialQuery
    useEffect(() => {
        setSearchQuery(initialQuery);
    }, [initialQuery]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search input with debouncing
    const handleInputChange = useCallback(async (value: string) => {
        setSearchQuery(value);

        if (value.trim().length >= 2) {
            setIsLoadingSuggestions(true);
            try {
                const results = await quickSearch(value);
                // تحويل النتيجة للأنواع المطلوبة
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

    // Handle search submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            if (onSearch) {
                // إذا كان فيه onSearch prop، استخدمه
                onSearch(searchQuery);
            } else {
                // وإلا استخدم router مباشرة
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            }
            setIsFocused(false);
            setSearchQuery('');
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions({ users: [], posts: [], tags: [] });
        setIsFocused(false);
    };

    // Handle suggestion click
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
        setSearchQuery('');
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
                            <HiX size={16} />
                        </button>
                    )}
                </div>
            </form>

            {/* Suggestions Dropdown */}
            {isFocused && searchQuery.length >= 1 && (
                <div className={styles.suggestionsDropdown}>
                    {isLoadingSuggestions ? (
                        <div className={styles.loadingIndicator}>
                            <div className={styles.spinner}></div>
                            <span>Searching...</span>
                        </div>
                    ) : (
                        <>
                            {/* Users */}
                            {suggestions.users.length > 0 && (
                                <div className={styles.suggestionSection}>
                                    <div className={styles.sectionHeader}>
                                        <HiUser size={14} />
                                        <span>People</span>
                                    </div>
                                    {suggestions.users.slice(0, 3).map((user) => (
                                        <button
                                            key={`user-${user.id}`}
                                            onClick={() => handleSuggestionClick('user', user.id)}
                                            className={styles.suggestionItem}
                                        >
                                            <img
                                                src={user.image || `https://ui-avatars.com/api/?name=${user.full_name}&background=8b5cf6&color=fff`}
                                                alt={user.full_name}
                                                className={styles.suggestionImage}
                                            />
                                            <div className={styles.suggestionContent}>
                                                <div className={styles.suggestionTitle}>
                                                    {user.full_name}
                                                </div>
                                                {user.email && (
                                                    <div className={styles.suggestionDescription}>
                                                        {user.email}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Posts */}
                            {suggestions.posts.length > 0 && (
                                <div className={styles.suggestionSection}>
                                    <div className={styles.sectionHeader}>
                                        <HiNewspaper size={14} />
                                        <span>Posts</span>
                                    </div>
                                    {suggestions.posts.slice(0, 3).map((post) => (
                                        <button
                                            key={`post-${post.id}`}
                                            onClick={() => handleSuggestionClick('post', post.id)}
                                            className={styles.suggestionItem}
                                        >
                                            <HiNewspaper size={18} className={styles.postIcon} />
                                            <div className={styles.suggestionContent}>
                                                <div className={styles.suggestionTitle}>
                                                    {post.title}
                                                </div>
                                                <div className={styles.suggestionDescription}>
                                                    by {post.user?.full_name || 'Unknown'}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Tags */}
                            {suggestions.tags.length > 0 && (
                                <div className={styles.suggestionSection}>
                                    <div className={styles.sectionHeader}>
                                        <HiTag size={14} />
                                        <span>Tags</span>
                                    </div>
                                    {suggestions.tags.slice(0, 3).map((tag) => (
                                        <button
                                            key={`tag-${tag.id}`}
                                            onClick={() => handleSuggestionClick('tag', tag.id)}
                                            className={styles.suggestionItem}
                                        >
                                            <HiTag size={18} className={styles.tagIcon} />
                                            <div className={styles.suggestionContent}>
                                                <div className={styles.suggestionTitle}>
                                                    #{tag.tag_name}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* View all */}
                            {(suggestions.users.length > 0 ||
                                suggestions.posts.length > 0 ||
                                suggestions.tags.length > 0) && (
                                    <div className={styles.viewAllSection}>
                                        <button
                                            onClick={handleSearchSubmit}
                                            className={styles.viewAllButton}
                                        >
                                            View all results for "{searchQuery}"
                                        </button>
                                    </div>
                                )}

                            {/* No results */}
                            {!isLoadingSuggestions &&
                                searchQuery.length >= 2 &&
                                suggestions.users.length === 0 &&
                                suggestions.posts.length === 0 &&
                                suggestions.tags.length === 0 && (
                                    <div className={styles.noResults}>
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;