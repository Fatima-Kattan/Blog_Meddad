'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ProfileService from '@/services/api/auth/profileService';
import {
  HiHome,
  HiUsers,
  HiCalendar,
  HiVideoCamera,
  HiPhotograph,
  HiShoppingBag,
  HiCamera,
  HiPaperClip,
  HiHashtag,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCake,
  HiOutlineUser,
  HiOutlineLocationMarker
} from 'react-icons/hi';
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

const LeftSidebar: React.FC<LeftSidebarProps> = ({ compact = false }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllStats, setShowAllStats] = useState(false);

  // جلب بيانات المستخدم الحالي
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const response = await ProfileService.getUserProfile();

        if (response.success && response.data.user) {
          const userData = response.data.user;
          const stats = response.data.stats;

          setUser({
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
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // تنسيق التاريخ
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // تنسيق الأرقام (2.3k)
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const navItems = [
    { icon: <HiHome className={styles.navIcon} />, label: 'Feed', href: '/', count: null },
    { icon: <HiUsers className={styles.navIcon} />, label: 'Friends', href: '/following', count: null },
    { icon: <HiCalendar className={styles.navIcon} />, label: 'notification', href: '/notifications', count: null },
  ];


  const handleProfileClick = () => {
    router.push(`/profile/${user?.id}`);
  };

  const handleFriendsClick = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  router.push('/following');
};

const handleNotificationsClick = (e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  router.push('/notifications');
};

const handleNavClick = (item: any, e: React.MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
  
  if (item.label === 'Friends') {
    handleFriendsClick(e);
  } else if (item.label === 'Notifications') {
    handleNotificationsClick(e);
  } else {
    router.push(item.href);
  }
};

  if (loading) {
    return (
      <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className={`${styles.sidebar} ${compact ? styles.compact : ''}`}>
      {/* قسم البروفايل */}
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
            <h3 className={styles.profileName}>
              {user?.full_name || 'User'}
            </h3>
            <p className={styles.profileUsername}>
              {user?.email ? user.email : 'username'}
            </p>
          </div>
        </div>

        {/* إحصائيات البروفايل */}
        <div className={styles.profileStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {user ? formatNumber(user.followers_count) : '0'}
            </span>
            <span className={styles.statLabel}>follower</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {user?.following_count || '0'}
            </span>
            <span className={styles.statLabel}>following</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statNumber}>
              {user?.posts_count || '0'}
            </span>
            <span className={styles.statLabel}>post</span>
          </div>
        </div>


      </div>


      {/* قسم التنقل */}
      <h3 className={styles.navigation_h3}> <MdAssistantNavigation className={styles.color_icon} />navigation :</h3>
      <nav className={styles.navigation}>

        <ul className={styles.navList}>

          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}
                onClick={(e) => handleNavClick(item, e)}
              >
                {item.icon}
                <span className={styles.navLabel}>{item.label}</span>
                {item.count !== null && (
                  <span className={styles.navCount}>{item.count}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

    </aside>
  );
};

export default LeftSidebar;