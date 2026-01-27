'use client'
// components/Profile.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { MdEdit, MdOutlineEmail } from 'react-icons/md';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PostItem from '@/components/posts/post-item/PostItem';
import axios from 'axios';

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

    // States for UserPostsFeed
    const [userPosts, setUserPosts] = useState<ApiPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [postsError, setPostsError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerRef = useRef<HTMLDivElement>(null);

    // إعادة تعيين الحالة عند تغيير المستخدم
    useEffect(() => {
        const resetState = () => {
            setUser(null);
            setStats(null);
            setProfilePosts([]);
            setUserPosts([]);
            setLoading(true);
            setError(null);
            setPostsLoading(true);
            setPostsError(null);
            setPage(1);
            setHasMore(true);
            setIsOwnProfile(propIsOwnProfile || false);
            setActiveTab('posts');
        };

        resetState();
        
        const todayDate = new Date().toISOString().split('T')[0];
        setToday(todayDate);

        if (targetUserId) {
            fetchProfileData();
        }
    }, [targetUserId]);

    // التعامل مع تغيير المسار
    useEffect(() => {
        if (pathname && pathname.includes('/profile/')) {
            const urlUserId = params?.id as string;
            const currentUserId = localStorage.getItem('user_id');
            
            if (urlUserId && currentUserId) {
                const isOwn = urlUserId === currentUserId.toString();
                console.log(`🔄 تحديث isOwnProfile: ${isOwn} (المستخدم الحالي: ${currentUserId}, المستخدم المستهدف: ${urlUserId})`);
                setIsOwnProfile(isOwn);
            }
        }
    }, [pathname, params?.id]);

    useEffect(() => {
        if (targetUserId && activeTab === 'posts') {
            fetchUserPosts(1, true);
        }
    }, [targetUserId, activeTab]);

    // Auto infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !postsLoading) {
                    loadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, postsLoading]);

    const fetchUserPosts = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
        if (!targetUserId) {
            setPostsError('No user ID provided');
            setPostsLoading(false);
            return;
        }

        try {
            setPostsLoading(true);
            const response = await axios.get<UserPostsResponse>(
                `http://localhost:8000/api/v1/user/${targetUserId}/posts`,
                {
                    params: { page: pageNum },
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                const newPosts = response.data.data.posts.data;
                
                if (isRefresh) {
                    setUserPosts(newPosts);
                } else {
                    setUserPosts(prev => [...prev, ...newPosts]);
                }
                
                setHasMore(pageNum < response.data.data.posts.last_page);
                setPage(pageNum + 1);
                setPostsError(null);
            } else {
                setPostsError(response.data.message || 'Failed to fetch user posts');
            }
        } catch (err: any) {
            setPostsError(err.response?.data?.message || 'Error fetching user posts');
            console.error('Error fetching user posts:', err);
        } finally {
            setPostsLoading(false);
        }
    }, [targetUserId]);

    const loadMore = () => {
        if (!postsLoading && hasMore) {
            fetchUserPosts(page, false);
        }
    };

    const refreshUserPosts = () => {
        setPage(1);
        setHasMore(true);
        fetchUserPosts(1, true);
    };

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            let profileResponse: ProfileResponse | UserProfileResponse;

            console.log(`🔍 جلب بيانات للمستخدم: ${targetUserId}`);

            if (targetUserId) {
                try {
                    profileResponse = await ProfileService.getUserProfileById(targetUserId);

                    const currentUserId = localStorage.getItem('user_id');
                    console.log(`👤 المقارنة: المستخدم الحالي=${currentUserId}, المستخدم المستهدف=${targetUserId}`);
                    
                    if (currentUserId && currentUserId.toString() === targetUserId.toString()) {
                        console.log('✅ هذا هو الملف الشخصي للمستخدم الحالي');
                        setIsOwnProfile(true);
                    } else {
                        console.log('❌ هذا ليس الملف الشخصي للمستخدم الحالي');
                        setIsOwnProfile(false);
                    }

                } catch (fetchError) {
                    console.error('❌ خطأ في جلب بروفايل المستخدم:', fetchError);
                    throw new Error('فشل في جلب بروفايل المستخدم');
                }
            } else {
                profileResponse = await ProfileService.getUserProfile();
                setIsOwnProfile(true);

                if (profileResponse.data.user.id) {
                    localStorage.setItem('user_id', profileResponse.data.user.id.toString());
                }
            }

            if (!profileResponse.success) {
                throw new Error(profileResponse.message || 'فشل في تحميل البروفايل');
            }

            // تحويل البيانات إلى الشكل الصحيح
            const userData = profileResponse.data.user;
            const statsData = profileResponse.data.stats;

            console.log(`📊 بيانات المستخدم المستلمة:`, {
                id: userData.id,
                name: userData.full_name,
                isOwnProfile: isOwnProfile
            });

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

            // جلب المنشورات مع تفاصيل اللايكات
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

            console.log(`✅ تم تحميل بيانات الملف الشخصي بنجاح للمستخدم: ${formattedUser.full_name}`);
            console.log(`👁️ isOwnProfile الحالي: ${isOwnProfile}`);

        } catch (err) {
            console.error('🔥 خطأ في جلب البيانات:', err);
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات';
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
            setSaveError(err instanceof Error ? err.message : 'حدث خطأ في حفظ البيانات');
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
            const currentId = await ProfileService.getCurrentUserId();
            if (currentId) {
                router.push(`/profile/${currentId}`);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('❌ فشل في تحميل البروفايل الشخصي:', error);
            router.push('/login');
        }
    };

    const handlePostDeleted = (deletedPostId: number) => {
        // تحديث القائمتين
        refreshUserPosts();
        setProfilePosts(prev => prev.filter(post => post.id !== deletedPostId));
    };

    const handleImagesUpdated = () => {
        refreshUserPosts();
    };

    const handlePostUpdated = () => {
        refreshUserPosts();
    };

      const checkIfOwnProfile = () => {
        const currentUserId = localStorage.getItem('user_id');
        const isOwn = currentUserId && targetUserId && currentUserId.toString() === targetUserId.toString();
        console.log(`🔍 فحص isOwnProfile: ${isOwn} (current: ${currentUserId}, target: ${targetUserId})`);
        return isOwn;
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

    const finalIsOwnProfile = checkIfOwnProfile();

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
                            {postsError ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '2rem',
                                    background: '#fff5f5',
                                    border: '1px solid #fed7d7',
                                    borderRadius: '8px',
                                    marginBottom: '1rem'
                                }}>
                                    <p style={{ color: '#e53e3e', marginBottom: '1rem' }}>{postsError}</p>
                                    <button
                                        onClick={refreshUserPosts}
                                        style={{
                                            background: '#3182ce',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {userPosts.length === 0 && !postsLoading ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '3rem 1rem',
                                            background: '#341c53',
                                            borderRadius: '12px',
                                            border: '1px solid #7c3aed'
                                        }}>
                                            <p style={{
                                                fontSize: '1.25rem',
                                                fontWeight: '600',
                                                color: '#ffffffff',
                                                marginBottom: '0.5rem'
                                            }}>
                                                There are no posts yet.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {userPosts.map((post) => (
                                                <PostItem 
                                                    key={post.id} 
                                                    post={post}
                                                    onPostDeleted={handlePostDeleted}
                                                    onImagesUpdated={handleImagesUpdated}
                                                    onPostUpdated={handlePostUpdated}
                                                />
                                            ))}

                                            {postsLoading && (
                                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        border: '3px solid #e2e8f0',
                                                        borderTop: '3px solid #3182ce',
                                                        borderRadius: '50%',
                                                        animation: 'spin 1s linear infinite',
                                                        margin: '0 auto 1rem'
                                                    }}></div>
                                                    <p>Loading user's posts...</p>
                                                </div>
                                            )}

                                            {hasMore && !postsLoading && (
                                                <div ref={observerRef} style={{ textAlign: 'center', padding: '1rem' }}>
                                                    <button
                                                        onClick={loadMore}
                                                        style={{
                                                            background: '#edf2f7',
                                                            color: '#2d3748',
                                                            border: '1px solid #cbd5e0',
                                                            padding: '0.75rem 1.5rem',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            fontWeight: '200',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = '#e2e8f0';
                                                            e.currentTarget.style.borderColor = '#a0aec0';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = '#edf2f7';
                                                            e.currentTarget.style.borderColor = '#cbd5e0';
                                                        }}
                                                    >
                                                        Load More
                                                    </button>
                                                </div>
                                            )}

                                            {!hasMore && userPosts.length > 0 && (
                                                <div style={{ textAlign: 'center', padding: '2rem', color: '#718096', fontStyle: 'italic' }}>
                                                    <p>You've seen all of this user's posts</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
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

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Profile;