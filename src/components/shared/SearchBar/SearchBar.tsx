// src/components/shared/SearchBar/SearchBar.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HiSearch, HiX } from 'react-icons/hi';
import styles from './SearchBar.module.css';

interface SearchResult {
    id: number;
    type: 'article' | 'user' | 'category';
    title: string;
    description: string;
    image?: string;
    url: string;
}

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Mock data for suggestions
    const mockSuggestions: SearchResult[] = [
        { id: 1, type: 'article', title: 'React Hooks Complete Guide', description: 'Learn all about React Hooks', url: '/articles/react-hooks' },
        { id: 2, type: 'user', title: 'John Doe', description: 'Software Developer', url: '/profile/johndoe' },
        { id: 3, type: 'category', title: 'Web Development', description: '45 articles', url: '/category/web-dev' },
        { id: 4, type: 'article', title: 'Next.js 14 Best Practices', description: 'Latest features and patterns', url: '/articles/nextjs-14' },
        { id: 5, type: 'user', title: 'Jane Smith', description: 'UI/UX Designer', url: '/profile/janesmith' },
    ];

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle search input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.trim().length > 0) {
            setIsLoading(true);
            // Simulate API call delay
            setTimeout(() => {
                const filtered = mockSuggestions.filter(item =>
                    item.title.toLowerCase().includes(value.toLowerCase()) ||
                    item.description.toLowerCase().includes(value.toLowerCase())
                );
                setSuggestions(filtered);
                setIsLoading(false);
            }, 300);
        } else {
            setSuggestions([]);
        }
    };

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsFocused(false);
            setSearchQuery('');
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSuggestions([]);
        setIsFocused(false);
    };

    // Select suggestion
    const handleSuggestionClick = (url: string) => {
        router.push(url);
        setIsFocused(false);
        setSearchQuery('');
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsFocused(false);
        }
    };

    return (
        <div className={styles.searchContainer} ref={searchRef}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputWrapper}>
                    <HiSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search posts, people..."
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
                {/* <button type="submit" className={styles.searchButton} aria-label="Submit search">
                    Search
                </button> */}
            </form>

            {/* Suggestions Dropdown */}
            {isFocused && (searchQuery || suggestions.length > 0) && (
                <div className={styles.suggestionsDropdown}>
                    {isLoading ? (
                        <div className={styles.loadingIndicator}>
                            <div className={styles.spinner}></div>
                            <span>Searching...</span>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <>
                            <div className={styles.suggestionsHeader}>
                                <span className={styles.suggestionsTitle}>Suggestions</span>
                                <span className={styles.suggestionsCount}>{suggestions.length} results</span>
                            </div>
                            <div className={styles.suggestionsList}>
                                {suggestions.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleSuggestionClick(item.url)}
                                        className={styles.suggestionItem}
                                    >
                                        <div className={styles.suggestionIcon}>
                                            {item.type === 'article' && '📄'}
                                            {item.type === 'user' && '👤'}
                                            {item.type === 'category' && '🏷️'}
                                        </div>
                                        <div className={styles.suggestionContent}>
                                            <div className={styles.suggestionTitle}>{item.title}</div>
                                            <div className={styles.suggestionDescription}>{item.description}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.searchAllButton}>
                                <button onClick={handleSearch}>
                                    Search for "{searchQuery}"
                                </button>
                            </div>
                        </>
                    ) : searchQuery ? (
                        <div className={styles.noResults}>
                            <span>No results found for "{searchQuery}"</span>
                        </div>
                    ) : (
                        <div className={styles.recentSearches}>
                            <div className={styles.suggestionsHeader}>
                                <span className={styles.suggestionsTitle}>Recent Searches</span>
                                <button className={styles.clearRecentButton}>Clear All</button>
                            </div>
                            <div className={styles.recentList}>
                                {['React', 'Next.js', 'TypeScript'].map((term, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSearchQuery(term)}
                                        className={styles.recentItem}
                                    >
                                        <HiSearch size={14} />
                                        {term}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;