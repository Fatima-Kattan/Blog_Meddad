'use client'
// components/Profile.tsx
import React, { useState, useEffect } from 'react';
import './profile.css';
import ProfileService, {
    UserProfile,
    ProfileStats,
    Post,
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
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type TabType = 'overview' | 'posts' | 'followers' | 'following';

interface ProfileProps {
    userId?: string | number;
    isOwnProfile?: boolean;
}

// ⬇️ أزل هذا التعريف المكرر:
// export default function ProfileComponent({ profile, isCurrentUser = false }: ProfileComponentProps) {

// ⬇️ احتفظ بهذا التعريف فقط:
const Profile: React.FC<ProfileProps> = ({ userId: propUserId, isOwnProfile: propIsOwnProfile }) => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const urlUserId = params?.id as string;
    const queryUserId = searchParams?.get('id');
    const targetUserId = propUserId || urlUserId || queryUserId;

    const [isOwnProfile, setIsOwnProfile] = useState(propIsOwnProfile || false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [today, setToday] = useState('');

    useEffect(() => {
        const todayDate = new Date().toISOString().split('T')[0];
        setToday(todayDate);

        fetchProfileData();
    }, [targetUserId]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('🔄 جلب بيانات البروفايل لـ ID:', targetUserId);

            let profileResponse: ProfileResponse | UserProfileResponse;

            if (targetUserId) {
                console.log(`📋 جلب بروفايل للمستخدم: ${targetUserId}`);
                try {
                    profileResponse = await ProfileService.getUserProfileById(targetUserId);

                    const currentUserId = localStorage.getItem('user_id');
                    console.log('🔍 ID الحالي من localStorage:', currentUserId);
                    console.log('🔍 الـ ID المستهدف:', targetUserId);

                    if (currentUserId && currentUserId === targetUserId.toString()) {
                        setIsOwnProfile(true);
                        console.log('✅ هذا البروفايل الخاص بالمستخدم الحالي');
                    } else {
                        setIsOwnProfile(false);
                        console.log('👀 هذا بروفايل مستخدم آخر');
                    }

                } catch (fetchError) {
                    console.error('❌ خطأ في جلب بروفايل المستخدم:', fetchError);
                    throw new Error('فشل في جلب بروفايل المستخدم');
                }
            } else {
                // ⬇️ جلب البروفايل الشخصي بدون ID
                console.log('🔄 جلب البروفايل الشخصي...');
                profileResponse = await ProfileService.getUserProfile();
                setIsOwnProfile(true);

                // ⬇️ احفظ الـ ID في localStorage
                if (profileResponse.data.user.id) {
                    localStorage.setItem('user_id', profileResponse.data.user.id.toString());
                    console.log('💾 تم حفظ الـ ID:', profileResponse.data.user.id);
                }
            }

            console.log('📦 بيانات البروفايل الكاملة:', profileResponse);

            if (!profileResponse.success) {
                throw new Error(profileResponse.message || 'فشل في تحميل البروفايل');
            }

            // تحويل البيانات إلى الشكل الصحيح
            const userData = profileResponse.data.user;
            const statsData = profileResponse.data.stats;

            console.log('👤 بيانات المستخدم:', userData);
            console.log('📊 الإحصائيات:', statsData);

            // تحويل UserProfileResponse إلى UserProfile
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
            const userPosts = userData.posts || [];
            console.log('📝 المنشورات من API:', userPosts.length);

            if (userPosts.length > 0) {
                const postsWithLikes = await Promise.all(
                    userPosts.map(async (post) => {
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
                setPosts(postsWithLikes);
            } else {
                setPosts([]);
            }

            console.log('✅ تم تحميل بيانات البروفايل بنجاح');

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

    const handleGoToMyProfile = () => {
        // ⬇️ استخدم دالة لتحميل البروفايل الشخصي
        loadOwnProfile();
    };

    // ⬇️ دالة لتحميل البروفايل الشخصي
    const loadOwnProfile = async () => {
        try {
            // جلب الـ ID أولاً
            const currentId = await ProfileService.getCurrentUserId();
            if (currentId) {
                // التوجه إلى صفحة البروفايل الشخصي
                router.push(`/profile/${currentId}`);
            } else {
                // إذا لم يكن هناك ID، اذهب إلى الصفحة الرئيسية
                router.push('/');
            }
        } catch (error) {
            console.error('❌ فشل في تحميل البروفايل الشخصي:', error);
            router.push('/login');
        }
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
                    {isOwnProfile && (
                        <div className='display'>
                            <button className="edit-avatar-btn" onClick={handleEditClick}>
                                <MdEdit style={{ width: 20, height: 20, }} />

                            </button>
                        </div>
                    )}

                    {!isOwnProfile && (
                        <div className="display-not-owner">
                            {/*  <span>👤 Viewing Profile</span> */}
                            <button
                                onClick={loadOwnProfile}
                                className="edit-avatar-btn-not-owner"
                            >
                                <HiArrowNarrowRight style={{ width: 20, height: 20, }} />
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

                    <div className="account-created">
                        <div className="created-label">ACCOUNT CREATED</div>
                        <div className="created-date">{formatDate(user.created_at)}</div>
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
                            <h3 className="activity-title">Posts ({posts.length})</h3>
                            <div className="posts-list">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.id} className="post-item">
                                            {post.images && post.images.length > 0 && (
                                                <div className={`post-images-grid ${post.images.length === 1 ? 'single-image' :
                                                    post.images.length === 2 ? 'two-images' :
                                                        post.images.length === 3 ? 'three-images' :
                                                            'four-or-more'
                                                    }`}>
                                                    {post.images.map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="post-image-item"
                                                            style={{
                                                                gridColumn: post.images.length === 3 && index === 0 ? 'span 2' : 'span 1',
                                                                gridRow: post.images.length === 3 && index === 0 ? 'span 2' : 'span 1'
                                                            }}
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${post.title} - Image ${index + 1}`}
                                                                className="post-grid-image"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="post-header">
                                                <h4 className="post-title">{post.title}</h4>
                                                <span className="post-date">{formatDate(post.created_at)}</span>
                                            </div>

                                            <p className="post-content">
                                                {post.caption || 'No content provided...'}
                                            </p>

                                            {/* إحصائيات المنشور */}
                                            <div className="post-stats">
                                                <div className="post-stat likes-stat">
                                                    <div className="post-stat-icon">
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M14 20.408c-.492.308-.903.546-1.192.709-.153.086-.308.17-.463.252h-.002a.75.75 0 01-.686 0 16.709 16.709 0 01-.465-.252 31.147 31.147 0 01-4.803-3.34C3.8 15.572 1 12.331 1 8.513 1 5.052 3.829 2.5 6.736 2.5 9.03 2.5 10.881 3.726 12 5.605 13.12 3.726 14.97 2.5 17.264 2.5 20.17 2.5 23 5.052 23 8.514c0 3.818-2.801 7.06-5.389 9.262A31.146 31.146 0 0114 20.408z" />
                                                        </svg>
                                                    </div>
                                                    <div className="post-stat-info">
                                                        <div className="post-stat-number">{post.likes_count}</div>
                                                        <div className="post-stat-label">Likes</div>
                                                    </div>
                                                </div>

                                                <div className="post-stat comments-stat">
                                                    <div className="post-stat-icon">
                                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
                                                        </svg>
                                                    </div>
                                                    <div className="post-stat-info">
                                                        <div className="post-stat-number">{post.comments_count}</div>
                                                        <div className="post-stat-label">Comments</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* المعجبين */}
                                            {post.likes && post.likes.length > 0 && (
                                                <div className="post-likers">
                                                    <div className="likers-title">
                                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                                                        </svg>
                                                        Liked by
                                                    </div>
                                                    <div className="likers-list">
                                                        {post.likes.slice(0, 5).map((like) => (
                                                            <Link
                                                                href={`/profile/${like.user.id}`}
                                                                key={like.id}
                                                                className="liker-item-link"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="liker-item">
                                                                    <img
                                                                        src={like.user.image}
                                                                        alt={like.user.full_name}
                                                                        className="liker-avatar"
                                                                    />
                                                                    <span className="liker-name">{like.user.full_name}</span>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                        {post.likes.length > 5 && (
                                                            <div className="liker-item">
                                                                <span className="liker-name" style={{ color: '#7c3aed' }}>
                                                                    +{post.likes.length - 5} more
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-posts">
                                        <div className="no-posts-icon">📝</div>
                                        <h3 style={{ color: 'white', marginBottom: '12px' }}>
                                            No Recent Activity
                                        </h3>
                                        <p style={{ color: '#94a3b8' }}>
                                            Start creating posts to see them here!
                                        </p>
                                    </div>
                                )}
                            </div>
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
                                <label className="form-label">Profile Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={editForm.image || ''}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://example.com/your-image.jpg"
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
        </div>
    );
};

export default Profile;