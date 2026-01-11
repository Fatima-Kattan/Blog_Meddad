// services/Profile.service.ts
import api from './api';

export interface UserProfile {
    id: number;
    full_name: string;
    image: string;
    bio: string;
    email: string;
    phone_number?: string;
    gender?: string;
    birth_date?: string;
    created_at: string;
    followers?: Follower[];
    following?: Following[];
    posts?: Post[];
}

export interface Follower {
    id: number;
    full_name: string;
    image: string;
}

export interface Following {
    id: number;
    full_name: string;
    image: string;
}

export interface Post {
    id: number;
    user_id: number;
    title: string;
    caption: string;
    images: string[];
    created_at: string;
    updated_at: string;
    likes_count: number;
    comments_count: number;
    likes?: Array<{
        id: number;
        user_id: number;
        post_id: number;
        created_at: string;
        updated_at: string;
        user: {
            id: number;
            full_name: string;
            image: string;
        };
    }>;
    comments?: Array<any>;
    user?: {
        id: number;
        full_name: string;
        image: string;
        bio: string;
    };
}

export interface ProfileStats {
    posts_count: number;
    followers_count: number;
    following_count: number;
    likes_count: number;
    comments_count: number;
}

export interface ProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: UserProfile;
        stats: ProfileStats;
    };
}

export interface PostDetailResponse {
    success: boolean;
    data: Post;
    message: string;
}

export interface UpdateProfileData {
    full_name?: string;
    email?: string;
    bio?: string;
    image?: string;
    phone_number?: string;
    gender?: string;
    birth_date?: string;
}

export interface UpdateProfileResponse {
    success: boolean;
    message: string;
    data: UserProfile;
}

class ProfileService {
    // الحصول على بيانات البروفايل
    async getUserProfile(): Promise<ProfileResponse> {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw new Error('فشل في جلب بيانات البروفايل');
        }
    }

    // الحصول على تفاصيل منشور معين
    async getPostDetails(postId: number): Promise<PostDetailResponse> {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response.data;
        } catch (error) {
            throw new Error('فشل في جلب تفاصيل المنشور');
        }
    }

    // تحديث بيانات البروفايل
    async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
        try {
            const response = await api.put('/user/profile', data);
            return response.data;
        } catch (error) {
            throw new Error('فشل في تحديث البروفايل');
        }
    }

    // الحصول على جميع منشورات المستخدم مع تفاصيلها
    async getUserPostsWithDetails(): Promise<Post[]> {
        try {
            const response = await api.get('/user');
            const posts = response.data.data.user.posts || [];
            
            // جلب تفاصيل كل منشور للحصول على المعجبين
            const postsWithDetails = await Promise.all(
                posts.map(async (post: Post) => {
                    try {
                        const postDetail = await this.getPostDetails(post.id);
                        return {
                            ...post,
                            likes: postDetail.data.likes || [],
                            comments: postDetail.data.comments || [],
                            user: postDetail.data.user
                        };
                    } catch (err) {
                        console.error(`Error fetching details for post ${post.id}:`, err);
                        return post; // إذا فشل جلب التفاصيل، نستخدم المنشور الأساسي
                    }
                })
            );
            
            return postsWithDetails;
        } catch (error) {
            throw new Error('فشل في جلب المنشورات');
        }
    }

    // الحصول على جميع منشورات المستخدم بدون تفاصيل
    async getUserPosts(): Promise<Post[]> {
        try {
            const response = await api.get('/user');
            return response.data.data.user.posts || [];
        } catch (error) {
            throw new Error('فشل في جلب المنشورات');
        }
    }
}

export default new ProfileService();