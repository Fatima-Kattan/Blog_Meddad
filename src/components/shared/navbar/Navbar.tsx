// components/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Navbar.module.css';
import SearchBar from '../SearchBar/SearchBar';
import api from '@/services/api/auth/api';

// الأيقونات
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

// ⭐⭐ استيراد الهوك ⭐⭐
import { useUserData } from '@/hooks/useUserData';
import NotificationIcon from '@/components/notification_icon/NotificationIcon';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string>('home');
    const [menuReady, setMenuReady] = useState<boolean>(false);
    
    const pathname = usePathname();
    const router = useRouter();
    
    // ⭐⭐ استخدام الهوك ⭐⭐
    const {
        userData,
        userImage,
        userName,
        userImageLarge,
        isLoading: userLoading,
        isAuthenticated,
        logout: hookLogout,
        refreshData, 
        isRefreshing, 
        getStoredUser 
    } = useUserData({
        fetchFromAPI: true,
        useCache: true
    }); // ⭐⭐ أضف options هنا ⭐⭐

    const profileMenuRef = useRef<HTMLDivElement>(null);

    // تأثير التمرير
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ⭐⭐ دالة محسنة لتحديث البيانات ⭐⭐
    const handleProfileMenuClick = async () => {
        const willOpen = !showProfileMenu;
        
        if (willOpen) {
            // افتح القائمة فوراً
            setShowProfileMenu(true);
            
            // ثم حدث البيانات في الخلفية بدون انتظار
            setTimeout(async () => {
                try {
                    await refreshData();
                } catch (error) {
                    console.log('Background refresh failed:', error);
                }
            }, 0);
        } else {
            setShowProfileMenu(false);
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

    // ⭐⭐ دالة محسنة للحصول على الصورة ⭐⭐
    const getUserImage = (size: 'small' | 'large' = 'small'): string => {
        // استخدم البيانات المحلية أولاً
        const storedUser = getStoredUser?.();
        
        if (storedUser) {
            const name = storedUser.full_name || storedUser.email || 'User';
            
            if (storedUser.image && storedUser.image.trim() !== '' && storedUser.image !== 'null') {
                let img = storedUser.image;
                if (img.startsWith('/')) {
                    img = `http://localhost:8000${img}`;
                }
                return img;
            }
            
            // صورة افتراضية من الحروف
            const initials = name
                .split(' ')
                .map((word: string) => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
            
            const sizeValue = size === 'small' ? '100' : '200';
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=${sizeValue}`;
        }
        
        // استخدم البيانات من الهوك
        if (userImage && userImage !== '') {
            return size === 'large' ? userImageLarge : userImage;
        }
        
        // أخيراً صورة افتراضية
        const sizeValue = size === 'small' ? '100' : '200';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'US')}&background=8b5cf6&color=fff&bold=true&size=${sizeValue}`;
    };

    // معالجة أخطاء تحميل الصور
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        const storedUser = getStoredUser?.();
        const name = storedUser?.full_name || storedUser?.email || userName || 'User';
        const initials = name
            .split(' ')
            .map((word: string) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        
        imgElement.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=8b5cf6&color=fff&bold=true&size=100`;
    };

    // روابط النافبار
    const navLinks = [
        { id: 'home', href: '/', label: 'Home', icon: <HiHome size={24} /> },
        { id: 'trending', href: '/trending', label: 'Trending', icon: <FaRocket size={22} /> },
        { id: 'profile', href: '/profile', label: 'Profile', icon: <HiUserCircle size={24} style={{ color: '#8b5cf6' }} /> },
        { id: 'posts', href: '/posts', label: 'Posts', icon: <FaFeatherAlt size={22} /> },
    ];

    const handleTabClick = async (tabId: string, href: string) => {
        setActiveTab(tabId);
        if (tabId === 'profile') {
            // تحديث في الخلفية فقط
            setTimeout(() => {
                refreshData().catch(console.error);
            }, 0);
        }
        router.push(href);
        setIsMenuOpen(false);
        setShowProfileMenu(false);
    };

    const handleCreatePost = () => {
        router.push('/create-post');
    };

    // ⭐⭐ دالة تسجيل الخروج المعدلة ⭐⭐
    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (error: any) {
            console.log('Logout API response:', error?.response?.data);
        } finally {
            hookLogout();
            setShowProfileMenu(false);
            setIsMenuOpen(false);
            router.push('/');
        }
    };

    // ⭐⭐ الحصول على البيانات الحالية ⭐⭐
    const getCurrentUserData = () => {
        const storedUser = getStoredUser?.();
        return storedUser || userData;
    };

    // ⭐⭐ الحصول على الاسم الحالي ⭐⭐
    const getCurrentUserName = () => {
        const currentUser = getCurrentUserData();
        return currentUser?.full_name || currentUser?.email || userName || 'User';
    };

    // ⭐⭐ حالة التحميل ⭐⭐
    if (userLoading) {
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

    const currentUserName = getCurrentUserName();

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
                        {/* زر إنشاء منشور جديد */}
                        {isAuthenticated && (
                            <button 
                                className={styles.createButton}
                                onClick={handleCreatePost}
                                aria-label="Create post"
                            >
                                <IoMdAddCircleOutline size={25} />
                            </button>
                        )}

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
                                            alt={currentUserName}
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
                                                alt={currentUserName}
                                                className={styles.menuProfileImage}
                                                onError={handleImageError}
                                            />
                                            <div className={styles.profileInfo}>
                                                <h4>{currentUserName}</h4>
                                                <p>{userData?.email || 'No email'}</p>
                                            </div>
                                        </div>

                                        <div className={styles.menuDivider} />

                                        <Link 
                                            href="/profile" 
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
                                    <IoLogInOutline size={20}/>
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
                        {isAuthenticated && userData ? (
                            <div className={styles.mobileProfile}>
                                <img 
                                    src={getUserImage('large')}
                                    alt={currentUserName}
                                    className={styles.mobileProfileImage}
                                    onError={handleImageError}
                                />
                                <div>
                                    <h4>{currentUserName}</h4>
                                    <p>{userData?.email || 'No email'}</p>
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