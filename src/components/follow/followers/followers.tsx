// app/followers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { followersService, FollowersResponse } from "@/services/api/follow_api/followers";
import FollowLayout from "@/components/follow/FollowLayout";

function Followers() {
  const [followers, setFollowers] = useState<FollowersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const userId = 2;

        const data = await followersService.getFollowers(userId, token);
        setFollowers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching followers:", err);
        setError("Failed to load followers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  return (
    <FollowLayout
      title="Your Followers"
      count={followers?.count || 0}
      users={followers?.data.map(f => ({
        id: f.follower.id,
        name: f.follower.full_name,
        image: f.follower.image || "/default-avatar.png",
        bio: f.follower.bio || "No bio available",
      })) || []}
      loading={loading}
      error={error}
      emptyMessage="No followers yet"
      emptySubmessage="Start engaging so people follow you"
      icon="👥"
      statsTitle="Total Connections"
      onUserClick={(user) => console.log("Clicked:", user.name)}
      showUnfollowButton={false} // عادة ما ما في زر Unfollow بالـ Followers
    />
  );
}

export default Followers;