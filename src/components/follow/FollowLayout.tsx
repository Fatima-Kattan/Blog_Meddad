"use client";
import React from "react";
import UserCard from "@/components/shared/UserCard/UserCard";
import styles from "./followLayout.module.css";
import { IoPeople } from "react-icons/io5";
import LoadingIcon from "@/components/shared/LoadingIcon/LoadingIcon"; // ✅ استيراد LoadingIcon

interface User {
  id: number | string;
  name: string;
  image: string;
  bio?: string;
}

interface FollowLayoutProps {
  title: string;
  count: number;
  users: User[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  emptySubmessage: string;
  onUserClick?: (user: User) => void;
  icon?: React.ReactNode;
  statsTitle?: string;
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
  icon = <IoPeople />,
  statsTitle = "Total Connections",
  showUnfollowButton = false,
  onUnfollow,
}: FollowLayoutProps) {
  // ✅ تم تعديل هذا الجزء فقط - حالة التحميل
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.backgroundEffects}>
          <div className={styles.gradientOrb}></div>
          <div className={styles.gradientOrb}></div>
        </div>
        {/* ✅ تم استبدال هذا الجزء فقط */}
        <div style={{ 
          position: 'relative', 
          minHeight: '500px',
          width: '100%' 
        }}>
          <LoadingIcon 
            size={60}
            message="Loading your connections..."
            position="absolute"
          />
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
          <div className={styles.statsIcon}><IoPeople className={styles.icon}/></div>
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