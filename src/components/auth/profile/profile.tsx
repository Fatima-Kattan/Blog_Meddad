'use client'
// components/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './profile.css';
import ProfileService, {
    UserProfile,
    ProfileStats,
    Post as ProfilePost,
    UpdateProfileData,
    ProfileResponse,
    UserProfileResponse
} from '@/services/api/auth/profileService';
import { FaRegLightbulb } from "react-icons/fa6";
import MyFollowing from '../../follow/myFollowing/MyFollowing'
import { HiArrowNarrowRight, HiOutlineLightBulb } from 'react-icons/hi';
import MyFollowers from '@/components/follow/myFollowers/MyFollowers';
import InputField from '@/components/shared/InputField';
import SelectField from '@/components/shared/SelectField';
import DatePickerField from '@/components/shared/DatePickerField';
import { MdEdit, MdOutlineEmail, MdDelete, MdLock } from 'react-icons/md';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostItem from '@/components/posts/post-item/PostItem';
import axios from 'axios';
import UserPostsFeed from '@/components/auth/profile/UserPostsFeed';

type TabType = 'overview' | 'posts' | 'followers' | 'following';

interface ProfileProps {
    userId?: string | number;
    isOwnProfile?: boolean;
}

interface ApiPost {
    id: number;
    user_id: number;
    title: string;
    caption: string;
    images: string[];
    created_at: string;
    likes_count: number;
    comments_count: number;
    user: {
        id: number;
        full_name: string;
        image: string;
    };
    likes: any[];
    comments: any[];
    tags: any[];
}

interface UserPostsResponse {
    success: boolean;
    data: {
        user: {
            id: number;
            full_name: string;
            image: string;
            bio: string;
            created_at: string;
        };
        posts: {
            current_page: number;
            data: ApiPost[];
            total: number;
            last_page: number;
        };
        stats: {
            total_posts: number;
            total_likes: number;
            total_comments: number;
        };
    };
    message: string;
}

// مكون المودال لتعديل كلمة السر
interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: {
        current_password: string;
        new_password: string;
        new_password_confirmation: string;
    }) => Promise<void>;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({
    isOpen,
    onClose,
    onUpdate
}) => {
    const [formData, setFormData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError('');
        setFieldErrors({});

        // التحقق من صحة المدخلات
        if (!formData.current_password.trim()) {
            setFieldErrors(prev => ({ ...prev, current_password: 'Please enter your current password' }));
            return;
        }

        if (!formData.new_password.trim()) {
            setFieldErrors(prev => ({ ...prev, new_password: 'Please enter new password' }));
            return;
        }

        if (formData.new_password.length < 8) {
            setFieldErrors(prev => ({ ...prev, new_password: 'Password must be at least 8 characters' }));
            return;
        }

        if (formData.new_password !== formData.new_password_confirmation) {
            setFieldErrors(prev => ({ ...prev, new_password_confirmation: 'Passwords do not match' }));
            return;
        }

        if (formData.current_password === formData.new_password) {
            setFieldErrors(prev => ({ ...prev, new_password: 'New password must be different from current password' }));
            return;
        }

        setIsUpdating(true);
        setError('');
        setSuccess('');

        try {
            await onUpdate(formData);
            setSuccess('Password updated successfully!');

            // إعادة تعيين النموذج بعد النجاح
            setTimeout(() => {
                setFormData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'An error occurred while updating password');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (error) setError('');
        if (success) setSuccess('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Change Password</h2>
                    <button className="modal-close_delete" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <InputField
                                label="Current Password"
                                name="current_password"
                                type="password"
                                value={formData.current_password}
                                onChange={handleInputChange}
                                placeholder="Enter current password"
                                required={true}
                                error={fieldErrors.current_password}
                                disabled={isUpdating}
                            />
                        </div>

                        <div className="form-group">
                            <InputField
                                label="New Password"
                                name="new_password"
                                type="password"
                                value={formData.new_password}
                                onChange={handleInputChange}
                                placeholder="Enter new password (min 8 characters)"
                                required={true}
                                error={fieldErrors.new_password}
                                disabled={isUpdating}
                            />
                            <div className="warning-message-password">
                                Password must be at least 8 characters
                            </div>
                        </div>

                        <div className="form-group">
                            <InputField
                                label="Confirm New Password"
                                name="new_password_confirmation"
                                type="password"
                                value={formData.new_password_confirmation}
                                onChange={handleInputChange}
                                placeholder="Confirm new password"
                                required={true}
                                error={fieldErrors.new_password_confirmation}
                                disabled={isUpdating}
                            />
                        </div>


                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        {success && (
                            <div className="success-message">{success}</div>
                        )}

                        {/*   <div className="password-tips">
                            <h4>Password Tips:</h4>
                            <ul>
                                <li>✓ Use at least 8 characters</li>
                                <li>✓ Mix letters, numbers, and symbols</li>
                                <li>✓ Avoid common words or patterns</li>
                                <li>✓ Don't reuse old passwords</li>
                            </ul>
                        </div> */}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Updating...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// مكون المودال لحذف الحساب باللغة الإنجليزية
interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDelete: (password: string) => Promise<void>;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isOpen,
    onClose,
    onDelete
}) => {
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) {
            setError('Please enter your password');
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await onDelete(password);
        } catch (err: any) {
            setError(err.message || 'An error occurred while deleting your account');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Delete Account</h2>
                    <button className="modal-close_delete" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="modal-body">
                    <div className="warning-message">
                        <div className="warning-icon">⚠️</div>
                        <h3>Important Warning!</h3>
                        <p>
                            By deleting your account, you will:
                            <strong>This action cannot be undone.</strong>
                        </p>
                        <ul>
                            <li>❌ Permanently delete all your posts</li>
                            <li>❌ Delete all your comments and likes</li>
                            <li>❌ Remove all your followers and following</li>
                            <li>❌ Lose all data associated with your account</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className="delete-form">
                        <div className="form-group">
                            {/*  <label className="form-label">
                                Enter your password to confirm
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                className="form-input"
                                placeholder="Current password"
                                disabled={isDeleting}
                            /> */}
                            <div className="form-group">
                                <InputField
                                    label="Enter your password to confirm"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                    placeholder="Current password"
                                    required
                                    disabled={isDeleting}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="error-message">{error}</div>
                        )}

                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-delete"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="loading-spinner"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Account'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Profile: React.FC<ProfileProps> = ({ userId: propUserId, isOwnProfile: propIsOwnProfile }) => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const urlUserId = params?.id as string;
    const queryUserId = searchParams?.get('id');
    const targetUserId = propUserId || urlUserId || queryUserId;

    const [isOwnProfile, setIsOwnProfile] = useState(propIsOwnProfile || false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [profilePosts, setProfilePosts] = useState<ProfilePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [today, setToday] = useState('');

    // States for delete account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // States for password update
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Improved function to extract ID from token
    const getCurrentUserIdFromToken = (): string | number | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('❌ No token in localStorage');
                return null;
            }

            try {
                // Check if token is valid and in JWT format
                if (typeof token !== 'string') {
                    console.log('⚠️ Token is not a string');
                    return null;
                }

                // Check if token contains two dots (JWT format)
                const parts = token.split('.');
                if (parts.length !== 3) {
                    console.log('⚠️ Token is not in valid JWT format');
                    return null;
                }

                // Try to decode Base64
                const payloadBase64 = parts[1];

                // Add padding if necessary
                const paddedBase64 = payloadBase64.padEnd(payloadBase64.length + (4 - payloadBase64.length % 4) % 4, '=');

                // Decode
                const payloadJson = atob(paddedBase64);

                // Parse JSON
                const payload = JSON.parse(payloadJson);

                // Search for ID in possible places
                const userId = payload.id || payload.user_id || payload.userId || payload.sub || payload.user?.id;

                if (userId) {
                    return userId;
                } else {
                    return null;
                }
            } catch (parseError) {
                console.error('❌ Error parsing JWT token:', parseError);
                return null;
            }
        } catch (error) {
            console.error('❌ Error in getCurrentUserIdFromToken:', error);
            return null;
        }
    };

    // Alternative safer function to extract ID from token
    const getCurrentUserIdFromTokenAlternative = (): string | number | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            let payload;
            try {
                // Check if token is a string and has length
                if (typeof token !== 'string' || token.length < 10) {
                    console.warn('Invalid token');
                    return null;
                }

                // Try JWT first
                const parts = token.split('.');
                if (parts.length === 3) {
                    try {
                        const base64Url = parts[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                        }).join(''));

                        payload = JSON.parse(jsonPayload);
                    } catch (jwtError) {
                        console.warn('Failed to parse JWT:', jwtError);
                        payload = null;
                    }
                }

                // Extract ID from payload
                if (payload) {
                    return payload.id || payload.user_id || payload.userId || payload.sub ||
                        payload.user?.id || payload.data?.id;
                }

                // Last attempt: search for ID in text
                const idRegex = /"id"\s*:\s*"?(\d+)/;
                const match = token.match(idRegex);
                if (match) return match[1];

            } catch (innerError) {
                console.error('Internal error:', innerError);
            }

            return null;
        } catch (error) {
            console.error('External error:', error);
            return null;
        }
    };

    // Get current user ID from API directly
    const getCurrentUserIdFromAPI = async (): Promise<string | number | null> => {
        try {
            const response = await ProfileService.getUserProfile();
            if (response.success && response.data.user.id) {
                return response.data.user.id;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting ID from API:', error);
            return null;
        }
    };

    // Unified function to get current ID
    const getCurrentUserId = async (): Promise<string | number | null> => {
        const fromToken = getCurrentUserIdFromTokenAlternative();
        if (fromToken) return fromToken;

        const fromAPI = await getCurrentUserIdFromAPI();
        return fromAPI;
    };

    // Delete account function
    const handleDeleteAccount = async (password: string) => {
        setIsDeletingAccount(true);
        try {
            const response = await ProfileService.deleteAccount(password);

            if (response.success) {
                // Clear all local data
                localStorage.clear();
                sessionStorage.clear();

                // Redirect to register page
                router.push('/register');

                // Show success message
                alert('Your account has been successfully deleted. We\'re sorry to see you go!');
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsDeletingAccount(false);
        }
    };

    // Update password function
    const handleUpdatePassword = async (data: {
        current_password: string;
        new_password: string;
        new_password_confirmation: string;
    }) => {
        setIsUpdatingPassword(true);
        try {
            const response = await ProfileService.updatePassword({
                current_password: data.current_password,
                new_password: data.new_password,
                new_password_confirmation: data.new_password_confirmation
            });

            if (response.success) {
                // تحديث التوكن في localStorage
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }

                alert('Password updated successfully! You have been logged in with your new password.');

                // إعادة تحميل الصفحة لتطبيق التغييرات
                window.location.reload();
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Reset state when user changes
    useEffect(() => {
        const resetState = () => {
            setUser(null);
            setStats(null);
            setProfilePosts([]);
            setLoading(true);
            setError(null);
            setActiveTab('posts');
        };

        resetState();

        const todayDate = new Date().toISOString().split('T')[0];
        setToday(todayDate);

        if (targetUserId) {
            fetchProfileData();
        }
    }, [targetUserId]);

    // Update isOwnProfile status when path or user changes
    useEffect(() => {
        const updateOwnProfileStatus = async () => {
            if (!targetUserId) {
                setIsOwnProfile(true);
                return;
            }

            try {
                const currentUserId = await getCurrentUserId();

                if (currentUserId) {
                    const isOwn = targetUserId.toString() === currentUserId.toString();
                    setIsOwnProfile(isOwn);
                } else {
                    setIsOwnProfile(false);
                }
            } catch (error) {
                console.error('❌ Error in updateOwnProfileStatus:', error);
                setIsOwnProfile(false);
            }
        };

        updateOwnProfileStatus();
    }, [targetUserId, pathname]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            let profileResponse: ProfileResponse | UserProfileResponse;

            if (targetUserId) {
                try {
                    profileResponse = await ProfileService.getUserProfileById(targetUserId);

                    const currentUserId = await getCurrentUserId();

                    if (currentUserId && currentUserId.toString() === targetUserId.toString()) {
                        setIsOwnProfile(true);
                        localStorage.setItem('user_id', currentUserId.toString());
                    } else {
                        setIsOwnProfile(false);
                    }

                } catch (fetchError) {
                    console.error('❌ Error fetching user profile:', fetchError);
                    throw new Error('Failed to fetch user profile');
                }
            } else {
                profileResponse = await ProfileService.getUserProfile();

                const currentUserId = profileResponse.data.user.id;
                if (currentUserId) {
                    localStorage.setItem('user_id', currentUserId.toString());
                }

                setIsOwnProfile(true);
            }

            if (!profileResponse.success) {
                throw new Error(profileResponse.message || 'Failed to load profile');
            }

            const userData = profileResponse.data.user;
            const statsData = profileResponse.data.stats;

            const formattedUser: UserProfile = {
                id: userData.id,
                full_name: userData.full_name,
                image: userData.image || 'https://via.placeholder.com/150',
                bio: userData.bio || '',
                email: userData.email,
                phone_number: userData.phone_number,
                gender: userData.gender,
                birth_date: userData.birth_date,
                created_at: userData.created_at,
                followers: userData.followers || [],
                following: userData.following || [],
                posts: userData.posts || []
            };

            const formattedStats: ProfileStats = {
                posts_count: statsData.posts_count,
                followers_count: statsData.followers_count,
                following_count: statsData.following_count,
                likes_count: statsData.likes_count,
                comments_count: statsData.comments_count
            };

            setUser(formattedUser);
            setStats(formattedStats);

            const userOldPosts = userData.posts || [];
            if (userOldPosts.length > 0) {
                const postsWithLikes = await Promise.all(
                    userOldPosts.map(async (post) => {
                        try {
                            const likes = await ProfileService.getPostLikes(post.id);
                            return {
                                ...post,
                                likes: likes,
                                likes_count: likes.length,
                                comments_count: post.comments_count || 0
                            };
                        } catch {
                            return {
                                ...post,
                                likes: [],
                                likes_count: post.likes_count || 0,
                                comments_count: post.comments_count || 0
                            };
                        }
                    })
                );
                setProfilePosts(postsWithLikes);
            } else {
                setProfilePosts([]);
            }

        } catch (err) {
            console.error('🔥 Error fetching data:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        try {
            const birth = new Date(birthDate);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }

            return `${age} years old`;
        } catch {
            return '';
        }
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const handleEditClick = () => {
        if (user && isOwnProfile) {
            setEditForm({
                full_name: user.full_name,
                bio: user.bio || '',
                email: user.email,
                image: user.image || '',
                phone_number: user.phone_number || '',
                gender: user.gender || '',
                birth_date: user.birth_date?.split('T')[0] || ''
            });
            setShowEditModal(true);
            setSaveError(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !isOwnProfile) return;

        try {
            setIsSaving(true);
            setSaveError(null);

            const response = await ProfileService.updateProfile(editForm);
            setUser(response.data);
            setShowEditModal(false);

            await fetchProfileData();

        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'An error occurred while saving data');
        } finally {
            setIsSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const loadOwnProfile = async () => {
        try {
            const currentId = await getCurrentUserId();
            if (currentId) {
                router.push(`/profile/${currentId}`);
            } else {
                router.push('/login');
            }
        } catch (error) {
            console.error('❌ Failed to load own profile:', error);
            router.push('/login');
        }
    };

    const handlePostDeleted = (deletedPostId: number) => {
        setProfilePosts(prev => prev.filter(post => post.id !== deletedPostId));
    };

    const handleImagesUpdated = () => {
        // No action needed
    };

    const handlePostUpdated = () => {
        // No action needed
    };

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
                <p style={{
                    color: '#cbd5e1',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {targetUserId ? `Loading Profile...` : 'Loading Your Profile...'}
                </p>
            </div>
        );
    }

    if (error || !user || !stats) {
        return (
            <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h2 style={{
                    color: 'white',
                    marginBottom: '16px',
                    fontSize: '2rem'
                }}>
                    Error Loading Profile
                </h2>
                <p style={{
                    color: '#94a3b8',
                    marginBottom: '32px',
                    fontSize: '1.1rem',
                    maxWidth: '400px'
                }}>
                    {error || 'Failed to load profile data'}
                </p>

                {targetUserId && (
                    <div style={{ marginBottom: '16px' }}>
                        <button
                            onClick={loadOwnProfile}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                marginRight: '12px'
                            }}
                        >
                            View My Profile
                        </button>
                    </div>
                )}

                <button
                    onClick={fetchProfileData}
                    style={{
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '16px 32px',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 20px rgba(124, 58, 237, 0.4)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(124, 58, 237, 0.5)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)';
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-content">
                <div className="profile-sidebar">
                    <div>
                        {isOwnProfile && (
                            <div className='display'>
                                <button className="edit-avatar-btn" onClick={handleEditClick}>
                                    <MdEdit style={{ width: 20, height: 20 }} />
                                </button>
                                 {/* زر تحديث كلمة السر */}
                                <button
                                    className="edit-avatar-btn"
                                    onClick={() => setShowUpdatePasswordModal(true)}
                                    disabled={isUpdatingPassword}
                                >
                                    <MdLock style={{ width: 20, height: 20 }} />
                                    {/* {isUpdatingPassword ? 'Updating...' : 'Change Password'} */}
                                </button>
                            </div>
                        )}

                        {!isOwnProfile && (
                            <div className="display-not-owner">
                                <button
                                    onClick={loadOwnProfile}
                                    className="edit-avatar-btn-not-owner"
                                >
                                    <HiArrowNarrowRight style={{ width: 20, height: 20 }} />
                                    back to my profile
                                </button>
                            </div>
                        )}

                        <div className="profile-avatar-section">
                            <img
                                src={user.image || 'https://via.placeholder.com/150'}
                                alt={user.full_name}
                                className="profile-avatar"
                            />
                        </div>

                        <div className="user-info">
                            <h2 className="user-name">{user.full_name}</h2>
                            <div className="user-email">
                                <MdOutlineEmail className='email_icon' />
                                <span>{user.email}</span>
                            </div>
                            <div className="member-since">
                                Member since {formatDate(user.created_at)}
                            </div>
                        </div>

                        <div className="profile-stats">
                            <div className="stat-card">
                                <div className="stat-number">{stats.followers_count}</div>
                                <div className="stat-label">FOLLOWERS</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-number">{stats.following_count}</div>
                                <div className="stat-label">FOLLOWING</div>
                            </div>
                        </div>

                        <div className="profile-info-section">
                            <h3 className="section-title">About me</h3>
                            <p className="bio-text">{user.bio || 'No bio provided'}</p>

                            <div className="info-grid">
                                <div className="info-item">
                                    <span className="info-label">PHONE</span>
                                    <span className="info-value">{user.phone_number || 'Not provided'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">GENDER</span>
                                    <span className="info-value">{user.gender || 'Not specified'}</span>
                                </div>

                                <div className="info-item">
                                    <span className="info-label">BIRTH DATE</span>
                                    <span className="info-value">
                                        {user.birth_date ? (
                                            <>
                                                {formatDate(user.birth_date)}
                                                {calculateAge(user.birth_date) && (
                                                    <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
                                                        ({calculateAge(user.birth_date)})
                                                    </div>
                                                )}
                                            </>
                                        ) : 'Not provided'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Simple delete account button - only shows for owner */}
                        {isOwnProfile && (
                            <div className="account-actions-section">
                                {/* زر حذف الحساب */}
                                <button
                                    className="btn-delete-account-simple"
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isDeletingAccount}
                                >
                                    <MdDelete style={{ width: 18, height: 18, marginRight: 8 }} />
                                    {isDeletingAccount ? 'Processing...' : 'Delete Account'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="profile-main">
                    <div className="profile-tabs">
                        {isOwnProfile ? (
                            <>
                                <button
                                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('posts')}
                                >
                                    Posts
                                    <span className="tab-count">{stats.posts_count}</span>
                                </button>

                                <button
                                    className={`tab-button ${activeTab === 'followers' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('followers')}
                                >
                                    Followers
                                    <span className="tab-count">{stats.followers_count}</span>
                                </button>

                                <button
                                    className={`tab-button ${activeTab === 'following' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('following')}
                                >
                                    Following
                                    <span className="tab-count">{stats.following_count}</span>
                                </button>
                            </>
                        ) : (
                            <button
                                className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('posts')}
                            >
                                Posts
                                <span className="tab-count">{stats.posts_count}</span>
                            </button>
                        )}
                    </div>

                    {activeTab === 'posts' && (
                        <div className="recent-activity">
                            <UserPostsFeed
                                userId={targetUserId || ''}
                                isOwnProfile={isOwnProfile}
                                onPostDeleted={handlePostDeleted}
                                onImagesUpdated={handleImagesUpdated}
                                onPostUpdated={handlePostUpdated}
                            />
                        </div>
                    )}

                    {activeTab === 'followers' && (
                        <div className="recent-activity">
                            <h3 className="activity-title">Followers ({stats.followers_count})</h3>
                            <div className="">
                                <p className='activity_follow'>
                                    <HiOutlineLightBulb className='icon-follow' />
                                    {isOwnProfile ? 'Your followers will appear here' : 'Followers will appear here'}
                                </p>
                                {isOwnProfile ? (
                                    <MyFollowers />
                                ) : (
                                    <div style={{
                                        color: '#94a3b8',
                                        textAlign: 'center',
                                        padding: '40px',
                                        fontSize: '1.1rem'
                                    }}>
                                        Followers list is only visible to profile owner
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className="recent-activity">
                            <h3 className="activity-title">Following ({stats.following_count})</h3>
                            <div className="border-dev">
                                <p className='activity_follow'>
                                    <HiOutlineLightBulb className='icon-follow' />
                                    {isOwnProfile ? 'People you follow will appear here' : 'Following will appear here'}
                                </p>
                                {isOwnProfile ? (
                                    <MyFollowing />
                                ) : (
                                    <div style={{
                                        color: '#94a3b8',
                                        textAlign: 'center',
                                        padding: '40px',
                                        fontSize: '1.1rem'
                                    }}>
                                        Following list is only visible to profile owner
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {showEditModal && isOwnProfile && (
                <div className="edit-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowEditModal(false)}>
                            ✕
                        </button>

                        <div className="modal-header">
                            <h2 className="modal-title">Edit Profile</h2>
                        </div>

                        <div className="modal-body">
                            {saveError && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    fontSize: '0.95rem',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>
                                    {saveError}
                                </div>
                            )}

                            <div className="image-preview-container">
                                <img
                                    src={editForm.image || user.image || 'https://via.placeholder.com/150'}
                                    alt="Profile Preview"
                                    className="image-preview"
                                />
                            </div>

                            <div className="form-group">
                                <InputField
                                    label="Profile Image URL"
                                    name="image"
                                    value={editForm.image || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your image"
                                />
                            </div>

                            <div className="form-group">
                                <InputField
                                    label="Full Name"
                                    name="full_name"
                                    value={editForm.full_name || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    required
                                    error={errors.full_name}
                                />
                            </div>

                            <div className="form-group">
                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={handleInputChange}
                                    placeholder="example@email.com"
                                    required
                                    error={errors.email}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea
                                    name="bio"
                                    value={editForm.bio || ''}
                                    onChange={handleInputChange}
                                    className="form-input form-textarea"
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>

                            <div className="form-group">
                                <InputField
                                    label="Phone Number"
                                    name="phone_number"
                                    value={editForm.phone_number || ''}
                                    onChange={handleInputChange}
                                    placeholder="+963 234 567 89"
                                    error={errors.phone_number}
                                />
                            </div>

                            <div className="form-group">
                                <SelectField
                                    label="Gender"
                                    name="gender"
                                    value={editForm.gender || ''}
                                    onChange={handleInputChange}
                                    options={genderOptions}
                                    error={errors.gender}
                                />
                            </div>

                            <div className="form-group">
                                <DatePickerField
                                    label="Birth Date"
                                    name="birth_date"
                                    value={editForm.birth_date || ''}
                                    onChange={handleInputChange}
                                    max={today}
                                    error={errors.birth_date}
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowEditModal(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleSaveProfile}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="loading-spinner" style={{
                                                width: '20px',
                                                height: '20px',
                                                borderWidth: '2px'
                                            }}></div>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Password Modal */}
            <UpdatePasswordModal
                isOpen={showUpdatePasswordModal}
                onClose={() => setShowUpdatePasswordModal(false)}
                onUpdate={handleUpdatePassword}
            />

            {/* Delete Account Modal */}
            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteAccount}
            />
        </div>
    );
};

export default Profile;