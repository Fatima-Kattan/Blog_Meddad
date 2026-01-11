// components/shared/FollowLayout/FollowLayout.tsx
"use client";
import React from "react";
import UserCard from "@/components/shared/UserCard/UserCard";
import styles from "./followLayout.module.css";

interface User {
  id: number | string;
  name: string;
  image: string;
  bio?: string;
}

interface FollowLayoutProps {
  title: string;              // العنوان (Your Followers / Your Followings)
  count: number;              // العدد الكلي
  users: User[];              // قائمة المستخدمين
  loading: boolean;           // حالة التحميل
  error: string | null;       // حالة الخطأ
  emptyMessage: string;       // رسالة فارغة
  emptySubmessage: string;    // رسالة فرعية فارغة
  onUserClick?: (user: User) => void; // حدث النقر على مستخدم
  icon?: React.ReactNode;     // أيقونة قابلة للتخصيص
  statsTitle?: string;        // عنوان الإحصائيات القابل للتخصيص

  // جديد: دعم زر Unfollow
  showUnfollowButton?: boolean;
  onUnfollow?: (userId: number | string) => Promise<void> | void;
}

export default function FollowLayout({
  title,
  count,
  users,
  loading,
  error,
  emptyMessage,
  emptySubmessage,
  onUserClick,
  icon = "👥",
  statsTitle = "Total Connections",
  showUnfollowButton = false,
  onUnfollow,
}: FollowLayoutProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundEffects}>
          <div className={styles.gradientOrb}></div>
          <div className={styles.gradientOrb}></div>
        </div>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading your connections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundEffects}>
          <div className={styles.gradientOrb}></div>
          <div className={styles.gradientOrb}></div>
        </div>
        <div className={styles.errorContainer}>
          <div className={styles.emptyIcon}></div>
          <p className={styles.emptyMessage}>Oops! Something went wrong</p>
          <p className={styles.emptySubmessage}>{error}</p>
          <button
            className={styles.errorButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.backgroundEffects}>
        <div className={styles.gradientOrb}></div>
        <div className={styles.gradientOrb}></div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.statsContainer}>
          <div className={styles.statsIcon}>{icon}</div>
          <div className={styles.statsContent}>
            <div className={styles.statsTitle}>{statsTitle}</div>
            <div className={styles.statsNumber}>{count}</div>
          </div>
        </div>
      </header>

      <section className={styles.listSection}>
        {users?.length > 0 ? (
          <div className={styles.listContainer}>
            {users.map((user) => (
              <div key={user.id} className={styles.userCardWrapper}>
                <UserCard
                  user={user}
                  onClick={() => onUserClick && onUserClick(user)}
                  showUnfollowButton={showUnfollowButton}
                  onUnfollow={onUnfollow}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}></div>
            <p className={styles.emptyMessage}>{emptyMessage}</p>
            <p className={styles.emptySubmessage}>{emptySubmessage}</p>
          </div>
        )}
      </section>
    </div>
  );
}