// components/UserCard.tsx
"use client";
import { useState } from "react";
import styles from "./UserCard.module.css";
import { RiUserUnfollowLine } from "react-icons/ri";
import FollowIcon from "@/components/shared/follow_icon/FollowIcon";
import Link from "next/link";

interface User {
  id: number | string;
  name: string;
  image: string;
  bio?: string;
}

interface UserCardProps {
  user: User;
  onClick?: () => void;
  showUnfollowButton?: boolean;
  onUnfollow?: (userId: number | string) => Promise<void> | void;
  showFollowButton?: boolean;
  token?: string;             
  setFollowings?: React.Dispatch<React.SetStateAction<any>>; 
}

export default function UserCard({
  user,
  onClick,
  showUnfollowButton = false,
  onUnfollow,
  showFollowButton = false, 
  token,
  setFollowings
}: UserCardProps) {
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const handleUnfollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <Link
        className={styles.cardSecond}
        href={`/profile/${user?.id || ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <>
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
          </div></>
      </Link>

      
      {showUnfollowButton && (
        <RiUserUnfollowLine
          className={styles.unfollowIcon}
          onClick={handleUnfollowClick}
        />
      )}

      
      {showFollowButton && token && (
        <FollowIcon
          token={token}
          followingId={Number(user.id)}
          setFollowings={setFollowings}
        />
      )}
    </div>
  );
}