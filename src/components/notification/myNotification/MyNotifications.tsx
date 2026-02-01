'use client';

import React, { useEffect, useState, useMemo } from 'react';
import styles from './myNotifications.module.css';
import NotificationItem from '@/components/notification/notificationItem/NotificationItem';
import { useNotifications } from '@/context/NotificationContext'; // ✅ أضيفي

function MyNotifications() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    // ✅ أضيفي:
    const { 
        notifications, 
        unreadCount, 
        fetchNotifications, 
        markAllAsRead 
    } = useNotifications();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                await fetchNotifications(); // ✅ غيري
            } catch (err: any) {
                setError("You can't view notifications without signing in. Please sign in.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredNotifications = useMemo(() => {
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

        return filtered;
    }, [notifications, filterType, dateFrom, dateTo]);

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead(); // ✅ غيري
        } catch (err) {
            setError("Failed to mark all as read");
            setTimeout(() => setError(null), 3000);
        }
    };

    const resetFilters = () => {
        setFilterType('all');
        setDateFrom('');
        setDateTo('');
    };

    const { todayCount } = useMemo(() => {
        const today = notifications.filter(n => {
            const todayDate = new Date();
            const notificationDate = new Date(n.created_at);
            return notificationDate.toDateString() === todayDate.toDateString();
        }).length;
        
        return { todayCount: today };
    }, [notifications]);

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
                            onClick={resetFilters}
                            disabled={filterType === 'all' && dateFrom === '' && dateTo === ''}
                        >
                            Reset All Filters
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
                                {/* ⭐ استخدمي filteredNotifications مباشرة */}
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

                            {!loading && !error && filteredNotifications.length > 0 && (
                                <div className={styles.notificationsList}>
                                    {/* ⭐ استخدمي filteredNotifications مباشرة */}
                                    {filteredNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
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