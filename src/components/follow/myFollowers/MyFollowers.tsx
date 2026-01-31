// app/followers/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { followersService, FollowersResponse } from "@/services/api/follow_api/followers";
import FollowLayout from "@/components/follow/FollowLayout";

function MyFollowers() {
    const [followers, setFollowers] = useState<FollowersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [token, setToken] = useState<string>("");

    // تهيئة البيانات من localStorage داخل useEffect
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedUser = localStorage.getItem("user");
                const storedToken = localStorage.getItem("token");
                
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUserId(userData.id || userData.user_id || null);
                }
                setToken(storedToken || "");
            } catch (err) {
                console.error("Error loading user data:", err);
                setError("Error loading user information");
            }
        }
    }, []);

    // جلب البيانات
    useEffect(() => {
        const fetchFollowers = async () => {
            // تأكد من توفر البيانات المطلوبة
            if (!userId || !token) {
                console.log("Waiting for userId or token...");
                return;
            }

            try {
                setLoading(true);
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

        if (userId && token) {
            fetchFollowers();
        } else if (!userId && !loading && typeof window !== 'undefined') {
            // إذا لم يتم العثور على userId بعد تحميل الصفحة
            setError("User not found. Please login to view followers.");
            setLoading(false);
        }
    }, [userId, token]); // يعتمد على userId و token

    return (
        <FollowLayout
            title="Your Followers"
            count={followers?.count || 0}
            users={followers?.data?.map(f => ({
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
            showUnfollowButton={false}
        />
    );
}

export default MyFollowers;