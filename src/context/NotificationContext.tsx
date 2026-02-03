'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { notificationsService } from '@/services/api/notification/notifications';
import { notificationReadService } from '@/services/api/notification/notificationAsRead';

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
  initialNotifications?: Notification[];    // ⭐ أضيفي هذا
  initialUnreadCount?: number;             // ⭐ أضيفي هذا
}

export const NotificationsProvider = ({ 
  children,
  initialNotifications = [],  // ⭐ قيمة افتراضية
  initialUnreadCount = 0      // ⭐ قيمة افتراضية
}: NotificationsProviderProps) => {
  // ⭐ استخدمي البيانات الأولية من السيرفر
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isLoading, setIsLoading] = useState(false); // ⭐ false لأن البيانات جاهزة أولياً
  const [isPolling, setIsPolling] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  const [hasInitialData, setHasInitialData] = useState<boolean>(initialNotifications.length > 0);
  
  const CACHE_DURATION = 5000; // 5 ثواني

  // ✅ جلب التوكن من localStorage بعد التأكد من العميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
      }
    }
  }, []);

  // ✅ جلب الإشعارات مع cache و retry
  const fetchNotifications = useCallback(async (force = false, retryCount = 0) => {
    if (!token) return;

    // ✅ التحقق من الكاش
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
      
      // ✅ Retry logic (3 محاولات)
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

  // ✅ تحديث إشعار واحد
  const markAsRead = useCallback(async (id: number) => {
    if (!token) return;

    // 1. ✅ تحديث فوري في الواجهة
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      )
    );
    
    // 2. ✅ تحديث unreadCount فورياً
    setUnreadCount(prev => Math.max(0, prev - 1));

    // 3. ✅ إرسال الطلب للسيرفر
    try {
      await notificationReadService.markAsRead(id, token);
      console.log('✅ تم تحديث السيرفر بنجاح');
    } catch (err) {
      console.error('❌ فشل تحديث السيرفر:', err);
      
      // 4. ✅ التراجع عن التحديث
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, is_read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  }, [token]);

  // ✅ تحديث الكل
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0 || !token) return;

    // 1. ✅ تحديث فوري
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    // 2. ✅ إرسال للسيرفر
    try {
      // إذا كان لديك خدمة markAllAsRead
      // await markAllAsReadService(token);
    } catch (err) {
      console.error('❌ فشل تحديث الكل:', err);
    }
  }, [unreadCount, token]);

  // ✅ تحديث يدوي
  const handleManualRefresh = useCallback(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // ✅ Polling ذكي (فقط عند رؤية الصفحة)
  useEffect(() => {
    if (!isPolling || !token) return;

    // ⭐ إذا لم يكن لدينا بيانات أولية، جلب البيانات
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
    }, 15000); // 15 ثانية

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