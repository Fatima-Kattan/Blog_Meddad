'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationsService as fetchService } from '@/services/api/notification/notifications';
import { notificationsService as readService } from '@/services/api/notification/notificationAsRead';

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetchService.getNotifications(token);
      // ✅ السيرفر بيرجع البيانات + العدد الجاهز
      setNotifications(res.data);
      setUnreadCount(res.count); 
    } catch (err) {
      console.error('فشل في جلب الإشعارات:', err);
    }
  };

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await readService.markAsRead(id, token);
      // ✅ تحديث الإشعارات
      setNotifications(prev =>
        prev.map(n => n.id === id ? res.data.notification : n)
      );
      // ✅ العدد الجديد من السيرفر
      setUnreadCount(res.data.count); 
    } catch (err) {
      console.error('فشل في تحديث الإشعار:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications يجب استخدامه داخل NotificationsProvider');
  return context;
};