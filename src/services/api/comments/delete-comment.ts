export interface DeleteCommentResponse {
    success: boolean;
    message: string;
    remaining_comments?: number;
}

// دالة حذف تعليق
export const deleteComment = async (
    commentId: number | string
): Promise<DeleteCommentResponse> => {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            throw new Error('Authentication required. Please login.');
        }

        const response = await fetch(
            `http://localhost:8000/api/v1/comments/${commentId}`,
            {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('❌ Error deleting comment:', error);
        throw error;
    }
};