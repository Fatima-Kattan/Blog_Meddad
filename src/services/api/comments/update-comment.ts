import { Comment } from './get-comments';

export interface UpdateCommentData {
    comment_text: string;
}

export interface UpdateCommentResponse {
    success: boolean;
    data: Comment;
    message: string;
}


export const updateComment = async (
    commentId: number | string,
    data: UpdateCommentData
): Promise<UpdateCommentResponse> => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication required. Please login.');
        }

        const response = await fetch(
            `http://localhost:8000/api/v1/comments/${commentId}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error updating comment:', error);
        throw error;
    }
};