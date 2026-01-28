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
    FaFeatherAlt,
    FaMagic
} from 'react-icons/fa';

import {
    RiUserStarLine
} from 'react-icons/ri';

import { IoMdAddCircleOutline, IoMdNotifications } from "react-icons/io";
import { IoLogInOutline } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5'; // ⭐ إضافة أيقونة الإشعارات
import NotificationIcon from '@/components/notification/notification_icon/NotificationIcon';

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

    // ⭐⭐ **تعديل navLinks - إزالة التريندينج وإضافة الإشعارات** ⭐⭐
    const navLinks = [
        { id: 'home', href: '/', label: 'Home', icon: <HiHome size={24} /> },
        { id: 'notifications', href: '/notifications', label: 'Notifications', icon: <IoMdNotifications size={22} /> }, // ⭐ استبدال التريندينج بالإشعارات
        {
            id: 'profile',
            href: '#', // ⭐⭐ غير إلى #
            label: 'Profile',
            icon: <HiUserCircle size={24} style={{ color: '#8b5cf6' }} />
        },
        { id: 'posts', href: '#', label: 'MyPosts', icon: <FaFeatherAlt size={22} /> }, // ⭐⭐ غير هنا!
    ];

    // ⭐⭐ **تعديل handleTabClick** ⭐⭐
    const handleTabClick = useCallback(async (tabId: string, href: string) => {
        setActiveTab(tabId);

        // ⭐⭐ التعامل الخاص بالبروفايل من القائمة السفلية
        if (tabId === 'profile') {
            // ⭐⭐ تأكد من إزالة العلامة إذا فُتح من الأسفل
            if (typeof window !== 'undefined') {
                localStorage.removeItem('profileOpenedFromTop');
            }

            const userId = getCurrentUserId();
            if (userId) {
                router.push(`/profile/${userId}`);
            }

            setIsMenuOpen(false);
            setShowProfileMenu(false);
            return;
        }

        if (tabId === 'posts') {
            const userId = getCurrentUserId();
            if (userId) {
                router.push(`/myPost/${userId}`);
            } else {
                // إذا لم يكن مسجل دخول، أرسله لصفحة تسجيل الدخول
                router.push('/login');
            }

            setIsMenuOpen(false);
            setShowProfileMenu(false);
            return;
        }

        // لباقي التبويبات
        router.push(href);
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
                localStorage.removeItem('profileOpenedFromTop');
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
                                {/*  <FaMagic size={24} /> */}
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="-5.12 -5.12 522.24 522.24"
                                    fill="#814aec"
                                >
                                    <g>
                                        <path d="M421.073,221.719c-0.578,11.719-9.469,26.188-23.797,40.094v183.25c-0.016,4.719-1.875,8.719-5.016,11.844 c-3.156,3.063-7.25,4.875-12.063,4.906H81.558c-4.781-0.031-8.891-1.844-12.047-4.906c-3.141-3.125-4.984-7.125-5-11.844V152.219 c0.016-4.703,1.859-8.719,5-11.844c3.156-3.063,7.266-4.875,12.047-4.906h158.609c12.828-16.844,27.781-34.094,44.719-49.906 c0.078-0.094,0.141-0.188,0.219-0.281H81.558c-18.75-0.016-35.984,7.531-48.25,19.594c-12.328,12.063-20.016,28.938-20,47.344 v292.844c-0.016,18.406,7.672,35.313,20,47.344C45.573,504.469,62.808,512,81.558,512h298.641c18.781,0,36.016-7.531,48.281-19.594 c12.297-12.031,20-28.938,19.984-47.344V203.469c0,0-0.125-0.156-0.328-0.313C440.37,209.813,431.323,216.156,421.073,221.719z" />
                                        <path d="M498.058,0c0,0-15.688,23.438-118.156,58.109C275.417,93.469,211.104,237.313,211.104,237.313 c-15.484,29.469-76.688,151.906-76.688,151.906c-16.859,31.625,14.031,50.313,32.156,17.656 c34.734-62.688,57.156-119.969,109.969-121.594c77.047-2.375,129.734-69.656,113.156-66.531c-21.813,9.5-69.906,0.719-41.578-3.656 c68-5.453,109.906-56.563,96.25-60.031c-24.109,9.281-46.594,0.469-51-2.188C513.386,138.281,498.058,0,498.058,0z" />
                                    </g>
                                </svg>
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
                                {/* <FaMagic size={24} /> */}
                                <svg
                                    version="1.1"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="-5.12 -5.12 522.24 522.24"
                                    fill="#814aec"
                                >
                                    <g>
                                        <path d="M421.073,221.719c-0.578,11.719-9.469,26.188-23.797,40.094v183.25c-0.016,4.719-1.875,8.719-5.016,11.844 c-3.156,3.063-7.25,4.875-12.063,4.906H81.558c-4.781-0.031-8.891-1.844-12.047-4.906c-3.141-3.125-4.984-7.125-5-11.844V152.219 c0.016-4.703,1.859-8.719,5-11.844c3.156-3.063,7.266-4.875,12.047-4.906h158.609c12.828-16.844,27.781-34.094,44.719-49.906 c0.078-0.094,0.141-0.188,0.219-0.281H81.558c-18.75-0.016-35.984,7.531-48.25,19.594c-12.328,12.063-20.016,28.938-20,47.344 v292.844c-0.016,18.406,7.672,35.313,20,47.344C45.573,504.469,62.808,512,81.558,512h298.641c18.781,0,36.016-7.531,48.281-19.594 c12.297-12.031,20-28.938,19.984-47.344V203.469c0,0-0.125-0.156-0.328-0.313C440.37,209.813,431.323,216.156,421.073,221.719z" />
                                        <path d="M498.058,0c0,0-15.688,23.438-118.156,58.109C275.417,93.469,211.104,237.313,211.104,237.313 c-15.484,29.469-76.688,151.906-76.688,151.906c-16.859,31.625,14.031,50.313,32.156,17.656 c34.734-62.688,57.156-119.969,109.969-121.594c77.047-2.375,129.734-69.656,113.156-66.531c-21.813,9.5-69.906,0.719-41.578-3.656 c68-5.453,109.906-56.563,96.25-60.031c-24.109,9.281-46.594,0.469-51-2.188C513.386,138.281,498.058,0,498.058,0z" />
                                    </g>
                                </svg>
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


                        {/* إشعارات (في الجزء العلوي للأجهزة الكبيرة فقط) */}
                        {isAuthenticated && (
                            <div className={styles.notificationContainer}>
                                <NotificationIcon />
                            </div>
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

                                        {/* ⭐⭐ استخدم button بدل Link للتحكم الكامل ⭐⭐ */}
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => {
                                                // ⭐⭐ ضع علامة أن البروفايل فتح من الأعلى
                                                if (typeof window !== 'undefined') {
                                                    localStorage.setItem('profileOpenedFromTop', 'true');
                                                }

                                                // انتقل إلى صفحة البروفايل
                                                const userId = getCurrentUserId();
                                                if (userId) {
                                                    router.push(`/profile/${userId}`);
                                                }

                                                // أغلق القائمة المنسدلة
                                                setShowProfileMenu(false);
                                            }}
                                        >
                                            <RiUserStarLine size={20} />
                                            <span>My Profile</span>
                                        </button>
                                        {/* ⭐⭐ تعديل هنا! ⭐⭐ */}
                                        <button
                                            className={styles.menuItem}
                                            onClick={() => {
                                                const userId = getCurrentUserId();
                                                if (userId) {
                                                    router.push(`/myPost/${userId}`);
                                                }
                                                setShowProfileMenu(false);
                                            }}
                                        >
                                            <FaFeatherAlt size={20} />
                                            <span>My Posts</span>
                                        </button>

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
                                {/* ⭐⭐ تعديل رابط البروفايل للجوال ⭐⭐ */}
                                <button
                                    className={`${styles.mobileLink} ${activeTab === 'profile' ? styles.active : ''}`}
                                    onClick={() => {
                                        // ⭐⭐ ضع علامة للفتح من الأعلى للجوال أيضًا
                                        if (typeof window !== 'undefined') {
                                            localStorage.setItem('profileOpenedFromTop', 'true');
                                        }

                                        const userId = getCurrentUserId();
                                        if (userId) {
                                            router.push(`/profile/${userId}`);
                                        }
                                        setIsMenuOpen(false);
                                    }}
                                >
                                    <span className={styles.mobileLinkIcon}>
                                        <HiUserCircle size={24} style={{ color: '#8b5cf6' }} />
                                    </span>
                                    Profile
                                </button>

                                {/* ⭐⭐ تعديل هنا! ⭐⭐ */}
                                {navLinks.filter(link => link.id !== 'profile' && link.id !== 'posts').map((link) => (
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

                                {/* ⭐⭐ رابط Posts خاص في قائمة الجوال ⭐⭐ */}
                                <button
                                    className={`${styles.mobileLink} ${activeTab === 'posts' ? styles.active : ''}`}
                                    onClick={() => {
                                        const userId = getCurrentUserId();
                                        if (userId) {
                                            router.push(`/myPost/${userId}`);
                                            setActiveTab('posts');
                                            setIsMenuOpen(false);
                                            setShowProfileMenu(false);
                                        }
                                    }}
                                >
                                    <span className={styles.mobileLinkIcon}>
                                        <FaFeatherAlt size={24} />
                                    </span>
                                    Posts
                                </button>

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