// services/api/posts/update-post.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UpdatePostData {
    post_id: number;
    title: string;
    caption: string;
    images: string[];
}

export interface UpdatePostResponse {
    success: boolean;
    data: any;
    message: string;
}

export const updatePost = async (postData: UpdatePostData, token: string): Promise<UpdatePostResponse> => {
    try {
        console.log('📤 Sending update request for post ID:', postData.post_id);
        
        const response = await fetch(
            `${API_URL}/api/v1/posts/${postData.post_id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    title: postData.title,
                    caption: postData.caption,
                    images: postData.images
                }),
            }
        );

        console.log('📥 Update response status:', response.status);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch {
                errorData = { message: `HTTP error! status: ${response.status}` };
            }
            console.error('❌ Update error:', errorData);
            throw new Error((errorData as any).message || `Failed to update post: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Post update successful:', data);
        return data;

    } catch (error) {
        console.error('❌ Error updating post:', error);
        throw error;
    }
};