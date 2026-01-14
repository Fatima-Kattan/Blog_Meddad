// src/components/shared/navbar/Navbar.tsx
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import SearchBar from '../SearchBar/SearchBar';
import api from '@/services/api/auth/api';

// الأيقونات الأساسية فقط
import {
    HiHome,
    HiUserCircle,
    HiNewspaper,
    HiMenu,
    HiX
} from 'react-icons/hi';

import {
    FaRocket,
    FaFeatherAlt,
    FaMagic
} from 'react-icons/fa';

import {
    RiUserStarLine
} from 'react-icons/ri';

import { IoMdAddCircleOutline } from "react-icons/io";
import { IoLogInOutline } from 'react-icons/io5';
import NotificationIcon from '@/components/notification_icon/NotificationIcon';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [isLoading, setIsLoading] = useState(true);
    const [lastDataRefresh, setLastDataRefresh] = useState<Date | null>(null);

    const pathname = usePathname();
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [userImage, setUserImage] = useState<string>('');
    const [userFromDB, setUserFromDB] = useState<any>(null);

    const profileMenuRef = useRef<HTMLDivElement>(null);

    // تأثير التمرير
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ⭐⭐ **دالة لجلب بيانات المستخدم من قاعدة البيانات** ⭐⭐
    const fetchUserFromDatabase = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            // جلب بيانات المستخدم من API
            const response = await api.get('/user', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.data && response.data.data.user) {
                const userData = response.data.data.user;
                setUserFromDB(userData);
                setIsAuthenticated(true);

                // تحديث localStorage بالبيانات المحدثة
                localStorage.setItem('user', JSON.stringify(userData));

                // معالجة الصورة
                processUserImage(userData);
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Error fetching user from database:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    // ⭐⭐ **دالة لمعالجة صورة المستخدم** ⭐⭐
    const processUserImage = (userData: any) => {
        let imageUrl = '';

        if (!userData.image ||
            userData.image === 'null' ||
            userData.image === null ||
            userData.image.trim() === '') {

            // إنشاء صورة افتراضية
            const name = userData.full_name || userData.email || 'User';
            const initials = name
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=100`;
        } else {
            // إذا كانت هناك صورة
            imageUrl = userData.image;

            // تحويل المسار النسبي إلى مسار كامل
            if (imageUrl.startsWith('/')) {
                imageUrl = `http://localhost:8000${imageUrl}`;
            } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                // إذا كانت مجرد اسم ملف
                imageUrl = `http://localhost:8000/uploads/${imageUrl}`;
            }
        }

        setUserImage(imageUrl);
        setUser(userData);
    };

    // ⭐⭐ **التحقق من تسجيل الدخول وجلب البيانات** ⭐⭐
    useEffect(() => {
        const checkAuthAndFetchData = async () => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem('user');

                if (token) {
                    if (storedUser) {
                        try {
                            const parsedUser = JSON.parse(storedUser);
                            setUser(parsedUser);
                            processUserImage(parsedUser);
                            setIsAuthenticated(true);

                            // ⭐⭐ **جلب البيانات المحدثة من قاعدة البيانات** ⭐⭐
                            fetchUserFromDatabase();
                        } catch (error) {
                            console.error('Error parsing stored user:', error);
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            setIsAuthenticated(false);
                        }
                    } else {
                        // ⭐⭐ **لا يوجد بيانات في localStorage، جلب من قاعدة البيانات** ⭐⭐
                        await fetchUserFromDatabase();
                    }
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                    setUserImage('');
                }
                setIsLoading(false);
            }
        };

        checkAuthAndFetchData();
    }, []);

    // ⭐⭐ **جلب بيانات محدثة عند فتح البروفايل** ⭐⭐
    const refreshUserData = async () => {
        if (isAuthenticated) {
            await fetchUserFromDatabase();
        }
    };

    // ⭐⭐ **التعديل هنا: فتح قائمة البروفايل بدون تأخير** ⭐⭐
    const handleProfileMenuClick = () => {
        // افتح القائمة فوراً
        setShowProfileMenu(!showProfileMenu);
        
        // إذا بتفتح القائمة وكانت البيانات قديمة
        if (!showProfileMenu) {
            const now = new Date();
            if (!lastDataRefresh || (now.getTime() - lastDataRefresh.getTime()) > 60000) { // دقيقة
                refreshUserData().then(() => {
                    setLastDataRefresh(now);
                });
            }
        }
    };

    // إغلاق القائمة عند النقر خارجها
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current &&
                !profileMenuRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // ⭐ **دالة للحصول على صورة المستخدم (من قاعدة البيانات أولاً)** ⭐
    const getUserImage = (size: 'small' | 'large' = 'small') => {
        // استخدم البيانات من قاعدة البيانات أولاً
        const currentUser = userFromDB || user;

        if (userImage && userImage !== '') return userImage;

        if (currentUser) {
            const name = currentUser.full_name || currentUser.email || 'User';
            const initials = name
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

            const imageSize = size === 'small' ? '100' : '200';
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=${imageSize}`;
        }

        // صورة افتراضية
        return `https://ui-avatars.com/api/?name=US&background=8b5cf6&color=fff&bold=true&size=${size === 'small' ? '100' : '200'}`;
    };

    // معالجة أخطاء تحميل الصور
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        const currentUser = userFromDB || user;
        const name = currentUser?.full_name || currentUser?.email || 'User';
        const initials = name
            .split(' ')
            .map((word: string) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=100`;
    };

    // ⭐⭐ **دالة للحصول على الـ ID للمستخدم الحالي** ⭐⭐
    const getCurrentUserId = useCallback(() => {
        const currentUser = userFromDB || user;
        return currentUser?.id || null;
    }, [userFromDB, user]);

    const navLinks = [
        { id: 'home', href: '/', label: 'Home', icon: <HiHome size={24} /> },
        { id: 'trending', href: '/trending', label: 'Trending', icon: <FaRocket size={22} /> },
        {
            id: 'profile',
            href: `/profile/${getCurrentUserId()}`,
            label: 'Profile',
            icon: <HiUserCircle size={24} style={{ color: '#8b5cf6' }} />
        },
        { id: 'posts', href: '/posts', label: 'Posts', icon: <FaFeatherAlt size={22} /> },
    ];

    const handleTabClick = useCallback(async (tabId: string, href: string) => {
        setActiveTab(tabId);
        
        // إذا كان الرابط يحتوي على ID ديناميكي، تأكد من وجوده
        if (tabId === 'profile' && href.includes('/profile/')) {
            const userId = getCurrentUserId();
            if (!userId) {
                // إذا لم يكن هناك userId، اذهب إلى صفحة تسجيل الدخول
                router.push('/login');
                return;
            }
            router.push(`/profile/${userId}`);
        } else {
            router.push(href);
        }

        setIsMenuOpen(false);
        setShowProfileMenu(false);
    }, [router, getCurrentUserId]);

    const handleCreatePost = useCallback(() => {
        router.push('/create-post');
    }, [router]);

    const handleLogout = useCallback(async () => {
        try {
            await api.post('/logout');
        } catch (error: any) {
            console.log('Logout API response:', error?.response?.data);
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }

            setIsAuthenticated(false);
            setUser(null);
            setUserFromDB(null);
            setUserImage('');
            setShowProfileMenu(false);
            setIsMenuOpen(false);

            router.push('/');
        }
    }, [router]);

    // ⭐⭐ **دالة للحصول على بيانات المستخدم الحالية** ⭐⭐
    const getCurrentUser = useCallback(() => {
        return userFromDB || user;
    }, [userFromDB, user]);

    if (isLoading) {
        return (
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    <div className={styles.leftSection}>
                        <div className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <FaMagic size={24} />
                            </div>
                            <span className={styles.logoText}>WeShare</span>
                        </div>
                    </div>
                    <div className={styles.centerSection}>
                        <div className={styles.searchPlaceholder}></div>
                    </div>
                    <div className={styles.rightSection}>
                        <div className={styles.authButtonsPlaceholder}></div>
                    </div>
                </div>
            </nav>
        );
    }

    const currentUser = getCurrentUser();

    return (
        <>
            <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
                <div className={styles.container}>
                    {/* الجزء الأيسر: اللوجو */}
                    <div className={styles.leftSection}>
                        <Link href="/" className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <FaMagic size={24} />
                            </div>
                            <span className={styles.logoText}>WeShare</span>
                        </Link>
                    </div>

                    {/* الجزء الأوسط: شريط البحث */}
                    <div className={styles.centerSection}>
                        <SearchBar />
                    </div>

                    {/* الجزء الأيمن: أيقونات */}
                    <div className={styles.rightSection}>
                        

                        {/* إشعارات */}
                        {isAuthenticated && (
                            <NotificationIcon/>
                        )}

                        {/* عرض البروفايل أو أزرار الدخول */}
                        {isAuthenticated ? (
                            <div className={styles.profileDropdown} ref={profileMenuRef}>
                                <button
                                    className={styles.profileButton}
                                    onClick={handleProfileMenuClick}
                                    aria-label="Profile menu"
                                    aria-expanded={showProfileMenu ? "true" : "false"}
                                >
                                    <div className={styles.profileAvatar}>
                                        <img
                                            src={getUserImage('small')}
                                            alt={currentUser?.full_name || 'User'}
                                            className={styles.profileImage}
                                            onError={handleImageError}
                                        />
                                        <div className={styles.profileStatus}></div>
                                    </div>
                                </button>

                                {/* قائمة البروفايل المنسدلة */}
                                {showProfileMenu && (
                                    <div className={styles.profileMenu}>
                                        <div className={styles.profileMenuHeader}>
                                            <img
                                                src={getUserImage('large')}
                                                alt={currentUser?.full_name || 'User'}
                                                className={styles.menuProfileImage}
                                                onError={handleImageError}
                                            />
                                            <div className={styles.profileInfo}>
                                                <h4>{currentUser?.full_name || 'User'}</h4>
                                                <p>{currentUser?.email || 'No email'}</p>
                                                
                                            </div>
                                        </div>

                                        <div className={styles.menuDivider} />

                                        <Link
                                            href={`/profile/${getCurrentUserId()}`}
                                            className={styles.menuItem}
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <RiUserStarLine size={20} />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link
                                            href="/posts"
                                            className={styles.menuItem}
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <FaFeatherAlt size={20} />
                                            <span>My Posts</span>
                                        </Link>

                                        <div className={styles.menuDivider} />

                                        <button
                                            className={styles.logoutButton}
                                            onClick={handleLogout}
                                            aria-label="Log out"
                                        >
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.authButtons}>
                                <Link href="/login" className={styles.loginButton}>
                                    <IoLogInOutline size={20} />
                                    <span>Login</span>
                                </Link>
                                <Link href="/register" className={styles.registerButton}>
                                    <HiNewspaper size={20} />
                                    <span>Register</span>
                                </Link>
                            </div>
                        )}

                        {/* زر القائمة للموبايل */}
                        <button
                            className={styles.mobileMenuButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                        </button>
                    </div>
                </div>

                {/* القائمة السفلية */}
                <div className={styles.bottomNav}>
                    <div className={styles.bottomNavContainer}>
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => handleTabClick(link.id, link.href)}
                                className={`${styles.bottomNavLink} ${activeTab === link.id ? styles.active : ''}`}
                                aria-label={link.label}
                            >
                                <span className={styles.bottomNavIcon}>{link.icon}</span>
                                <span className={styles.bottomNavLabel}>{link.label}</span>
                                {activeTab === link.id && <div className={styles.activeIndicator} />}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* قائمة الجوال المنبثقة */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuHeader}>
                        {isAuthenticated && currentUser ? (
                            <div className={styles.mobileProfile}>
                                <img
                                    src={getUserImage('large')}
                                    alt={currentUser.full_name}
                                    className={styles.mobileProfileImage}
                                    onError={handleImageError}
                                />
                                <div>
                                    <h4>{currentUser.full_name || 'User'}</h4>
                                    <p>{currentUser.email || 'No email'}</p>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.mobileAuthHeader}>
                                <h3>Welcome to WeShare</h3>
                                <p>Sign in to access all features</p>
                            </div>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className={styles.closeMenuButton}
                            aria-label="Close menu"
                        >
                            <HiX size={24} />
                        </button>
                    </div>

                    <div className={styles.mobileLinks}>
                        {isAuthenticated ? (
                            <>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        className={`${styles.mobileLink} ${activeTab === link.id ? styles.active : ''}`}
                                        onClick={() => {
                                            setActiveTab(link.id);
                                            setIsMenuOpen(false);
                                            setShowProfileMenu(false);
                                        }}
                                    >
                                        <span className={styles.mobileLinkIcon}>{link.icon}</span>
                                        {link.label}
                                    </Link>
                                ))}

                                <div className={styles.mobileDivider} />

                                <button
                                    className={styles.mobileMenuItem}
                                    onClick={() => {
                                        handleCreatePost();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <IoMdAddCircleOutline size={20} />
                                    <span>Create Post</span>
                                </button>

                                <div className={styles.mobileDivider} />

                                <button
                                    className={styles.mobileLogoutButton}
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className={styles.mobileMenuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <HiUserCircle size={20} />
                                    <span>Login</span>
                                </Link>
                                <Link
                                    href="/register"
                                    className={styles.mobileMenuItem}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <HiNewspaper size={20} />
                                    <span>Register</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;