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
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isPolling, setIsPolling] = useState(true); // ✅ للتحكم في الـ Polling

  // ✅ جلب الإشعارات
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await notificationsService.getNotifications(token);
      setNotifications(res.data);
      
      // ✅ حساب عدد غير المقروء
      const unread = res.data.filter((n: Notification) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('خطأ في جلب الإشعارات:', err);
    }
  }, []);

  // ✅ تحديث إشعار واحد - Optimistic Update
  const markAsRead = useCallback(async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. ✅ تحديث فوري في الواجهة (Optimistic Update)
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      )
    );
    
    // 2. ✅ تحديث unreadCount فورياً
    setUnreadCount(prev => Math.max(0, prev - 1));

    // 3. ✅ إرسال الطلب للسيرفر (في الخلفية)
    try {
      await notificationReadService.markAsRead(id, token);
      console.log('✅ تم تحديث السيرفر بنجاح');
    } catch (err) {
      console.error('❌ فشل تحديث السيرفر:', err);
      
      // 4. ✅ التراجع عن التحديث إذا فشل السيرفر
      setNotifications(prev => 
        prev.map(n => 
          n.id === id ? { ...n, is_read: false } : n
        )
      );
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // ✅ تحديث الكل
  const markAllAsRead = useCallback(async () => {
    if (unreadCount === 0) return;
    
    const token = localStorage.getItem('token');
    if (!token) return;

    // 1. ✅ تحديث فوري
    setNotifications(prev => 
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);

    // 2. ✅ إرسال للسيرفر
    try {
      // تأكدي من وجود هذه الخدمة
      // await markAllAsReadService(token);
    } catch (err) {
      console.error('❌ فشل تحديث الكل:', err);
    }
  }, [unreadCount]);

  // ✅ Polling كل 30 ثانية
  useEffect(() => {
    if (!isPolling) return;

    fetchNotifications(); // جلب أولي
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 ثانية

    return () => clearInterval(interval);
  }, [fetchNotifications, isPolling]);

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAsRead,
        markAllAsRead 
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