'use client';
import React, { useState } from 'react';
import styles from './notificationItem.module.css';
import { useNotifications } from '@/context/NotificationContext';
import { FiCheckCircle } from 'react-icons/fi';

interface Actor {
    id: number;
    full_name: string;
    image: string;
}
interface Notification {
    id: number;
    type: string;
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
                {notification.actor?.image ? (
                    <img
                        src={notification.actor.image}
                        alt={notification.actor.full_name || 'User'}
                        className={styles.actorImg}
                    />
                ) : (
                    <span className={styles.actorInitials}>
                        {notification.actor?.full_name?.charAt(0) || 'U'}
                    </span>
                )}
            </div>
            <div className={styles.notificationContent}>
                <div className={styles.notificationType}>
                    {notification.type === 'mention' ? '📝 New Post' :
                        notification.type === 'follow' ? '👤 Follow' :
                            notification.type === 'like' ? '❤️ Like' : '💬 Comment'}
                </div>
                <div className={styles.notificationTitle}>
                    {notification.type === 'mention' && `${notification.actor.full_name} has just published a new post`}
                    {notification.type === 'follow' && `${notification.actor.full_name} started following you`}
                    {notification.type === 'like' && `${notification.actor.full_name} liked your post`}
                    {notification.type === 'comment' && `${notification.actor.full_name} commented on your post`}

                </div>
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
                    {loading ? 'Updating' : 'Marke as read'}
                </button>
            )}
        </div>
    );
}

export default NotificationItem;