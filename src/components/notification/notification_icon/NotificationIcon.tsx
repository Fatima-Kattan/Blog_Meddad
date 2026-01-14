'use client';

import React, { useState, useEffect, useRef } from 'react';
import { HiBell } from 'react-icons/hi';
import styles from './notificationIcon.module.css';
import NotificationMenu from '../notificationMenu/NotificationMenu';
import { useNotifications } from '@/context/NotificationContext';

function NotificationIcon() {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  // ✅ إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.notificationWrapper} ref={wrapperRef}>
      <button
        className={styles.iconButton}
        aria-label="Notifications"
        onClick={toggleMenu}
      >
        <HiBell size={22} />
        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className={styles.menuWrapper}>
          <NotificationMenu />
        </div>
      )}
    </div>
  );
}

export default NotificationIcon;