export interface Comment {
    id: number;
    user_id: number;
    post_id: number;
    comment_text: string;
    created_at: string;
    updated_at: string;
    is_edited?: boolean;
    user: {
        id: number;
        full_name: string;
        image: string | null;
    };
}

export interface CommentsResponse {
    success: boolean;
    data: {
        data: Comment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    message: string;
}

export interface SingleCommentResponse {
    success: boolean;
    data: Comment;
    message: string;
}

export interface CommentsCountResponse {
    success: boolean;
    data: {
        post_id: number;
        comments_count: number;
    };
    message: string;
}


export const getPostComments = async (
    postId: number | string,
    page = 1,
    limit = 10
): Promise<CommentsResponse> => {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(
            `http://localhost:8000/api/v1/comments/post/${postId}?page=${page}&per_page=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error('❌ Error fetching comments:', error);
        throw error;
    }
};


export const getCommentsCount = async (
    postId: number | string
): Promise<CommentsCountResponse> => {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(
            `http://localhost:8000/api/v1/comments/count/${postId}`,
            {
                method: 'GET',
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
        console.error('❌ Error fetching comments count:', error);
        throw error;
    }
};


export const getComment = async (
    commentId: number | string
): Promise<SingleCommentResponse> => {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(
            `http://localhost:8000/api/v1/comments/${commentId}`,
            {
                method: 'GET',
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
        console.error('❌ Error fetching comment:', error);
        throw error;
    }
};