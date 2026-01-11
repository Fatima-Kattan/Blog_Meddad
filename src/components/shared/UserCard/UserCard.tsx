// components/UserCard.tsx
"use client";
import { useState } from "react";
import styles from "./UserCard.module.css";
import { RiUserUnfollowLine } from "react-icons/ri";
interface User {
  id: number | string;
  name: string;
  image: string;
  bio?: string;
}

interface UserCardProps {
  user: User;
  onClick?: () => void;
  showUnfollowButton?: boolean; // جديد
  onUnfollow?: (userId: number | string) => Promise<void> | void; // جديد
}

export default function UserCard({ 
  user, 
  onClick,
  showUnfollowButton = false, // جديد
  onUnfollow 
}: UserCardProps) {
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const handleUnfollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // لمنع تنفيذ onClick الخاص بالكارد
    
    if (isUnfollowing || !onUnfollow) return;
    
    setIsUnfollowing(true);
    try {
      await onUnfollow(user.id);
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsUnfollowing(false);
    }
  };

  const handleCardClick = () => {
    if (onClick && !isUnfollowing) {
      onClick();
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.avatarWrapper}>
        <img
          src={user.image}
          alt={user.name}
          width={64}
          height={64}
          className={styles.avatar}
        />
      </div>
      
      <div className={styles.userInfo}>
        <h3 className={styles.name}>{user.name}</h3>
        {user.bio && (
          <p className={styles.bio}>{user.bio}</p>
        )}
      </div>

      {/* زر Unfollow - يظهر فقط إذا showUnfollowButton = true */}
      {/* {showUnfollowButton && (
        <div className={styles.unfollowContainer}>
          <button 
            className={`${styles.unfollowButton} ${isUnfollowing ? styles.loading : ''}`}
            onClick={handleUnfollowClick}
            disabled={isUnfollowing}
            title="إلغاء المتابعة"
          >
            {isUnfollowing ? (
              <div className={styles.unfollowSpinner}></div>
            ) : (
              <span className={styles.unfollowText}>إلغاء المتابعة</span>
            )}
          </button>
        </div>
      )} */}
      {/* {showUnfollowButton && (
        <div className={styles.unfollowContainer}>
          <button 
            className={`${styles.unfollowButton} ${isUnfollowing ? styles.loading : ''}`}
            onClick={handleUnfollowClick}
            disabled={isUnfollowing}
            title="إلغاء المتابعة"
          >
            {isUnfollowing ? (
              <div className={styles.unfollowSpinner}></div>
            ) : (
              <>
                <RiUserUnfollowLine className={styles.unfollowIcon} />
                <span className={styles.unfollowText}>إلغاء المتابعة</span>
              </>
            )}
          </button>
        </div>
      )} */}
      {showUnfollowButton && (
        <RiUserUnfollowLine className={styles.unfollowIcon} />
)}
    </div>
  );
}