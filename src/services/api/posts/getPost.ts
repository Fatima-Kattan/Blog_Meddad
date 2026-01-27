// services/api/posts/get-posts.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Post {
    id: number;
    user_id: number;
    title: string;
    caption: string;
    images: string[];
    likes_count: number;
    comments_count: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        full_name: string;
        image: string;
    };
    likes?: any[];
    comments?: any[];
    tags?: any[];
    _count?: {
        likes: number;
        comments: number;
    };
}

export interface PostsResponse {
    success: boolean;
    data: {
        data: Post[];
        current_page: number;
        last_page: number;
        total: number;
    };
    message?: string;
}

// 🔹 1. دالة لجلب كل البوستات
export const getPosts = async (page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/posts?page=${page}&limit=${limit}`,
            { headers, cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 getPosts response:', {
            success: data.success,
            postsCount: data.data?.data?.length || 0
        });
        
        return data;

    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
};

// 🔹 2. دالة لجلب بوست واحد
export const getPost = async (id: number): Promise<{success: boolean; data: Post; message?: string}> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/posts/${id}`,
            { headers, cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
};

// 🔹 3. دالة لجلب بوستات مستخدم
export const getUserPosts = async (userId: number, page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/posts/user/${userId}?page=${page}&limit=${limit}`,
            { headers, cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching user posts:', error);
        throw error;
    }
};

// 🔹 4. دالة للبحث في البوستات
export const searchPosts = async (keyword: string, page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
            `${API_URL}/api/v1/posts/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`,
            { headers, cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error searching posts:', error);
        throw error;
    }
};

// 🔹 5. دالة لجلب معلومات التاغ
export const getTagInfo = async (tagId: number): Promise<{success: boolean; data: any; message?: string}> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`🔗 [getTagInfo] Fetching tag info for ID: ${tagId}`);
        
        const response = await fetch(
            `${API_URL}/api/v1/tags/${tagId}`,
            { headers, cache: 'no-store' }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching tag info:', error);
        return {
            success: false,
            data: null,
            message: error instanceof Error ? error.message : 'Failed to fetch tag info'
        };
    }
};

// 🔹 6. دالة جديدة: جلب البوستات حسب التاغ ID (المعدلة والمدمجة)
export const getPostsByTagId = async (tagId: number, page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: Record<string, string> = {
            'Accept': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log(`🔗 [getPostsByTagId] Fetching posts for tag ID: ${tagId}, page: ${page}`);
        
        const apiUrl = `${API_URL}/api/v1/post-tags/tag/${tagId}/posts?page=${page}&limit=${limit}`;
        console.log(`🔗 API URL: ${apiUrl}`);
        
        const response = await fetch(apiUrl, { headers, cache: 'no-store' });

        console.log(`🔗 Response status: ${response.status}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('🔍 [getPostsByTagId] Response structure:', {
            success: data.success,
            hasData: !!data.data,
            dataKeys: data.data ? Object.keys(data.data) : [],
            hasTag: !!(data.data && data.data.tag),
            hasPosts: !!(data.data && data.data.posts),
            postsInTag: data.data?.tag?.posts?.length || 0,
            postsInData: data.data?.posts?.data?.length || 0
        });
        
        let postsData: Post[] = [];
        let currentPage = 1;
        let lastPage = 1;
        let total = 0;
        
        if (data.success && data.data && data.data.posts) {
            // 👇 **المشكلة: البوستات في data.posts.data ما عندها user object**
            const rawPosts = data.data.posts.data || [];
            // 👇 **الحل: نأخذ معلومات الـ user من data.tag.posts**
            const tagPostsWithUsers = data.data.tag?.posts || [];
            
            console.log(`📊 [getPostsByTagId] Found ${rawPosts.length} raw posts and ${tagPostsWithUsers.length} posts with user info`);
            
            // 🔧 **دمج البيانات: نأخذ البوستات من posts.data ونضيف لها user من tag.posts**
            postsData = rawPosts.map((post: any) => {
                // البحث عن الـ user object المقابل لهذا البوست في tag.posts
                const postWithUser = tagPostsWithUsers.find((p: any) => p.id === post.id);
                
                let userObj = null;
                let tags = [];
                
                if (postWithUser) {
                    // ⭐ **إذا وجدنا الـ user في tag.posts، ندمجه مع البوست**
                    if (postWithUser.user) {
                        userObj = {
                            id: postWithUser.user.id || post.user_id || 0,
                            full_name: postWithUser.user.full_name || 'Unknown User',
                            image: postWithUser.user.image || ''
                        };
                    }
                    
                    // ⭐ **نأخذ التاغات من tag.posts أيضاً**
                    tags = postWithUser.tags || [];
                }
                
                // ⭐ **إذا ما لقينا user في tag.posts، ننشئ user object من user_id فقط**
                if (!userObj) {
                    userObj = {
                        id: post.user_id || 0,
                        full_name: 'Unknown User',
                        image: ''
                    };
                }
                
                // ⭐ **إنشاء البوست النهائي**
                return {
                    id: post.id || 0,
                    user_id: post.user_id || userObj.id,
                    title: post.title || '',
                    caption: post.caption || '',
                    images: post.images || [],
                    likes_count: post.likes_count || 0,
                    comments_count: post.comments_count || 0,
                    created_at: post.created_at || new Date().toISOString(),
                    updated_at: post.updated_at || post.created_at || new Date().toISOString(),
                    user: userObj,
                    tags: tags,
                    likes: [],
                    comments: [],
                    _count: {
                        likes: post.likes_count || 0,
                        comments: post.comments_count || 0
                    }
                };
            });
            
            currentPage = data.data.posts.current_page || 1;
            lastPage = data.data.posts.last_page || 1;
            total = data.data.posts.total || 0;
            
            console.log(`✅ [getPostsByTagId] Merged ${postsData.length} posts with user info`);
            if (postsData.length > 0) {
                console.log('🔍 [getPostsByTagId] First merged post:', {
                    id: postsData[0].id,
                    hasUser: !!postsData[0].user,
                    userName: postsData[0].user?.full_name,
                    userId: postsData[0].user?.id,
                    userImage: postsData[0].user?.image,
                    tagsCount: postsData[0].tags?.length || 0
                });
            }
        } else if (data.success && data.data && Array.isArray(data.data.data)) {
            // Fallback: إذا كان الهيكل مختلف
            postsData = data.data.data.map((post: any) => ({
                ...post,
                user: post.user || {
                    id: post.user_id || 0,
                    full_name: 'Unknown User',
                    image: ''
                },
                tags: post.tags || []
            }));
            
            currentPage = data.data.current_page || 1;
            lastPage = data.data.last_page || 1;
            total = data.data.total || 0;
            
            console.log(`✅ [getPostsByTagId] Extracted ${postsData.length} posts from data.data`);
        }
        
        console.log(`✅ [getPostsByTagId] Total posts: ${postsData.length}`);
        console.log('📊 [getPostsByTagId] Pagination:', { 
            currentPage, 
            lastPage, 
            total, 
            hasMore: currentPage < lastPage 
        });
        
        return {
            success: true,
            data: {
                data: postsData,
                current_page: currentPage,
                last_page: lastPage,
                total: total
            },
            message: 'Posts fetched successfully'
        };

    } catch (error) {
        console.error('❌ [getPostsByTagId] Error fetching posts by tag ID:', error);
        return {
            success: false,
            data: {
                data: [],
                current_page: 1,
                last_page: 1,
                total: 0
            },
            message: error instanceof Error ? error.message : 'Failed to fetch posts by tag'
        };
    }
};

// 🔹 7. دالة بديلة: جلب التاغ بالاسم أولاً ثم البحث
export const getPostsByTagName = async (tagName: string, page = 1, limit = 10): Promise<PostsResponse> => {
    try {
        // نبحث عن البوستات اللي فيها التاغ بالاسم
        return await searchPosts(`#${tagName}`, page, limit);
    } catch (error) {
        console.error('Error fetching posts by tag name:', error);
        throw error;
    }
};