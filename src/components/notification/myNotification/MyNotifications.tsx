'use client';

import React, { useEffect, useState } from 'react';
import styles from './myNotifications.module.css';
import { notificationsService, Notification } from '@/services/api/notification/notifications';
import NotificationItem from '@/components/notification/notificationItem/NotificationItem';
import { markAllAsRead } from '@/services/api/notification/allNotificationsRead';

function MyNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    // إزالة المتغيرات الخاصة بالـ Pagination
    // const [currentPage, setCurrentPage] = useState(1); ❌ حذف
    // const itemsPerPage = 5; ❌ حذف

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token") || "";
                const response = await notificationsService.getNotifications(token);
                setNotifications(response.data);
                setFilteredNotifications(response.data);
            } catch (err: any) {
                setError("You can't view notifications without signing in. Please sign in.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...notifications];

        if (filterType !== 'all') {
            const shouldBeRead = filterType === 'read';
            filtered = filtered.filter(notification =>
                notification.is_read === shouldBeRead
            );
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(notification =>
                new Date(notification.created_at) >= fromDate
            );
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(notification =>
                new Date(notification.created_at) <= toDate
            );
        }

        setFilteredNotifications(filtered);
        // إزالة هذا السطر لأنه مرتبط بالـ Pagination
        // setCurrentPage(1); ❌ حذف
    }, [filterType, dateFrom, dateTo, notifications]);

    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found");
                return;
            }

            const updatedNotifications = notifications.map(n => ({
                ...n,
                is_read: true,
                status: "read"
            }));

            setNotifications(updatedNotifications);

            let updatedFiltered = [...updatedNotifications];

            if (filterType !== 'all') {
                const shouldBeRead = filterType === 'read';
                updatedFiltered = updatedFiltered.filter(notification =>
                    notification.is_read === shouldBeRead
                );
            }

            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                updatedFiltered = updatedFiltered.filter(notification =>
                    new Date(notification.created_at) >= fromDate
                );
            }

            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                updatedFiltered = updatedFiltered.filter(notification =>
                    new Date(notification.created_at) <= toDate
                );
            }

            setFilteredNotifications(updatedFiltered);

            await markAllAsRead(token);

            setTimeout(async () => {
                try {
                    const updatedResponse = await notificationsService.getNotifications(token);
                    if (updatedResponse?.data) {
                        setNotifications(updatedResponse.data);
                    }
                } catch (e) {
                    console.log("Background refresh skipped");
                }
            }, 1000);

        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Failed to mark notifications as read");
        }
    };

    const handleNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, is_read: true, status: "read" } : n
        ));
    };

    const handleFilter = () => {
        console.log('Filter applied');
    };

    // إزالة حسابات الـ Pagination
    // const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage); ❌ حذف
    // const startIndex = (currentPage - 1) * itemsPerPage; ❌ حذف
    // const endIndex = startIndex + itemsPerPage; ❌ حذف
    // const currentNotifications = filteredNotifications.slice(startIndex, endIndex); ❌ حذف

    // استخدام filteredNotifications مباشرة بدلاً من currentNotifications
    const currentNotifications = filteredNotifications; // ✅ بسيط!

    const unreadCount = notifications.filter(n => !n.is_read).length;
    const todayCount = notifications.filter(n => {
        const today = new Date();
        const notificationDate = new Date(n.created_at);
        return notificationDate.toDateString() === today.toDateString();
    }).length;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.mainContainer}>

                <div className={styles.sectionsContainer}>
                    {/* Left Section - Filters */}
                    <div className={styles.leftSection}>
                        <h2>Filter</h2>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                Notification Type
                            </label>
                            <select
                                className={styles.filterSelect}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All Notifications</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                From Date
                            </label>
                            <input
                                type="date"
                                className={styles.filterDate}
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>

                        <div className={styles.filterGroup}>
                            <label className={styles.filterLabel}>
                                To Date
                            </label>
                            <input
                                type="date"
                                className={styles.filterDate}
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>

                        <button
                            className={styles.filterButton}
                            onClick={handleFilter}
                        >
                            Apply Filters
                        </button>

                        {/* Stats Section */}
                        <div className={styles.statsContainer}>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>{notifications.length}</div>
                                <div className={styles.statLabel}>Total</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>{unreadCount}</div>
                                <div className={styles.statLabel}>Unread</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>{todayCount}</div>
                                <div className={styles.statLabel}>Today</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statValue}>{filteredNotifications.length}</div>
                                <div className={styles.statLabel}>Filtered</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Notifications List */}
                    <div className={styles.rightSection}>
                        <div className={styles.notificationsHeader}>
                            <h2>Notifications List</h2>
                            <button
                                className={styles.markReadButton}
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0}
                            >
                                Mark all as read
                            </button>
                        </div>
                        <div className={styles.notificationsListItems}>
                            {loading && (
                                <div className={styles.loadingContainer}>
                                    <div className={styles.loadingSpinner}></div>
                                    <div className={styles.loadingText}>Loading notifications...</div>
                                </div>
                            )}

                            {error && <div className={styles.error}>{error}</div>}

                            {!loading && !error && filteredNotifications.length === 0 && (
                                <div className={styles.noNotifications}>
                                    <h3>No notifications found</h3>
                                    <p>Try adjusting your filters or check back later</p>
                                </div>
                            )}

                            {/* التغيير هنا: استخدام filteredNotifications مباشرة */}
                            {!loading && !error && filteredNotifications.length > 0 && (
                                <div className={styles.notificationsList}>
                                    {filteredNotifications.map((notification) => ( // ✅ بدون slice
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onMarkAsRead={() => handleNotificationRead(notification.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyNotifications;