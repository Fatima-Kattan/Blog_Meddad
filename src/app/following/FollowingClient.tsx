"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { followingService, FollowingResponse } from "@/services/api/follow_api/following";
import FollowLayout from '@/components/follow/FollowLayout';
import { followsService } from '@/services/api/follow_api/deleteFollow';

function MyFollowing() {
    const [followings, setFollowings] = useState<FollowingResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [token, setToken] = useState<string>("");
    const [lastFetched, setLastFetched] = useState<number>(0);
    
    const CACHE_DURATION = 10000; // ⭐ 10 ثواني cache

    // ⭐ تهيئة الـ userId و token
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const storedUser = localStorage.getItem("user");
                const storedToken = localStorage.getItem("token");
                
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    setUserId(parsedUser.id || parsedUser.user_id || null);
                }
                setToken(storedToken || "");
            } catch (error) {
                console.error("Error parsing user data:", error);
                setError("Error loading user data");
            }
        }
    }, []);

    // ⭐ دالة محسنة لجلب البيانات
    const fetchFollowings = useCallback(async (force = false) => {
        if (!userId || !token) {
            console.log("Waiting for userId or token...");
            return;
        }

        // ⭐ Cache check
        const now = Date.now();
        if (!force && now - lastFetched < CACHE_DURATION) {
            console.log("Using cached data");
            return;
        }

        try {
            setLoading(true);
            console.log("Fetching followings for userId:", userId);
            
            const data = await followingService.getFollowings(userId, token);
            console.log("Followings data received:", data);
            
            setFollowings(data);
            setLastFetched(now);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching followings:", err);
            setError(err.message || "Failed to load followings. Please try again.");
            
            // ⭐ Retry بعد 5 ثواني
            setTimeout(() => {
                fetchFollowings(true);
            }, 5000);
        } finally {
            setLoading(false);
        }
    }, [userId, token, lastFetched]);

    // ⭐ جلب البيانات مع Polling
    useEffect(() => {
        if (userId && token) {
            fetchFollowings();
            
            // ⭐ Polling كل 30 ثانية
            const interval = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    fetchFollowings();
                }
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userId, token, fetchFollowings]);

    // ⭐ تحسين handleUnfollow مع Optimistic Update
    const handleUnfollow = async (userIdToUnfollow: number | string) => {
        try {
            const confirmed = window.confirm("Are you sure you want to unfollow this user?");
            if (!confirmed) return;

            // ⭐ Optimistic Update - تحديث فوري
            setFollowings(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    count: prev.count - 1,
                    data: prev.data.filter(f => f.following.id !== userIdToUnfollow),
                };
            });

            // ⭐ إرسال الطلب للسيرفر
            await followsService.deleteFollow(Number(userIdToUnfollow), token);
            
            console.log("Successfully unfollowed");

        } catch (error) {
            console.error("Failed to unfollow:", error);
            alert("Failed to unfollow. Please try again.");
            
            // ⭐ التراجع عن التحديث
            fetchFollowings(true);
        }
    };

    // ⭐ دالة لتحديث يدوي
    const handleManualRefresh = () => {
        fetchFollowings(true);
    };

    if (!userId && !loading && typeof window !== 'undefined') {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                <p className="mb-4">Please login to view your followings.</p>
                <a href="/login" className="text-blue-500 hover:underline">
                    Go to Login
                </a>
            </div>
        );
    }

    return (
        <div>
            <FollowLayout
                title="Your Followings"
                count={followings?.count || 0}
                users={followings?.data?.map(f => ({
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
                showUnfollowButton={true}
                onUnfollow={handleUnfollow}
            />
        </div>
    );
}

export default MyFollowing;