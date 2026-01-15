'use client';

import { useState, useCallback } from 'react';
import { getSearch, getQuickSearch, SearchResponse } from '@/services/api/search/search';

// تعريف الأنواع
export interface QuickSearchResult {
    users: Array<{
        id: number;
        full_name: string;
        image: string | null;
        email?: string;
    }>;
    posts: Array<{
        id: number;
        title: string;
        user_id: number;
        user?: {
            id: number;
            full_name: string;
            image: string | null;
        };
    }>;
    tags: Array<{
        id: number;
        tag_name: string;
    }>;
}

export const useSearch = () => {
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback(async (query: string, type: string = 'all') => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getSearch(query, type);
            setResults(data);
        } catch (err: any) {
            setError(err.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    }, []);

    const quickSearch = useCallback(async (query: string): Promise<QuickSearchResult> => {
        if (!query.trim() || query.length < 2) {
            return { users: [], posts: [], tags: [] };
        }

        try {
            const data = await getQuickSearch(query);
            
            return {
                users: data.results?.users || [],
                posts: data.results?.posts || [],
                tags: data.results?.tags || []
            };
        } catch {
            return { users: [], posts: [], tags: [] };
        }
    }, []);

    const clearResults = useCallback(() => {
        setResults(null);
        setError(null);
    }, []);

    return {
        results,
        loading,
        error,
        search,
        quickSearch,
        clearResults
    };
};