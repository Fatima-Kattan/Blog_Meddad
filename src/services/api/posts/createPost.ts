// src/services/api/posts/createPost.ts


export interface CreatePostData {
    title: string;
    caption: string;
    images: string[]; 
}

export interface CreatePostResponse {
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
            image: string | null;
        };
    };
    message: string;
}


export const createPost = async (data: CreatePostData, token: string): Promise<CreatePostResponse> => {
    try {
        console.log('📤 Sending POST request to: http://localhost:8000/api/v1/posts');
        console.log('📦 Request data:', data);

        const response = await fetch('http://localhost:8000/api/v1/posts', {
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

        try {
            const result = JSON.parse(responseText);
            
            if (!response.ok) {
                
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(result.message || `HTTP ${response.status}`);
            }

            return result;

        } catch (jsonError) {
            console.error('❌ JSON parse error:', jsonError);
            throw new Error(`Invalid JSON from server`);
        }

    } catch (error: any) {
        console.error('🔥 Create post request failed:', error);
        throw error;
    }
};