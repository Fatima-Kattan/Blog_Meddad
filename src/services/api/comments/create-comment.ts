import { Comment } from './get-comments';

export interface CreateCommentData {
    post_id: number | string;
    comment_text: string;
}

export interface CreateCommentResponse {
    success: boolean;
    data: Comment;
    message: string;
    comments_count?: number;
}


export const createComment = async (
    data: CreateCommentData
): Promise<CreateCommentResponse> => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication required. Please login.');
        }

        console.log('📤 Creating comment:', data);

        const response = await fetch('http://localhost:8000/api/v1/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const responseText = await response.text();
        console.log('📨 Response status:', response.status);
        console.log('📄 Response:', responseText);

        if (responseText.trim().startsWith('<!DOCTYPE')) {
            throw new Error(`Server error ${response.status}: Received HTML page`);
        }

        const result = JSON.parse(responseText);

        if (!response.ok) {
            
            if (result.errors) {
                const errorMessages = Object.values(result.errors).flat().join(', ');
                throw new Error(errorMessages);
            }
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        return result;

    } catch (error: any) {
        console.error('🔥 Create comment request failed:', error);
        throw error;
    }
};