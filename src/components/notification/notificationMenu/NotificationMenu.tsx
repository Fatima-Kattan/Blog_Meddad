'use client';
import React from 'react';
import NotificationItem from '../notificationItem/NotificationItem';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import styles from './notificationMenu.module.css'; // ✅ استدعاء ملف التنسيقات

function NotificationMenu() {
  const { notifications, markAsRead } = useNotifications();
  const router = useRouter();

  if (notifications.length === 0) {
    return <div className={styles.empty}>لا يوجد إشعارات</div>;
  }

  const limitedNotifications = notifications.slice(0, 3);

  return (
    <div className={styles.menu}>
      <h1 className={styles.title}>Notifications</h1>
      {limitedNotifications.map(n => (
        <NotificationItem
          key={n.id}
          notification={n}
          onUpdate={() => markAsRead(n.id)}
        />
      ))}

      {notifications.length > 3 && (
        <button
          onClick={() => router.push('/notifications')}
          className={styles.moreBtn} // ✅ زر منسق من الملف الخارجي
        >
          Show All Notifications 
        </button>
      )}
    </div>
  );
}

export default NotificationMenu;