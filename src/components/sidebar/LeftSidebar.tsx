'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import useSWR from 'swr';
import ProfileService from '@/services/api/auth/profileService';
import { HiHome, HiUsers, HiCalendar } from 'react-icons/hi';
import styles from './sidebar.module.css';
import { MdAssistantNavigation } from 'react-icons/md';

interface LeftSidebarProps {
  compact?: boolean;
}

interface UserData {
  id: number;
  full_name: string;
  image: string;
  email: string;
  bio?: string;
  phone_number?: string;
  location?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  created_at?: string;
}

// fetcher بسيط
const fetcher = async () => {
  const response = await ProfileService.getUserProfile();
  if (response.success && response.data.user) {
    const { user: userData, stats } = response.data;
    return {
      id: userData.id,
      full_name: userData.full_name,
      image: userData.image || '/default-avatar.png',
      email: userData.email,
      bio: userData.bio,
      phone_number: userData.phone_number,
      followers_count: stats.followers_count,
      following_count: stats.following_count,
      posts_count: stats.posts_count,
      created_at: userData.created_at
    };
  }
  throw new Error('Failed to fetch user');
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({ compact = false }) => {
  const pathname = usePathname();
  const router = useRouter();

  // SWR بيخزن ويعمل revalidate تلقائي
  const { data: user, error, isLoading } = useSWR('currentUser', fetcher, {
    revalidateOnFocus: false,   // ما يعيد التحميل كل ما رجعت للصفحة
    refreshInterval: 5 * 60 * 1000 // تحديث كل 5 دقائق
  });

  const formatNumber = (num: number) =>
    num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

  const navItems = [
    { icon: <HiHome className={styles.navIcon} />, label: 'Feed', href: '/' },
    { icon: <HiUsers className={styles.navIcon} />, label: 'Friends', href: '/following' },
    { icon: <HiCalendar className={styles.navIcon} />, label: 'Notifications', href: '/notifications' }
  ];

  const handleNavClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  };

  const handleProfileClick = () => {
    if (user?.id) router.push(`/profile/${user.id}`);
  };

  if (isLoading) {
    return (
      <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </aside>
    );
  }

  if (error) {
    return <div>خطأ بتحميل البيانات</div>;
  }

  return (
    <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`}>
      <div className={styles.profileSection} onClick={handleProfileClick}>
        <div className={styles.display}>
          <div className={styles.profileImageContainer}>
            <img
              src={user?.image || '/default-avatar.png'}
              alt={user?.full_name || 'User'}
              className={styles.profileImage}
            />
          </div>
          <div className={styles.profileInfo}>
            <h3 className={styles.profileName}>{user?.full_name || 'User'}</h3>
            <p className={styles.profileUsername}>{user?.email || 'username'}</p>
          </div>
        </div>

        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {user ? formatNumber(user.followers_count) : '0'}
            </span>
            <span className={styles.statLabel}>follower</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{user?.following_count || '0'}</span>
            <span className={styles.statLabel}>following</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{user?.posts_count || '0'}</span>
            <span className={styles.statLabel}>post</span>
          </div>
        </div>
      </div>

      <h3 className={styles.navigation_h3}>
        <MdAssistantNavigation className={styles.color_icon} /> navigation :
      </h3>
      <nav className={styles.navigation}>
        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                onClick={(e) => handleNavClick(item.href, e)}
              >
                {item.icon}
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default LeftSidebar;