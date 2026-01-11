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
    <div className={styles.card}>
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
      {showUnfollowButton && (
        <RiUserUnfollowLine 
        className={styles.unfollowIcon} 
        onClick={handleUnfollowClick}
        />
)}
    </div>
  );
}