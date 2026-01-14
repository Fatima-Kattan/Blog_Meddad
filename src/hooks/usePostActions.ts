// src/hooks/usePostActions.ts
import { useState } from 'react';
import { updatePost, UpdatePostData } from '@/services/api/posts/update-post';

export interface UpdatedPost {
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
    updated_at: string;
    tags?: Array<{
        id: number;
        tag_name: string;
    }>;
}

export const usePostActions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdatePost = async (
        postData: UpdatePostData, 
        onSuccess?: (updatedPost: UpdatedPost) => void
    ) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await updatePost(postData, token);
            
            if (onSuccess && response.success) {
                const updatedPost: UpdatedPost = {
                    id: response.data.id,
                    user: response.data.user,
                    title: response.data.title,
                    caption: response.data.caption,
                    images: response.data.images || [],
                    likes_count: response.data.likes_count,
                    comments_count: response.data.comments_count,
                    created_at: response.data.created_at,
                    updated_at: response.data.updated_at,
                    tags: response.data.tags || []
                };
                onSuccess(updatedPost);
            }
            
            return response;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        handleUpdatePost,
        isLoading,
        error
    };
};