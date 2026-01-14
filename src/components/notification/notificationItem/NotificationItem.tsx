'use client';
import React, { useState } from 'react';
import styles from './notificationItem.module.css';
import { useNotifications } from '@/context/NotificationContext'; // ✅ استدعاء الـ context
import { FiCheckCircle } from 'react-icons/fi';

interface Actor {
    id: number;
    full_name: string;
    image: string;
}
interface Notification {
    id: number;
    type: string;
    title: string;
    body: string;
    post_id?: number | null;
    comment_id?: number | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    actor: Actor;
}

interface NotificationItemProps {
    notification: Notification;
}


function NotificationItem({ notification }: NotificationItemProps) {
    const [loading, setLoading] = useState(false);
    const { markAsRead } = useNotifications(); // ✅ ناخد الدالة من الـ context
    const isRead = Boolean(notification.is_read);

    const handleMarkAsRead = async () => {
        try {
            setLoading(true);
            await markAsRead(notification.id); // ✅ استدعاء الدالة من الـ context
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`${styles.notificationItem} ${isRead ? styles.read : styles.unread}`}>
            <div className={styles.actorImage}>
                <img src={notification.actor.image} alt={notification.actor.full_name} />
            </div>

            <div className={styles.notificationContent}>
                <div className={styles.notificationTitle}>{notification.title}</div>
                <div className={styles.notificationType}>{notification.type}</div>
                <div className={styles.notificationTime}>
                    {new Date(notification.created_at).toLocaleString()}
                </div>
            </div>

            {!isRead && (
                <button
                    className={styles.markReadBtn}
                    onClick={handleMarkAsRead}
                    disabled={loading}
                >
                    <FiCheckCircle />
                    {loading ? '...جارٍ التحديث' : 'تمّت القراءة'}
                </button>
            )}
        </div>
    );
}

export default NotificationItem;