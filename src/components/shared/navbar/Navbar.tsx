'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

// أيقونات SVG بديلة
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);

const BookOpenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
);

const LogInIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
        <polyline points="10 17 15 12 10 7"></polyline>
        <line x1="15" y1="12" x2="3" y2="12"></line>
    </svg>
);

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // تأثير التمرير
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '/', label: 'الرئيسية', icon: <HomeIcon /> },
        { href: '/articles', label: 'المقالات', icon: <BookOpenIcon /> },
        { href: '/categories', label: 'التصنيفات', icon: <MenuIcon /> },
        { href: '/write', label: 'اكتب مقال', icon: <EditIcon /> },
        { href: '/about', label: 'عن المدونة', icon: <BookOpenIcon /> },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            console.log('بحث عن:', searchQuery);
            // هنا يمكن توجيه المستخدم لصفحة البحث
            // router.push(`/search?q=${searchQuery}`);
        }
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.container}>
                {/* القسم الأيسر: اللوجو والقائمة */}
                <div className={styles.leftSection}>
                    {/* اللوجو */}
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <BookOpenIcon />
                        </div>
                        <span className={styles.logoText}>
                            <span className={styles.logoPrimary}>مدونة</span>
                            <span className={styles.logoSecondary}>مــداد</span>
                        </span>
                    </Link>

                    {/* قائمة التنقل - تظهر في الشاشات الكبيرة */}
                    <div className={styles.desktopLinks}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={styles.navLink}
                            >
                                <span className={styles.linkIcon}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* القسم الأيمن: البحث والأيقونات */}
                <div className={styles.rightSection}>
                    {/* شريط البحث */}
                    <form onSubmit={handleSearch} className={styles.searchContainer}>
                        <button type="submit" className={styles.searchButton}>
                            <SearchIcon />
                        </button>
                        <input
                            type="text"
                            placeholder="ابحث عن مقالات..."
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* أيقونات المستخدم */}
                    <div className={styles.iconsContainer}>
                        {/* إشعارات */}
                        <button className={styles.iconButton}>
                            <BellIcon />
                            <span className={styles.notificationBadge}>3</span>
                        </button>

                        {/* زر الدخول/المستخدم */}
                        <Link href="/login" className={styles.authButton}>
                            <UserIcon />
                            <span>دخول</span>
                        </Link>

                        {/* زر القائمة للموبايل */}
                        <button
                            className={styles.menuButton}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* القائمة المنبثقة للموبايل */}
            {isMenuOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileMenuHeader}>
                        <h3>القائمة</h3>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className={styles.closeMenuButton}
                        >
                            <XIcon />
                        </button>
                    </div>

                    <div className={styles.mobileLinks}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={styles.mobileLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <span className={styles.mobileLinkIcon}>{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}

                        <div className={styles.mobileAuth}>
                            <Link href="/login" className={styles.mobileLoginButton}>
                                <LogInIcon />
                                <span>تسجيل الدخول</span>
                            </Link>
                            <Link href="/register" className={styles.mobileRegisterButton}>
                                <UserIcon />
                                <span>إنشاء حساب</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;