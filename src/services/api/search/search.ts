const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UserSearchResult {
    id: number;
    full_name: string;
    email: string;
    image: string | null;
    bio: string | null;
}

export interface PostSearchResult {
    id: number;
    title: string;
    caption: string;
    user: {
        id: number;
        full_name: string;
        image: string | null;
    };
    tags: Array<{
        id: number;
        tag_name: string;
    }>;
    created_at: string;
}

export interface TagSearchResult {
    id: number;
    tag_name: string;
}

export interface SearchResponse {
    success: boolean;
    query: string;
    type: string;
    results: {
        users: UserSearchResult[];
        posts: PostSearchResult[];
        tags: TagSearchResult[];
    };
    users_count: number;
    posts_count: number;
    tags_count: number;
    total: number;
    message?: string;
}

export interface QuickSearchResponse {
    success: boolean;
    query: string;
    results: {
        users: Array<{
            id: number;
            full_name: string;
            image: string | null;
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
    };
}

export const getSearch = async (
    query: string,
    type: string = 'all',
    limit: number = 15
): Promise<SearchResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
            { headers, cache: 'no-store' }
        );

        /* if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        } */

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching search results:', error);
        throw error;
    }
};

export const getQuickSearch = async (query: string): Promise<QuickSearchResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/search/quick?q=${encodeURIComponent(query)}`,
            { headers }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching quick search:', error);
        throw error;
    }
};