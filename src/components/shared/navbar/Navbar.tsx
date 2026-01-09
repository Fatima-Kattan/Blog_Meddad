'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Navbar.module.css';
import { 
  HiSearch, HiUser, HiMenu, HiX, HiHome, 
  HiBookOpen, HiPencilAlt, HiBell, HiLogin,
  HiHashtag  // بدل Save - للتسجيل
} from 'react-icons/hi';
import { 
  FaLayerGroup, 
  FaInfoCircle,
  FaFire  // أيقونة مميزة مثل الصورة
} from 'react-icons/fa';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔥 **تغيير الروابط لتكون مثل الصورة**
  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: <HiHome size={20} /> },
    { href: '/trending', label: 'رائج', icon: <FaFire size={20} /> }, // بدل Save
    { href: '/articles', label: 'المقالات', icon: <HiBookOpen size={20} /> },
    { href: '/categories', label: 'التصنيفات', icon: <HiHashtag size={20} /> }, // Hashtag بدل FlayerGroup
    { href: '/write', label: 'اكتب مقال', icon: <HiPencilAlt size={20} /> },
    { href: '/about', label: 'عن المدونة', icon: <FaInfoCircle size={20} /> },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('بحث عن:', searchQuery);
    }
  };

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* القسم الأيسر */}
        <div className={styles.leftSection}>
          {/* اللوجو */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <HiBookOpen size={28} />
            </div>
            <span className={styles.logoText}>
              <span className={styles.logoPrimary}>مدونة</span>
              <span className={styles.logoSecondary}>مــداد</span>
            </span>
          </Link>

          {/* قائمة التنقل */}
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

        {/* القسم الأيمن */}
        <div className={styles.rightSection}>
          {/* شريط البحث */}
          <form onSubmit={handleSearch} className={styles.searchContainer}>
            <button type="submit" className={styles.searchButton}>
              <HiSearch size={20} />
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
            {/* زر الإشعارات */}
            <button className={styles.iconButton}>
              <HiBell size={22} />
              <span className={styles.notificationBadge}>3</span>
            </button>

            {/* زر الدخول */}
            <Link href="/login" className={styles.authButton}>
              <HiUser size={22} />
              <span>دخول</span>
            </Link>

            {/* زر القائمة للموبايل */}
            <button
              className={styles.menuButton}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* قائمة الموبايل */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <h3>القائمة</h3>
            <button
              onClick={() => setIsMenuOpen(false)}
              className={styles.closeMenuButton}
            >
              <HiX size={24} />
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
                <HiLogin size={20} />
                <span>تسجيل الدخول</span>
              </Link>
              <Link href="/register" className={styles.mobileRegisterButton}>
                <HiUser size={20} />
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