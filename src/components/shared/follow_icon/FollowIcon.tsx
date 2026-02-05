import React from "react";
import { RiUserAddLine } from "react-icons/ri";
import styles from "./followIcon.module.css";
import { followService } from "@/services/api/follow_api/createFollow"; 

interface FollowIconProps {
  token: string;        
  followingId: number;  
  setFollowings?: React.Dispatch<React.SetStateAction<any>>; 
 
}

function FollowIcon({ token, followingId, setFollowings }: FollowIconProps) {

  const handleFollow = async () => {
    try {
    
      const confirmed = window.confirm("You are about to follow this user. Are you sure?");
      if (!confirmed) return;

      const response = await followService.createFollow(token, followingId);
      console.log("✅ Success:", response.message);

    
      if (setFollowings) {
        setFollowings(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            count: prev.count + 1,
            data: [...prev.data, response.data], 
          };
        });
      }

    
      window.location.reload();

    } catch (error: any) {
      console.error("❌ Error:", error.message);
    }
  };

  return (
    <RiUserAddLine
      className={styles.followIcon}
      onClick={handleFollow}
      style={{ cursor: "pointer" }}
    />
  );
}

export default FollowIcon;