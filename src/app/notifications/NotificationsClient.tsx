'use client';

import MyNotifications from '@/components/notification/myNotification/MyNotifications';

export default function NotificationsClient() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <MyNotifications />
            </div>
        </div>
    );
}