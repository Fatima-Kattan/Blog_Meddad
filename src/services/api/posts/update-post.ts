// services/api/posts/update-post.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UpdatePostData {
    post_id: number;
    title: string;
    caption: string;
    images: string[];
    tags?: string[]; 
}

export interface UpdatePostResponse {
    success: boolean;
    data: {
        id: number;
        user_id: number;
        title: string;
        caption: string;
        images: string[];
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            full_name: string;
            image: string;
        };
        likes_count: number;
        comments_count: number;
        tags?: Array<{ 
            id: number;
            tag_name: string;
        }>;
    };
    message: string;
}


export const updatePost = async (postData: UpdatePostData, token: string): Promise<UpdatePostResponse> => {
    try {
        console.log('📤 Sending update request for post ID:', postData.post_id);
        console.log('📝 Post data to update:', {
            title: postData.title,
            caption: postData.caption,
            imagesCount: postData.images?.length || 0,
            hasTagsInCaption: postData.caption?.includes('#')
        });
        
        
        const requestBody: any = {
            title: postData.title,
            caption: postData.caption,
        };

        
        if (postData.images && postData.images.length > 0) {
            requestBody.images = postData.images;
        }

        
        // if (postData.tags && postData.tags.length > 0) {
        //     requestBody.tags = postData.tags;
        // }

        const response = await fetch(
            `${API_URL}/api/v1/posts/${postData.post_id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
                body: JSON.stringify(requestBody),
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
        console.log('✅ Post update successful:', {
            id: data.data.id,
            title: data.data.title,
            tagsCount: data.data.tags?.length || 0,
            tags: data.data.tags || []
        });
        return data;

    } catch (error) {
        console.error('❌ Error updating post:', error);
        throw error;
    }
};


export const syncPostTags = async (postId: number, tagIds: number[], token: string) => {
    try {
        console.log('🔄 Syncing tags for post ID:', postId, 'Tags:', tagIds);
        
        const response = await fetch(
            `${API_URL}/api/v1/post-tags/${postId}/sync`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ tag_ids: tagIds }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to sync tags');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error syncing tags:', error);
        throw error;
    }
};


export const addTagToPost = async (postId: number, tagId: number, token: string) => {
    try {
        console.log('➕ Adding tag to post:', { postId, tagId });
        
        const response = await fetch(
            `${API_URL}/api/v1/post-tags/${postId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ tag_id: tagId }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add tag');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error adding tag:', error);
        throw error;
    }
};


export const removeTagFromPost = async (postId: number, tagId: number, token: string) => {
    try {
        console.log('➖ Removing tag from post:', { postId, tagId });
        
        const response = await fetch(
            `${API_URL}/api/v1/post-tags/${postId}/${tagId}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove tag');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error removing tag:', error);
        throw error;
    }
};


export const getPostTags = async (postId: number, token?: string) => {
    try {
        console.log('🏷️ Fetching tags for post ID:', postId);
        
        const headers: HeadersInit = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(
            `${API_URL}/api/v1/post-tags/${postId}`,
            {
                method: 'GET',
                headers,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch post tags');
        }

        const data = await response.json();
        console.log('✅ Post tags fetched:', data.data?.length || 0, 'tags');
        return data;
    } catch (error) {
        console.error('❌ Error fetching post tags:', error);
        throw error;
    }
};