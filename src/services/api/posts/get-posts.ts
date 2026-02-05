// services/api/posts/get-posts.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Post {
    id: number;
    user: {
        id: number;
        full_name: string;
        image: string;
    };
    title: string;
    caption: string;
    images: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    
}

export interface PostsResponse {
    success: boolean;
    data: any; 
    message: string;
}

export const getPosts = async (page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        const response = await fetch(
            `${API_URL}/api/v1/posts?page=${page}&per_page=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};