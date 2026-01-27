// services/api/posts/get-user-posts.ts
import api from '@/services/api/auth/api';
import { Post } from '@/services/api/posts/get-posts';

export interface UserPostsResponse {
    success: boolean;
    message: string;
    data: {
        data: Post[];
        current_page: number;
        last_page: number;
        total: number;
    };
}

export const getUserPosts = async (userId: number, page = 1, limit = 10): Promise<UserPostsResponse> => {
    try {
        const response = await api.get(`/posts/user/${userId}`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error: any) {
        throw error;
    }
};