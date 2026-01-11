// app/following/page.tsx
"use client";
import React from 'react'
import { useEffect, useState } from "react";
import { followingService, FollowingResponse } from "@/services/api/follow_api/following";
import UserCard from '@/components/shared/UserCard/UserCard'; 
import FollowLayout from '@/components/follow/FollowLayout';
import { followsService } from '@/services/api/follow_api/deleteFollow';

function Following() {
  const [followings, setFollowings] = useState<FollowingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;
  useEffect(() => {
    const fetchFollowings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";

        const data = await followingService.getFollowings(userId, token);
        setFollowings(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching followings:", err);
        setError("Failed to load followings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowings();
  }, []);

  
  // const handleUnfollow = async (userId: number | string) => {
  //   try {
  //     const token = localStorage.getItem("token") || "";
  //     await followsService.deleteFollow(Number(userId), token);
  
  //     // تحديث القائمة بعد الحذف
  //     setFollowings(prev => {
  //       if (!prev) return prev;
  //       return {
  //         ...prev,
  //         count: prev.count - 1,
  //         data: prev.data.filter(f => f.following.id !== userId),
  //       };
  //     });
  //   } catch (error) {
  //     console.error("Failed to unfollow:", error);
  //   }
  // };
  const handleUnfollow = async (userId: number | string) => {
    try {
      // ✅ نافذة تأكيد من المتصفح
      const confirmed = window.confirm("Are you sure you want to unfollow this user?");
      if (!confirmed) return; // إذا كبس Cancel ما بيكمل
  
      const token = localStorage.getItem("token") || "";
      await followsService.deleteFollow(Number(userId), token);
  
      // تحديث القائمة بعد الحذف
      setFollowings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          count: prev.count - 1,
          data: prev.data.filter(f => f.following.id !== userId),
        };
      });
    } catch (error) {
      console.error("Failed to unfollow:", error);
    }
  };
  
  return (
    <FollowLayout
      title="Your Followings"
      count={followings?.count || 0}
      users={followings?.data.map(f => ({
        id: f.following.id,
        name: f.following.full_name,
        image: f.following.image || "/default-avatar.png",
        bio: f.following.bio || "No bio available",
      })) || []}
      loading={loading}
      error={error}
      emptyMessage="No followings yet"
      emptySubmessage="Start following people to see them here"
      icon="👥"
      statsTitle="Total Connections"
      onUserClick={(user) => console.log("Clicked:", user.name)}
      showUnfollowButton={true} // ✅ تفعيل الزر
      onUnfollow={handleUnfollow} // ✅ تمرير الدالة
    />
  );
}

export default Following;