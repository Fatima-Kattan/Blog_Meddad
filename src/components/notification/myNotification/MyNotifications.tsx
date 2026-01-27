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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token") || "";
                const response = await notificationsService.getNotifications(token);
                setNotifications(response.data);
                setFilteredNotifications(response.data);
            } catch (err: any) {
                setError("Failed to fetch notifications. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...notifications];

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(notification =>
                notification.status?.toLowerCase() === filterType
            );
        }

        // Apply date filters
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filtered = filtered.filter(notification =>
                new Date(notification.createdAt) >= fromDate
            );
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(notification =>
                new Date(notification.createdAt) <= toDate
            );
        }

        setFilteredNotifications(filtered);
        setCurrentPage(1);
    }, [filterType, dateFrom, dateTo, notifications]);



    // const handleMarkAllAsRead = async () => {
    //     try {
    //         const token = localStorage.getItem("token");
    //         if (!token) {
    //             setError("No token found");
    //             return;
    //         }

    //         console.log("Calling markAllAsRead function...");
    //         const result = await  markAllAsRead(token); // استخدم markAllAsRead مباشرة
    //         console.log("Result:", result);

    //         if (result?.data) {
    //             setNotifications(result.data);
    //         }
    //     } catch (err: any) {
    //         console.error("Error:", err);
    //         setError(err.response?.data?.message || "Failed to mark notifications as read");
    //     }
    // };
   
    // const handleMarkAllAsRead = async () => {
    //     try {
    //         const token = localStorage.getItem("token");
    //         if (!token) {
    //             setError("No token found");
    //             return;
    //         }

    //         // تنفيذ العملية
    //         await markAllAsRead(token);

    //         // تحديث محلي فوري
    //         // setNotifications(prevNotifications =>
    //         //     prevNotifications.map(notification => ({
    //         //         ...notification,
    //         //         isRead: true,
    //         //         status: 'read'
    //         //     }))
    //         // );
    //         setNotifications(prev =>
    //             prev.map(n => ({ ...n, isRead: true, status: "read" }))
    //         );

    //         // مزامنة بالخلفية بدون انتظار
    //         notificationsService.getNotifications(token)
    //             .then(updatedResponse => {
    //                 if (updatedResponse?.data) {
    //                     setNotifications(updatedResponse.data);
    //                 }
    //             })
    //             .catch(() => {
    //                 console.log("Background refresh failed, using local update");
    //             });


    //         // إعادة جلب البيانات في الخلفية للتأكد من المزامنة
    //         try {
    //             const updatedResponse = await notificationsService.getNotifications(token);
    //             if (updatedResponse?.data) {
    //                 setNotifications(updatedResponse.data);
    //             }
    //         } catch (e) {
    //             console.log("Background refresh failed, using local update");
    //         }

    //     } catch (err: any) {
    //         console.error("Error:", err);
    //         setError(err.response?.data?.message || "Failed to mark notifications as read");
    //     }
    // };
    const handleMarkAllAsRead = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("No token found");
                return;
            }
    
            // 1. تحديث واجهة المستخدم فورياً
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true, status: "read" }))
            );
    
            // 2. تنفيذ العملية على الخادم (بدون انتظار)
            markAllAsRead(token).catch(err => {
                console.error("Server update failed:", err);
                // يمكنك إعادة حالة "unread" إذا فشلت
                // أو عرض رسالة خطأ للمستخدم
            });
    
            // 3. إعادة جلب البيانات في الخلفية (اختياري)
            // انتظر قليلاً للتأكد من تحديث الخادم
            setTimeout(async () => {
                try {
                    const updatedResponse = await notificationsService.getNotifications(token);
                    if (updatedResponse?.data) {
                        setNotifications(updatedResponse.data);
                    }
                } catch (e) {
                    console.log("Background refresh skipped");
                }
            }, 1000); // انتظر ثانية واحدة
    
        } catch (err: any) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Failed to mark notifications as read");
        }
    };
    const handleFilter = () => {
        // Filter logic is handled in useEffect
        console.log('Filter applied');
    };

    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentNotifications = filteredNotifications.slice(startIndex, endIndex);

    // Calculate stats
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const todayCount = notifications.filter(n => {
        const today = new Date();
        const notificationDate = new Date(n.createdAt);
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
                                <option value="important">Important</option>
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

                        {/* Loading State */}
                        {loading && (
                            <div className={styles.loadingContainer}>
                                <div className={styles.loadingSpinner}></div>
                                <div className={styles.loadingText}>Loading notifications...</div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && <div className={styles.error}>{error}</div>}

                        {/* Empty State */}
                        {!loading && !error && filteredNotifications.length === 0 && (
                            <div className={styles.noNotifications}>
                                <h3>No notifications found</h3>
                                <p>Try adjusting your filters or check back later</p>
                            </div>
                        )}

                        {/* Notifications List */}
                        {!loading && !error && filteredNotifications.length > 0 && (
                            <>
                                <div className={styles.notificationsList}>
                                    {currentNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                        />
                                    ))}

                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyNotifications;