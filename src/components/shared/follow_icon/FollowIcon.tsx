import React from "react";
import { RiUserAddLine } from "react-icons/ri";
import styles from "./followIcon.module.css";
import { followService } from "@/services/api/follow_api/createFollow"; // استدعاء الخدمة

interface FollowIconProps {
  token: string;        // التوكن الخاص بالمستخدم
  followingId: number;  // الـ id للشخص اللي بدك تعمل له follow
  setFollowings?: React.Dispatch<React.SetStateAction<any>>; 
  // اختياري: إذا بدك تحدث القائمة بعد الإضافة
}

function FollowIcon({ token, followingId, setFollowings }: FollowIconProps) {

  const handleFollow = async () => {
    try {
      // تنفيذ العملية مباشرة بدون نافذة تأكيد
      const response = await followService.createFollow(token, followingId);
      console.log("✅ Success:", response.message);

      // تحديث القائمة بعد الإضافة (اختياري)
      if (setFollowings) {
        setFollowings(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            count: prev.count + 1,
            data: [...prev.data, response.data], // إضافة العلاقة الجديدة
          };
        });
      }
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