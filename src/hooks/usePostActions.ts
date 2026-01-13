// src/hooks/usePostActions.ts
import { useState } from 'react';
import { updatePost, UpdatePostData } from '@/services/api/posts/update-post';

export const usePostActions = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdatePost = async (postData: UpdatePostData, onSuccess?: () => void) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }
            
            const response = await updatePost(postData, token);
            
            if (onSuccess) {
                onSuccess();
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