// services/api/posts/get-user-posts.ts
import api from '@/services/api/auth/api';
import { Post } from '@/services/api/posts/get-posts';

export interface UserStats {
    total_posts: number;
    most_liked: number;
    latest_post: number;
    total_comments: number;
}

export interface UserStatsResponse {
    success: boolean;
    message: string;
    data: {
        stats: UserStats;
        user_info: {
            id: number;
            full_name: string;
            image: string;
        };
        top_post: {
            id: number;
            title: string;
            likes_count: number;
        } | null;
    };
}


export interface FilteredPostsResponse {
    success: boolean;
    message: string;
    filter: string;
    sort: string;
    data: Post[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    has_more?: boolean; 
}


export const getUserStats = async (userId: number): Promise<UserStatsResponse> => {
    try {
        const response = await api.get(`/user/${userId}/stats`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching user stats:', error);
        throw error;
    }
};


export const getFilteredUserPosts = async (
    userId: number, 
    filter = 'all', 
    sort = 'newest', 
    page = 1, 
    limit = 50 // ⭐ زد الـ limit إلى 50
): Promise<FilteredPostsResponse> => {
    try {
        const response = await api.get(`/user/${userId}/posts/filter`, {
            params: { filter, sort, page, limit }
        });
        return response.data;
    } catch (error: any) {
        console.error('Error fetching filtered posts:', error);
        throw error;
    }
};