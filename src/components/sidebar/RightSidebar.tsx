"use client";
import React, { useEffect, useState } from "react";
import styles from './rightSidebar.module.css';
import UserCard from '../shared/UserCard/UserCard';
import { notFollowingService, NotFollowingResponse } from "@/services/api/follow_api/notFollowings";

function RightSidebar() {
  const [users, setUsers] = useState<NotFollowingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const storedUser = localStorage.getItem("user");
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    const fetchNotFollowings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || "";
        const data = await notFollowingService.getNotFollowings(userId, token);
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching not-followings:", err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchNotFollowings();
    } else {
      setLoading(false);
      setError("No user found in localStorage");
    }
  }, [userId]);

  return (
    <div className={styles.sidebarSection}>
      <h3 className={styles.suggestedFriends}>Suggested Friends</h3>
      <div>
        {loading && <p className={styles.statement} >Loading...</p>}
        {error && <p>{error}</p>}
        
        {!loading && !error && (
          users?.data && users.data.length > 0 ? (
            users.data.map((u) => (
              <UserCard
                key={u.id}
                user={{
                  id: u.id,
                  name: u.full_name,
                  image: u.image || "/default-avatar.png",
                  bio: u.bio || "No bio available",
                }}
                showFollowButton={true}
                token={localStorage.getItem("token") || ""}
                onClick={() => console.log("Clicked:", u.full_name)}
              />
            ))
          ) : (
            <p className={styles.statement} >Great! You have followed everyone.</p>
          )
        )}
      </div>
    </div>
  );
}

export default RightSidebar;