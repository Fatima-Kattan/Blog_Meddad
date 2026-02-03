'use client'
// components/Profile.tsx
import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import styles from './profile.module.css';
import ProfileService, {
    UserProfile,
    ProfileStats,
    Post as ProfilePost,
    UpdateProfileData,
    ProfileResponse,
    UserProfileResponse
} from '@/services/api/auth/profileService';
import { HiArrowNarrowRight, HiOutlineLightBulb } from 'react-icons/hi';
import InputField from '@/components/shared/InputField';
import SelectField from '@/components/shared/SelectField';
import DatePickerField from '@/components/shared/DatePickerField';
import { MdEdit, MdOutlineEmail, MdDelete, MdLock } from 'react-icons/md';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports للتحسين
const UserPostsFeed = dynamic(() => import('@/components/auth/profile/UserPostsFeed'), {
    loading: () => <div className={styles.loadingSmall}>Loading posts...</div>
});

const MyFollowers = dynamic(() => import('@/components/follow/myFollowers/MyFollowers'), {
    loading: () => <div className={styles.loadingSmall}>Loading followers...</div>,
    ssr: false
});

const MyFollowing = dynamic(() => import('@/components/follow/myFollowing/MyFollowing'), {
    loading: () => <div className={styles.loadingSmall}>Loading following...</div>,
    ssr: false
});

type TabType = 'overview' | 'posts' | 'followers' | 'following';

interface ProfileProps {
    userId?: string | number;
    isOwnProfile?: boolean;
}

// مكون المودال لتعديل كلمة السر
const UpdatePasswordModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (data: {
        current_password: string;
        new_password: string;
        new_password_confirmation: string;
    }) => Promise<void>;
}> = ({ isOpen, onClose, onUpdate }) => {
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
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Change Password</h2>
                    <button className={styles.modalCloseDelete} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalBody}>
                    <form onSubmit={handleSubmit} className={styles.passwordForm}>
                        <div className={styles.formGroup}>
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

                        <div className={styles.formGroup}>
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
                            <div className={styles.warningMessagePassword}>Password must be at least 8 characters</div>
                        </div>

                        <div className={styles.formGroup}>
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

                        {error && <div className={styles.errorMessage}>{error}</div>}
                        {success && <div className={styles.successMessage}>{success}</div>}

                        <div className={styles.formActions}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} disabled={isUpdating}>
                                Cancel
                            </button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={isUpdating}>
                                {isUpdating ? (<><div className={styles.loadingSpinner}></div>Updating...</>) : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// مكون المودال لحذف الحساب باللغة الإنجليزية
const DeleteAccountModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onDelete: (password: string) => Promise<void>;
}> = ({ isOpen, onClose, onDelete }) => {
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
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Delete Account</h2>
                    <button className={styles.modalCloseDelete} onClick={onClose}>✕</button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.warningMessage}>
                        <div className={styles.warningIcon}>⚠️</div>
                        <h3>Important Warning!</h3>
                        <p>By deleting your account, you will:<strong>This action cannot be undone.</strong></p>
                        <ul>
                            <li>❌ Permanently delete all your posts</li>
                            <li>❌ Delete all your comments and likes</li>
                            <li>❌ Remove all your followers and following</li>
                            <li>❌ Lose all data associated with your account</li>
                        </ul>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.deleteForm}>
                        <div className={styles.formGroup}>
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

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <div className={styles.formActions}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose} disabled={isDeleting}>
                                Cancel
                            </button>
                            <button type="submit" className={`${styles.btn} ${styles.btnDelete}`} disabled={isDeleting}>
                                {isDeleting ? (<><div className={styles.loadingSpinner}></div>Deleting...</>) : 'Delete Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Cache للبيانات
const profileCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 ثانية

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<UpdateProfileData>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [today, setToday] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // تحسين: استخدام useMemo للحسابات المتكررة
    const memoizedTargetUserId = useMemo(() => targetUserId, [targetUserId]);
    
    // تحسين: دالة واحدة مبسطة لاستخراج الـ ID من التوكن
    const getCurrentUserIdFromToken = useCallback((): string | number | null => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            
            // محاولة تحليل التوكن كـ JWT
            try {
                const parts = token.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
                    return payload.id || payload.user_id || payload.userId || payload.sub || payload.user?.id || null;
                }
            } catch {
                // Fallback: البحث عن الـ ID في النص
                const match = token.match(/"id"\s*:\s*"?(\d+)/);
                if (match) return match[1];
            }
            
            return null;
        } catch {
            return null;
        }
    }, []);

    // تحسين: استخدام useCallback للدوال
    const getCurrentUserId = useCallback(async (): Promise<string | number | null> => {
        const fromToken = getCurrentUserIdFromToken();
        if (fromToken) return fromToken;

        try {
            const response = await ProfileService.getUserProfile();
            if (response.success && response.data.user.id) {
                return response.data.user.id;
            }
            return null;
        } catch {
            return null;
        }
    }, [getCurrentUserIdFromToken]);

    const handleDeleteAccount = useCallback(async (password: string) => {
        setIsDeletingAccount(true);
        try {
            const response = await ProfileService.deleteAccount(password);
            if (response.success) {
                localStorage.clear();
                sessionStorage.clear();
                profileCache.clear();
                router.push('/register');
                alert('Your account has been successfully deleted. We\'re sorry to see you go!');
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsDeletingAccount(false);
        }
    }, [router]);

    const handleUpdatePassword = useCallback(async (data: {
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
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);
                }
                alert('Password updated successfully! You have been logged in with your new password.');
                window.location.reload();
            }
        } catch (error: any) {
            throw error;
        } finally {
            setIsUpdatingPassword(false);
        }
    }, []);

    // تحسين: استخدام useCallback لـ fetchProfileData
    const fetchProfileData = useCallback(async () => {
        if (!memoizedTargetUserId) return;
        
        // التحقق من الـ cache أولاً
        const cacheKey = `profile_${memoizedTargetUserId}`;
        const cached = profileCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setUser(cached.data.user);
            setStats(cached.data.stats);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let profileResponse: ProfileResponse | UserProfileResponse;

            if (memoizedTargetUserId) {
                profileResponse = await ProfileService.getUserProfileById(memoizedTargetUserId);
                const currentUserId = await getCurrentUserId();
                if (currentUserId && currentUserId.toString() === memoizedTargetUserId.toString()) {
                    setIsOwnProfile(true);
                    localStorage.setItem('user_id', currentUserId.toString());
                } else {
                    setIsOwnProfile(false);
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

            // تخزين في الـ cache
            profileCache.set(cacheKey, {
                data: { user: formattedUser, stats: formattedStats },
                timestamp: Date.now()
            });

        } catch (err) {
            console.error('🔥 Error fetching data:', err);
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching data';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [memoizedTargetUserId, getCurrentUserId]);

    // تحسين: استخدام useMemo للحسابات
    const genderOptions = useMemo(() => [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
    ], []);

    const formatDate = useCallback((dateString: string) => {
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
    }, []);

    const calculateAge = useCallback((birthDate: string) => {
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
    }, []);

    // تحسين: useEffect مبسطة
    useEffect(() => {
        const todayDate = new Date().toISOString().split('T')[0];
        setToday(todayDate);

        const updateOwnProfileStatus = async () => {
            if (!memoizedTargetUserId) {
                setIsOwnProfile(true);
                return;
            }

            try {
                const currentUserId = await getCurrentUserId();
                if (currentUserId) {
                    const isOwn = memoizedTargetUserId.toString() === currentUserId.toString();
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
    }, [memoizedTargetUserId, pathname, getCurrentUserId]);

    useEffect(() => {
        if (memoizedTargetUserId) {
            fetchProfileData();
        }
    }, [memoizedTargetUserId, fetchProfileData]);

    const handleEditClick = useCallback(() => {
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
    }, [user, isOwnProfile]);

    const handleSaveProfile = useCallback(async () => {
        if (!user || !isOwnProfile) return;

        try {
            setIsSaving(true);
            setSaveError(null);

            const response = await ProfileService.updateProfile(editForm);
            setUser(response.data);
            setShowEditModal(false);

            // إلغاء الـ cache بعد التحديث
            const cacheKey = `profile_${user.id}`;
            profileCache.delete(cacheKey);
            
            await fetchProfileData();

        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'An error occurred while saving data');
        } finally {
            setIsSaving(false);
        }
    }, [user, isOwnProfile, editForm, fetchProfileData]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const loadOwnProfile = useCallback(async () => {
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
    }, [router, getCurrentUserId]);

    const handlePostDeleted = useCallback((deletedPostId: number) => {
        // إلغاء الـ cache عند حذف منشور
        const cacheKey = `profile_${memoizedTargetUserId}`;
        profileCache.delete(cacheKey);
    }, [memoizedTargetUserId]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p style={{
                    color: '#cbd5e1',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    letterSpacing: '0.5px'
                }}>
                    {memoizedTargetUserId ? `Loading Profile...` : 'Loading Your Profile...'}
                </p>
            </div>
        );
    }

    if (error || !user || !stats) {
        return (
            <div className={styles.errorState}>
                <div className={styles.errorIcon}>⚠️</div>
                <h2 style={{ color: 'white', marginBottom: '16px', fontSize: '2rem' }}>Error Loading Profile</h2>
                <p style={{ color: '#94a3b8', marginBottom: '32px', fontSize: '1.1rem', maxWidth: '400px' }}>
                    {error || 'Failed to load profile data'}
                </p>

                {memoizedTargetUserId && (
                    <div style={{ marginBottom: '16px' }}>
                        <button onClick={loadOwnProfile} style={{
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
                        }}>
                            View My Profile
                        </button>
                    </div>
                )}

                <button onClick={fetchProfileData} style={{
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
                }} onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(124, 58, 237, 0.5)';
                }} onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.4)';
                }}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <div className={styles.profileContent}>
                <div className={styles.profileSidebar}>
                    <div>
                        {isOwnProfile && (
                            <div className={styles.display}>
                                <button className={styles.editAvatarBtn} onClick={handleEditClick}>
                                    <MdEdit style={{ width: 20, height: 20 }} />
                                </button>
                                <button className={styles.editAvatarBtn} onClick={() => setShowUpdatePasswordModal(true)} disabled={isUpdatingPassword}>
                                    <MdLock style={{ width: 20, height: 20 }} />
                                </button>
                            </div>
                        )}

                        {!isOwnProfile && (
                            <div className={styles.displayNotOwner}>
                                <button onClick={loadOwnProfile} className={styles.editAvatarBtnNotOwner}>
                                    <HiArrowNarrowRight style={{ width: 20, height: 20 }} />
                                    back to my profile
                                </button>
                            </div>
                        )}

                        <div className={styles.profileAvatarSection}>
                            <img
                                src={user.image || 'https://via.placeholder.com/150'}
                                alt={user.full_name}
                                className={styles.profileAvatar}
                                loading="lazy"
                            />
                        </div>

                        <div className={styles.userInfo}>
                            <h2 className={styles.userName}>{user.full_name}</h2>
                            <div className={styles.userEmail}>
                                <MdOutlineEmail className={styles.emailIcon} />
                                <span>{user.email}</span>
                            </div>
                            <div className={styles.memberSince}>
                                Member since {formatDate(user.created_at)}
                            </div>
                        </div>

                        <div className={styles.profileStats}>
                            <div className={styles.statCard}>
                                <div className={styles.statNumber}>{stats.followers_count}</div>
                                <div className={styles.statLabel}>FOLLOWERS</div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.statNumber}>{stats.following_count}</div>
                                <div className={styles.statLabel}>FOLLOWING</div>
                            </div>
                        </div>

                        <div className={styles.profileInfoSection}>
                            <h3 className={styles.sectionTitle}>About me</h3>
                            <p className={styles.bioText}>{user.bio || 'No bio provided'}</p>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>PHONE</span>
                                    <span className={styles.infoValue}>{user.phone_number || 'Not provided'}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>GENDER</span>
                                    <span className={styles.infoValue}>{user.gender || 'Not specified'}</span>
                                </div>

                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>BIRTH DATE</span>
                                    <span className={styles.infoValue}>
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

                        {isOwnProfile && (
                            <div className={styles.accountActionsSection}>
                                <button className={styles.btnDeleteAccountSimple} onClick={() => setShowDeleteModal(true)} disabled={isDeletingAccount}>
                                    <MdDelete style={{ width: 18, height: 18, marginRight: 8 }} />
                                    {isDeletingAccount ? 'Processing...' : 'Delete Account'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.profileMain}>
                    <div className={styles.profileTabs}>
                        {isOwnProfile ? (
                            <>
                                <button className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`} onClick={() => setActiveTab('posts')}>
                                    Posts<span className={styles.tabCount}>{stats.posts_count}</span>
                                </button>
                                <button className={`${styles.tabButton} ${activeTab === 'followers' ? styles.active : ''}`} onClick={() => setActiveTab('followers')}>
                                    Followers<span className={styles.tabCount}>{stats.followers_count}</span>
                                </button>
                                <button className={`${styles.tabButton} ${activeTab === 'following' ? styles.active : ''}`} onClick={() => setActiveTab('following')}>
                                    Following<span className={styles.tabCount}>{stats.following_count}</span>
                                </button>
                            </>
                        ) : (
                            <button className={`${styles.tabButton} ${activeTab === 'posts' ? styles.active : ''}`} onClick={() => setActiveTab('posts')}>
                                Posts<span className={styles.tabCount}>{stats.posts_count}</span>
                            </button>
                        )}
                    </div>

                    {activeTab === 'posts' && (
                        <div className={styles.recentActivity}>
                            <UserPostsFeed
                                userId={memoizedTargetUserId || ''}
                                isOwnProfile={isOwnProfile}
                                onPostDeleted={handlePostDeleted}
                            />
                        </div>
                    )}

                    {activeTab === 'followers' && (
                        <div className={styles.recentActivity}>
                            <h3 className={styles.activityTitle}>Followers ({stats.followers_count})</h3>
                            <div className={styles.borderDev}>
                                <p className={styles.activityFollow}>
                                    <HiOutlineLightBulb className={styles.iconFollow} />
                                    {isOwnProfile ? 'Your followers will appear here' : 'Followers will appear here'}
                                </p>
                                {isOwnProfile ? <MyFollowers /> : (
                                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '1.1rem' }}>
                                        Followers list is only visible to profile owner
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'following' && (
                        <div className={styles.recentActivity}>
                            <h3 className={styles.activityTitle}>Following ({stats.following_count})</h3>
                            <div className={styles.borderDev}>
                                <p className={styles.activityFollow}>
                                    <HiOutlineLightBulb className={styles.iconFollow} />
                                    {isOwnProfile ? 'People you follow will appear here' : 'Following will appear here'}
                                </p>
                                {isOwnProfile ? <MyFollowing /> : (
                                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px', fontSize: '1.1rem' }}>
                                        Following list is only visible to profile owner
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && isOwnProfile && (
                <div className={styles.editModalOverlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.editModal} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>✕</button>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Edit Profile</h2>
                        </div>
                        <div className={styles.modalBody}>
                            {saveError && (
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#f87171',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: '24px',
                                    fontSize: '0.95rem',
                                    border: '1px solid rgba(239, 68, 68, 0.2)'
                                }}>{saveError}</div>
                            )}

                            <div className={styles.imagePreviewContainer}>
                                <img
                                    src={editForm.image || user.image || 'https://via.placeholder.com/150'}
                                    alt="Profile Preview"
                                    className={styles.imagePreview}
                                    loading="lazy"
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <InputField
                                    label="Profile Image URL"
                                    name="image"
                                    value={editForm.image || ''}
                                    onChange={handleInputChange}
                                    placeholder="Enter your image"
                                />
                            </div>

                            <div className={styles.formGroup}>
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

                            <div className={styles.formGroup}>
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

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Bio</label>
                                <textarea
                                    name="bio"
                                    value={editForm.bio || ''}
                                    onChange={handleInputChange}
                                    className={`${styles.formInput} ${styles.formTextarea}`}
                                    placeholder="Tell us about yourself..."
                                    rows={4}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <InputField
                                    label="Phone Number"
                                    name="phone_number"
                                    value={editForm.phone_number || ''}
                                    onChange={handleInputChange}
                                    placeholder="+963 234 567 89"
                                    error={errors.phone_number}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <SelectField
                                    label="Gender"
                                    name="gender"
                                    value={editForm.gender || ''}
                                    onChange={handleInputChange}
                                    options={genderOptions}
                                    error={errors.gender}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <DatePickerField
                                    label="Birth Date"
                                    name="birth_date"
                                    value={editForm.birth_date || ''}
                                    onChange={handleInputChange}
                                    max={today}
                                    error={errors.birth_date}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowEditModal(false)} disabled={isSaving}>
                                    Cancel
                                </button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSaveProfile} disabled={isSaving}>
                                    {isSaving ? (<><div className={styles.loadingSpinner} style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>Saving...</>) : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <UpdatePasswordModal
                isOpen={showUpdatePasswordModal}
                onClose={() => setShowUpdatePasswordModal(false)}
                onUpdate={handleUpdatePassword}
            />

            <DeleteAccountModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={handleDeleteAccount}
            />
        </div>
    );
};

export default Profile;