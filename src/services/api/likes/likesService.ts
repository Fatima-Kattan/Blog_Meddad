// src/services/api/likes/likesService.ts
import api from '@/services/api/auth/api';

export interface LikeUser {
    id: number;
    full_name: string;
    image: string | null;
}

export interface Like {
    id: number;
    user_id: number;
    post_id: number;
    user: LikeUser;
    created_at: string;
}

export interface LikesResponse {
    success: boolean;
    data: {
        post: {
            id: number;
            title: string;
        };
        likes: {
            data: Like[];
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
        total_likes: number;
    };
    message: string;
}

class LikesService {
    // جلب الإعجابات لمنشور محدد
    async getPostLikes(postId: number, page: number = 1) {
        try {
            const response = await api.get<LikesResponse>(
                `/posts/${postId}/likes`,
                {
                    params: { page }
                }
            );
            console.log('Likes response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error fetching likes:', error.response?.data || error.message);
            throw error;
        }
    }

    // toggle like
    async toggleLike(postId: number) {
        try {
            const response = await api.post('/likes/toggle', {
                post_id: postId
            });
            console.log('Toggle response:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('Error toggling like:', error.response?.data || error.message);
            throw error;
        }
    }

    // get my likes
    async getMyLikes() {
        try {
            const response = await api.get('/likes/my-likes');
            return response.data;
        } catch (error: any) {
            console.error('Error getting my likes:', error.response?.data || error.message);
            throw error;
        }
    }

    async checkUserLike(postId: number) {
    try {
        const response = await api.post('/likes/check', {
            post_id: postId
        });
        return response.data.data.is_liked || response.data.data.has_liked || false;
    } catch (error: any) {
        console.error('[Service] Error checking like:', error.response?.data || error.message);
        return false;
    }
}
}



export default new LikesService();