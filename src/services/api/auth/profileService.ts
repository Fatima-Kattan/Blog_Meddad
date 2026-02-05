// services/Profile.service.ts
import api from './api';

export interface UserProfile {
    id: number;
    full_name: string;
    image: string | null;
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
    likes?: Like[];
    comments?: Comment[];
    user?: {
        id: number;
        full_name: string;
        image: string;
        bio: string;
    };
}

export interface Like {
    id: number;
    user_id: number;
    post_id: number;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        full_name: string;
        image: string;
        email?: string;
    };
}

export interface Comment {
    id: number;
    user_id: number;
    post_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    user: {
        id: number;
        full_name: string;
        image: string;
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

export interface UserProfileResponse {
    success: boolean;
    message: string;
    data: {
        user: {
            id: number;
            full_name: string;
            email: string;
            phone_number: string;
            bio: string | null;
            birth_date: string;
            gender: string;
            image: string | null;
            created_at: string;
            updated_at: string;
            posts?: Post[];
            followers?: Follower[];
            following?: Following[];
        };
        stats: ProfileStats;
    };
}

// New interface for password update
export interface UpdatePasswordData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
}

export interface UpdatePasswordResponse {
    success: boolean;
    message: string;
    data?: {
        user: UserProfile;
        token: string;
        token_type: string;
    };
}

// New interface for account deletion
export interface DeleteAccountData {
    password: string;
}

export interface DeleteAccountResponse {
    success: boolean;
    message: string;
}

class ProfileService {
    // Get current user profile data
    async getUserProfile(): Promise<ProfileResponse> {
        try {
            const response = await api.get('/user');
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch profile data');
        }
    }

    async getUserId(): Promise<number | null> {
        try {
            const response = await api.get('/user');
            return response.data.data.user.id;
        } catch (error) {
            console.error('❌ Failed to get ID:', error);
            return null;
        }
    }

    // Get specific user profile by ID
    async getUserProfileById(userId: number | string): Promise<UserProfileResponse> {
        try {
            const response = await api.get(`/users/profile/${userId}`);
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to fetch user profile:', error);
            if (error.response?.status === 404) {
                throw new Error('User not found');
            }
            throw new Error('Failed to fetch user profile');
        }
    }

    // Update password
    async updatePassword(data: UpdatePasswordData): Promise<UpdatePasswordResponse> {
        try {
            const response = await api.put('/user/password', {
                current_password: data.current_password,
                new_password: data.new_password,
                new_password_confirmation: data.new_password_confirmation
            });
            
            return response.data;
            
        } catch (error: any) {
            console.error('❌ Failed to update password:', error);
            
            // Handle validation errors
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                
                if (errors?.current_password) {
                    throw new Error('Current password is incorrect');
                }
                
                if (errors?.new_password) {
                    const passwordError = errors.new_password[0];
                    throw new Error(passwordError);
                }
                
                if (errors?.new_password_confirmation) {
                    throw new Error('New passwords do not match');
                }
                
                throw new Error('Invalid data');
            }
            
            // Handle other errors
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            
            throw new Error('Failed to update password. Please try again');
        }
    }

    // Get specific post details with likes and comments
    async getPostDetails(postId: number): Promise<PostDetailResponse> {
        try {
            const endpoints = [
                `/posts/${postId}`,
                `/api/posts/${postId}`,
                `/post/${postId}`,
                `/post/details/${postId}`,
                `/api/post/${postId}`
            ];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await api.get(endpoint);
                    
                    if (response.data) {
                        return response.data;
                    }
                } catch (err: any) {
                    continue;
                }
            }
            
            // Default data
            return {
                success: true,
                message: 'Default data',
                data: {
                    id: postId,
                    user_id: 0,
                    title: 'Post title',
                    caption: 'Post description',
                    images: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    likes_count: 0,
                    comments_count: 0,
                    likes: [],
                    comments: [],
                }
            };
            
        } catch (error: any) {
            console.error(`❌ Failed to fetch post details ${postId}:`, error);
            
            return {
                success: true,
                message: 'Default data',
                data: {
                    id: postId,
                    user_id: 0,
                    title: 'Post title',
                    caption: 'Post description',
                    images: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    likes_count: 0,
                    comments_count: 0,
                    likes: [],
                    comments: [],
                }
            };
        }
    }

    // Update profile data
    async updateProfile(data: UpdateProfileData): Promise<UpdateProfileResponse> {
        try {
            const response = await api.put('/user/profile', data);
            return response.data;
        } catch (error) {
            throw new Error('Failed to update profile');
        }
    }

    // Get all user posts with details
    async getUserPostsWithDetails(userId?: number | string): Promise<Post[]> {
        try {
            let posts: Post[] = [];
            
            if (userId) {
                const profileResponse = await this.getUserProfileById(userId);
                posts = profileResponse.data.user.posts || [];
            } else {
                const profileResponse = await this.getUserProfile();
                posts = profileResponse.data.user.posts || [];
            }
            
            if (posts.length === 0) {
                return [];
            }
            
            const postsWithDetails = await Promise.all(
                posts.map(async (post: Post) => {
                    try {
                        const postDetail = await this.getPostDetails(post.id);
                        return {
                            ...post,
                            likes: postDetail.data.likes || [],
                            comments: postDetail.data.comments || [],
                            likes_count: postDetail.data.likes_count || post.likes_count || 0,
                            comments_count: postDetail.data.comments_count || post.comments_count || 0,
                            images: postDetail.data.images || post.images || [],
                            title: postDetail.data.title || post.title || '',
                            caption: postDetail.data.caption || post.caption || ''
                        };
                    } catch (err) {
                        console.error(`⚠️ Failed to fetch post details ${post.id}:`, err);
                        return {
                            ...post,
                            likes: [],
                            comments: [],
                            likes_count: post.likes_count || 0,
                            comments_count: post.comments_count || 0,
                            images: post.images || [],
                            title: post.title || '',
                            caption: post.caption || ''
                        };
                    }
                })
            );
            
            return postsWithDetails;
            
        } catch (error) {
            console.error('❌ Failed to fetch posts:', error);
            throw new Error('Failed to fetch posts');
        }
    }

    // Get all user posts without details
    async getUserPosts(userId?: number | string): Promise<Post[]> {
        try {
            if (userId) {
                const profileResponse = await this.getUserProfileById(userId);
                return profileResponse.data.user.posts || [];
            } else {
                const profileResponse = await this.getUserProfile();
                return profileResponse.data.user.posts || [];
            }
        } catch (error) {
            throw new Error('Failed to fetch posts');
        }
    }

    // Get likes for specific post
    async getPostLikes(postId: number): Promise<Like[]> {
        try {
            const postDetail = await this.getPostDetails(postId);
            return postDetail.data.likes || [];
        } catch (error) {
            console.error(`❌ Failed to fetch post likes ${postId}:`, error);
            return [];
        }
    }

    // Get comments for specific post
    async getPostComments(postId: number): Promise<Comment[]> {
        try {
            const postDetail = await this.getPostDetails(postId);
            return postDetail.data.comments || [];
        } catch (error) {
            console.error(`❌ Failed to fetch post comments ${postId}:`, error);
            return [];
        }
    }

    // Get current ID
    async getCurrentUserId(): Promise<number | null> {
        try {
            const storedId = localStorage.getItem('user_id');
            if (storedId) {
                return parseInt(storedId);
            }
            
            const response = await api.get('/user');
            const userId = response.data.data.user.id;
            
            localStorage.setItem('user_id', userId.toString());
            
            return userId;
        } catch (error) {
            console.error('❌ Failed to fetch current ID:', error);
            return null;
        }
    }

    // Account deletion function
    async deleteAccount(password: string): Promise<DeleteAccountResponse> {
        try {
            const response = await api.delete('/user/account', {
                data: { password }
            });
            return response.data;
        } catch (error: any) {
            console.error('❌ Failed to delete account:', error);
            
            if (error.response?.status === 422) {
                throw new Error('Incorrect password');
            }
            
            if (error.response?.status === 401) {
                throw new Error('Unauthorized to delete account');
            }
            
            throw new Error('Failed to delete account. Please try again');
        }
    }
}

export default new ProfileService();