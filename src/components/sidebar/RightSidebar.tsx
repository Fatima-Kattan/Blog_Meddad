"use client";
import React, { useEffect, useState } from "react";
import styles from './rightSidebar.module.css';
import UserCard from '../shared/UserCard/UserCard';
import { notFollowingService, NotFollowingResponse } from "@/services/api/follow_api/notFollowings";
import { MdOutlineGroupAdd, MdOutlinePeopleAlt } from "react-icons/md";
import { FaPeopleArrows } from "react-icons/fa";
import LoadingIcon from '@/components/shared/LoadingIcon/LoadingIcon'; 

function RightSidebar() {
  const [users, setUsers] = useState<NotFollowingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token") || "";
        
        if (!storedUser) {
          setError("Please login to see suggested friends");
          setLoading(false);
          return;
        }
        
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser?.id;
        
        if (!userId) {
          setError("No user found in localStorage");
          setLoading(false);
          return;
        }
        
        const data = await notFollowingService.getNotFollowings(userId, token);
        setUsers(data);
        
      } catch (err) {
        console.error("Error fetching not-followings:", err);
        setError("Failed to load users. Please try again.");
        setUsers(null);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    if (error) {
      return <p className={styles.error}>{error}</p>;
    }
    
    if (users?.data && users.data.length > 0) {
      return users.data.map((u) => (
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
      ));
    }
    
    if (!loading) {
      return <p className={styles.statement}>Great! You have followed everyone.</p>;
    }
    
    return null;
  };

  return (
    <div className={styles.sidebarSection}>
      <div className={styles.title_follower}>
        <MdOutlinePeopleAlt className={styles.icon}/>
        <h3 className={styles.suggestedFriends}>Suggested Friends</h3>
      </div>
      
      <div className={styles.scrollContainer}>
        {/* ✅ LoadingIcon في حالة التحميل */}
        {loading && (
          <div style={{ 
            position: 'relative', 
            minHeight: '200px',
            width: '100%'
          }}>
            <LoadingIcon 
              size={45}
              message="Loading ..."
              position="absolute"
            />
          </div>
        )}
        
        {/* ✅ المحتوى العادي عندما لا يكون هناك تحميل */}
        {!loading && (
          <div>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}

export default RightSidebar;