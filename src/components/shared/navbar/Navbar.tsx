'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import SearchBar from '../SearchBar/SearchBar';
// أيقونات
import {
    HiBell,
    HiHome,
    HiUserCircle,
    HiNewspaper,
    HiMenu,
    HiX
} from 'react-icons/hi';

import {
    FaRocket,
    FaFeatherAlt,
    FaMagic,
    FaCompass,
    FaCrown,
    FaUserEdit
} from 'react-icons/fa';

import {
    RiUserHeartLine,
    RiSparkling2Fill,
    RiUserStarLine
} from 'react-icons/ri';

import { TbUserHexagon } from 'react-icons/tb';
import { CgProfile } from 'react-icons/cg';
import { IoMdAddCircleOutline } from "react-icons/io"; // الأيقونة الجديدة

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const pathname = usePathname();
    
    // أضف state لتسجيل الدخول
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // إخفاء النافبار في صفحات الدخول والتسجيل
    const hiddenPaths = ['/login', '/register'];
    if (hiddenPaths.includes(pathname)) {
        return null;
    }

    // تأثير التمرير
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // محاكاة التحقق من تسجيل الدخول
    useEffect(() => {
        // هنا رح تحقق من localStorage أو session أو API
        const token = localStorage.getItem('token'); // أو أي طريقة تحقق
        setIsLoggedIn(!!token);
        
        // لمحاكاة التغيير، يمكنك إزالته لاحقاً
        // setIsLoggedIn(false); // للمستخدم غير المسجل
        // setIsLoggedIn(true); // للمستخدم المسجل
    }, []);

    // روابط النافبار
    const navLinks = [
        {
            id: 'home',
            href: '/',
            label: 'Home',
            icon: <HiHome size={24} />
        },
        {
            id: 'trending',
            href: '/trending',
            label: 'Trending',
            icon: <FaRocket size={22} />
        },
        {
            id: 'profile',
            href: '/profile',
            label: 'Profile',
            icon: <CgProfile size={24} style={{ color: '#8b5cf6' }} /> // أيقونة بروفايل أحلى
        },
        {
            id: 'posts',
            href: '/posts',
            label: 'Posts',
            icon: <FaFeatherAlt size={22} />
        },
        
    ];

    // عند النقر على تب
    const handleTabClick = (tabId: string) => {
        setActiveTab(tabId);
    };

    // زر إنشاء منشور
    const handleCreatePost = () => {
        console.log('Create post clicked');
        // يمكن توجيه المستخدم لصفحة الإنشاء
        // router.push('/create-post');
    };

    // معالج الخروج
    const handleLogout = () => {
        console.log('Logout clicked');
        // يمكن إضافة منطق الخروج هنا
        localStorage.removeItem('token'); // مثال
        setIsLoggedIn(false);
        // logout();
        // router.push('/login');
    };

    // معالج الدخول
    const handleLogin = () => {
        // سيناريو محاكاة - في الواقع رح يكون هناك صفحة دخول
        localStorage.setItem('token', 'sample-token');
        setIsLoggedIn(true);
    };

    // معالج التسجيل
    const handleRegister = () => {
        // سيناريو محاكاة
        localStorage.setItem('token', 'sample-token');
        setIsLoggedIn(true);
    };

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
                        {/* زر إنشاء منشور جديد - يظهر فقط إذا كان مسجل دخول */}
                        {isLoggedIn && (
                            <button 
                                className={styles.createButton}
                                onClick={handleCreatePost}
                            >
                                <IoMdAddCircleOutline size={25} />
                            </button>
                        )}

                        {/* إشعارات - تظهر فقط إذا كان مسجل دخول */}
                        {isLoggedIn && (
                            <div className={styles.notificationWrapper}>
                                <button className={styles.iconButton}>
                                    <HiBell size={22} />
                                    <span className={styles.notificationBadge}>5</span>
                                </button>
                            </div>
                        )}

                        {/* إذا كان مسجل دخول: عرض البروفايل، وإلا: عرض زرين الدخول والتسجيل */}
                        {isLoggedIn ? (
                            <div className={styles.profileDropdown}>
                                <button 
                                    className={styles.profileButton}
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    <div className={styles.profileAvatar}>
                                        <TbUserHexagon size={36} className={styles.profileIcon} />
                                        <div className={styles.profileStatus}></div>
                                    </div>
                                </button>

                                {/* قائمة البروفايل المنسدلة */}
                                {showProfileMenu && (
                                    <div className={styles.profileMenu}>
                                        <div className={styles.profileMenuHeader}>
                                            <TbUserHexagon size={48} className={styles.menuProfileIcon} />
                                            <div className={styles.profileInfo}>
                                                <h4>John Doe</h4>
                                                <p>@johndoe</p>
                                            </div>
                                        </div>

                                        <div className={styles.menuDivider} />

                                        <Link href="/profile" className={styles.menuItem}>
                                            <RiUserStarLine size={20} />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link href="/posts" className={styles.menuItem}>
                                            <FaFeatherAlt size={20} />
                                            <span>My Posts</span>
                                        </Link>
                                        {/* <Link href="/settings" className={styles.menuItem}>
                                            <FaUserEdit size={20} />
                                            <span>Edit Profile</span>
                                        </Link> */}

                                        <div className={styles.menuDivider} />

                                        {/* <button className={styles.menuItem}>
                                            <HiBell size={20} />
                                            <span>Notifications</span>
                                            <span className={styles.notificationCount}>5</span>
                                        </button> */}
                                        

                                        <div className={styles.menuDivider} />

                                        <button 
                                            className={styles.logoutButton}
                                            onClick={handleLogout}
                                        >
                                            <span>Log Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={styles.authButtons}>
                                <Link href="/login" className={styles.loginButton}>
                                    <HiUserCircle size={20} />
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

                {/* القائمة السفلية (للأيقونات) */}
                <div className={styles.bottomNav}>
                    <div className={styles.bottomNavContainer}>
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => {
                                    handleTabClick(link.id);
                                    if (link.id === 'profile') {
                                        setShowProfileMenu(false);
                                    }
                                }}
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
                        {isLoggedIn ? (
                            <div className={styles.mobileProfile}>
                                <TbUserHexagon size={52} className={styles.mobileProfileIcon} />
                                <div>
                                    <h4>John Doe</h4>
                                    <p>@johndoe</p>
                                    <span className={styles.mobileUserBadge}>
                                        <FaCrown size={12} /> Premium
                                    </span>
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
                        {isLoggedIn ? (
                            // إذا مسجل دخول: عرض القائمة العادية
                            <>
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        className={`${styles.mobileLink} ${activeTab === link.id ? styles.active : ''}`}
                                        onClick={() => {
                                            handleTabClick(link.id);
                                            setIsMenuOpen(false);
                                        }}
                                    >
                                        <span className={styles.mobileLinkIcon}>{link.icon}</span>
                                        {link.label}
                                        {activeTab === link.id && <div className={styles.mobileActiveDot} />}
                                    </Link>
                                ))}

                                <div className={styles.mobileDivider} />

                                <button className={styles.mobileMenuItem}>
                                    <IoMdAddCircleOutline size={20} />
                                    <span>Create Post</span>
                                </button>
                                <button className={styles.mobileMenuItem}>
                                    <HiNewspaper size={20} />
                                    <span>My Articles</span>
                                </button>
                                <button className={styles.mobileMenuItem}>
                                    <FaUserEdit size={20} />
                                    <span>Edit Profile</span>
                                </button>
                                <button className={styles.mobileMenuItem}>
                                    <HiBell size={20} />
                                    <span>Notifications</span>
                                    <span className={styles.mobileNotificationCount}>5</span>
                                </button>

                                <div className={styles.mobileDivider} />

                                <button 
                                    className={styles.mobileLogoutButton}
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </button>
                            </>
                        ) : (
                            // إذا غير مسجل: عرض أزرار الدخول والتسجيل
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
                                
                                <div className={styles.mobileDivider} />
                                
                                <div className={styles.mobileInfo}>
                                    <p>Create an account to:</p>
                                    <ul>
                                        <li>Share posts</li>
                                        <li>Follow others</li>
                                        <li>Save articles</li>
                                        <li>Get notifications</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;