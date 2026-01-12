'use client'
// components/Profile.tsx
import React, { useState, useEffect } from 'react';
import './profile.css';
import ProfileService, {
    UserProfile,
    ProfileStats,
    Post,
    UpdateProfileData
} from '@/services/api/auth/profileService';
import { FaRegLightbulb } from "react-icons/fa6";
import Following from '../../follow/following/Following'
import { HiOutlineLightBulb } from 'react-icons/hi';
import Followers from '@/components/follow/followers/Followers';
import InputField from '@/components/shared/InputField';
import { errorToJSON } from 'next/dist/server/render';
import SelectField from '@/components/shared/SelectField';
import DatePickerField from '@/components/shared/DatePickerField';
import { MdOutlineEmail } from 'react-icons/md';

type TabType = 'overview' | 'posts' | 'followers' | 'following';

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [today, setToday] = useState('');

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);

            const profileResponse = await ProfileService.getUserProfile();
            setUser(profileResponse.data.user);
            setStats(profileResponse.data.stats);

            // جلب المنشورات مع تفاصيل الإعجابات
            const userPosts = profileResponse.data.user.posts || [];

            // جلب تفاصيل كل منشور للحصول على المعجبين
            const postsWithDetails = await Promise.all(
                userPosts.map(async (post) => {
                    try {
                        const postDetail = await ProfileService.getPostDetails(post.id);
                        return postDetail.data;
                    } catch (err) {
                        return post; // إذا فشل جلب التفاصيل، نستخدم المنشور الأساسي
                    }
                })
            );

            setPosts(postsWithDetails);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'حدث خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const calculateAge = (birthDate: string) => {
        if (!birthDate) return '';
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return `${age} years old`;
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ];

    const handleEditClick = () => {
        if (user) {
            setEditForm({
                full_name: user.full_name,
                bio: user.bio,
                email:user.email,
                image: user.image,
                phone_number: user.phone_number,
                gender: user.gender,
                birth_date: user.birth_date?.split('T')[0] // تنسيق التاريخ لل input
            });
            setShowEditModal(true);
            setSaveError(null);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        try {
            setIsSaving(true);
            setSaveError(null);

            const response = await ProfileService.updateProfile(editForm);
            setUser(response.data);
            setShowEditModal(false);

            // تحديث البيانات
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
                    Loading Profile...
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
            {/* هيدر البروفايل */}
            {/* <div className="profile-header">
                <div className="header-content">
                    <h1 className="profile-title">My Profile</h1>
                    <p className="profile-subtitle">Manage your account and settings</p>
                </div>
            </div> */}

            {/* المحتوى الرئيسي */}
            <div className="profile-content">

                {/* الشريط الجانبي */}
                <div className="profile-sidebar">
                    <div className='display'>
                        <button className="edit-avatar-btn" onClick={handleEditClick}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                        </button>
                    </div>
                    {/* الصورة وتحريرها */}
                    <div className="profile-avatar-section">
                        <img
                            src={user.image || 'https://via.placeholder.com/150'}
                            alt={user.full_name}
                            className="profile-avatar"
                        />
                        {/*  <div className="avatar-status"></div> */}

                    </div>

                    {/* معلومات المستخدم */}
                    <div className="user-info">
                        <h2 className="user-name">{user.full_name}</h2>
                        <div className="user-email">
                            <MdOutlineEmail className='email_icon'/>
                            <span>{user.email}</span>
                        </div>
                        <div className="member-since">
                            Member since {formatDate(user.created_at)}
                        </div>
                    </div>

                    {/* إحصائيات البروفايل */}
                    <div className="profile-stats">
                        {/* <div className="stat-card">
                            <div className="stat-number">{stats.posts_count}</div>
                            <div className="stat-label">POSTS</div>
                        </div> */}
                        <div className="stat-card">
                            <div className="stat-number">{stats.followers_count}</div>
                            <div className="stat-label">FOLLOWERS</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.following_count}</div>
                            <div className="stat-label">FOLLOWING</div>
                        </div>
                        {/*  <div className="stat-card">
                            <div className="stat-number">{stats.likes_count}</div>
                            <div className="stat-label">LIKES</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{stats.comments_count}</div>
                            <div className="stat-label">COMMENTS</div>
                        </div> */}
                    </div>

                    {/* معلومات البروفايل */}
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

                    {/* تاريخ إنشاء الحساب */}
                    <div className="account-created">
                        <div className="created-label">ACCOUNT CREATED</div>
                        <div className="created-date">{formatDate(user.created_at)}</div>
                    </div>
                </div>

                {/* المحتوى الرئيسي */}
                <div className="profile-main">
                    {/* التبويبات */}
                    <div className="profile-tabs">
                        {/* <button
                            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button> */}

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
                    </div>

                    {/* محتوى التبويب النشط */}
                    {activeTab === 'overview' && (
                        <div className="recent-activity">
                            <h3 className="activity-title">Recent Activity</h3>

                            <div className="posts-list">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.id} className="post-item">
                                            {/* عرض جميع صور البوست */}
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
                                                            {index === 0 && post.images.length > 1 && (
                                                                <div className="images-count-badge">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm16 2H4v10h16V7zm-8 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                                                                    </svg>
                                                                    {post.images.length} photos
                                                                </div>
                                                            )}
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
                                                            <div key={like.id} className="liker-item">
                                                                <img
                                                                    src={like.user.image}
                                                                    alt={like.user.full_name}
                                                                    className="liker-avatar"
                                                                />
                                                                <span className="liker-name">{like.user.full_name}</span>
                                                            </div>
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

                    {activeTab === 'posts' && (
                        <div className="recent-activity">
                            <h3 className="activity-title">My Posts ({posts.length})</h3>
                            <div className="posts-list">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.id} className="post-item">
                                            {/* عرض جميع صور البوست */}
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
                                                            {index === 0 && post.images.length > 1 && (
                                                                <div className="images-count-badge">
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm16 2H4v10h16V7zm-8 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
                                                                    </svg>
                                                                    {post.images.length} photos
                                                                </div>
                                                            )}
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
                                                            <div key={like.id} className="liker-item">
                                                                <img
                                                                    src={like.user.image}
                                                                    alt={like.user.full_name}
                                                                    className="liker-avatar"
                                                                />
                                                                <span className="liker-name">{like.user.full_name}</span>
                                                            </div>
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
                            <h3 className="activity-title">My Followers ({stats.followers_count})</h3>
                            <div className="">
                                <p className='activity_follow'>
                                    <HiOutlineLightBulb className='icon-follow' />Your followers will appear here
                                </p>
                                <Followers />
                            </div>
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className="recent-activity">
                            <h3 className="activity-title">Following ({stats.following_count})</h3>
                            <div className="border-dev">
                                <p className='activity_follow'>
                                    <HiOutlineLightBulb className='icon-follow' /> People you follow will appear here
                                </p>
                                <Following />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* نافذة تعديل البروفايل */}
            {showEditModal && (
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
                                    required
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
                                    required
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
                                    required
                                    error={errors.gender}
                                />
                            </div>

                            <div className="form-group">
                                <DatePickerField
                                    label="Birth Date"
                                    name="birth_date"
                                    value={editForm.birth_date || ''}
                                    onChange={handleInputChange}
                                    required
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