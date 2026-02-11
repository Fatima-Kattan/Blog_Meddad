'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationsService } from '@/services/api/notification/notifications';
import { notificationReadService } from '@/services/api/notification/notificationAsRead';
import { markAllAsRead as markAllAsReadService } from '@/services/api/notification/allNotificationsRead'; // ✅ استيراد الفنكشن

export interface Notification {
  id: number;
  type: string;
  body: string;
  post_id?: number | null;
  comment_id?: number | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  actor: {
    id: number;
    full_name: string;
    image: string;
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (force?: boolean) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  handleManualRefresh: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

interface NotificationsProviderProps {
  children: React.ReactNode;
  initialNotifications?: Notification[];
  initialUnreadCount?: number;
}

export const NotificationsProvider = ({
  children,
  initialNotifications = [],
  initialUnreadCount = 0
}: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [hasInitialData, setHasInitialData] = useState<boolean>(initialNotifications.length > 0);

  const CACHE_DURATION = 5000;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  const fetchNotifications = useCallback(async (force = false, retryCount = 0) => {
    if (!token) return;

    const now = Date.now();
    if (!force && now - lastFetched < CACHE_DURATION) {
      return;
    }

    try {
      setIsLoading(true);
      const res = await notificationsService.getNotifications(token);

      setNotifications(res.data);
      const unread = res.data.filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
      setHasInitialData(true);

      setLastFetched(now);

      if (retryCount > 0) {
        console.log('✅ تمت إعادة المحاولة بنجاح');
      }
    } catch (err) {
      console.error('خطأ في جلب الإشعارات:', err);

      if (retryCount < 3) {
        const delay = Math.min(1000 * 2 ** retryCount, 10000);
        setTimeout(() => {
          fetchNotifications(true, retryCount + 1);
        }, delay);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, lastFetched]);

  const markAsRead = useCallback(async (id: number) => {
    if (!token) return;

    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationReadService.markAsRead(id, token);
      console.log('✅ تم تحديث السيرفر بنجاح');
    } catch (err) {
      console.error('❌ فشل تحديث السيرفر:', err);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  }, [token]);
  const markAllAsRead = useCallback(async () => {
    if (!token || unreadCount === 0) return;
    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    try {
      await markAllAsReadService(token);
      console.log('✅ تم تحديث جميع الإشعارات بنجاح');
      await fetchNotifications(true);

    } catch (err) {
      console.error('❌ فشل تحديث جميع الإشعارات:', err);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);

      throw err;
    }
  }, [token, unreadCount, notifications, fetchNotifications]);

  const handleManualRefresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isPolling || !token) return;

    if (!hasInitialData) {
      fetchNotifications();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchNotifications();
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications, isPolling, token, hasInitialData]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        handleManualRefresh
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('استخدمي useNotifications داخل Provider');
  return context;
};