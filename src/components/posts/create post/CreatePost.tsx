// components/CreatePost.tsx
'use client';

import React, { useState } from 'react';
import styles from './CreatePost.module.css';
import CreatePostModal from '../create post model/CreatePostModal';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { useUserData } from '@/hooks/useUserData';

const CreatePost = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { userImage, userName, isLoading } = useUserData();

    const handleCreateClick = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation(); // لمنع انتشار الحدث
        }
        setIsModalOpen(true);
    };

    const handlePostCreated = () => {
        console.log('Post created successfully!');
        setIsModalOpen(false);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        imgElement.src = 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40';
    };

    // عرض مؤقت للتحميل
    if (isLoading) {
        return (
            <div className={styles.createPost} onClick={handleCreateClick}>
                <div className={styles.createHeader}>
                    <div className={styles.userAvatar}>
                        <img
                            src="https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40"
                            alt="Loading..."
                            className={styles.profileImage}
                        />
                    </div>
                    
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="What's on your mind?"
                            className={styles.postInput}
                            readOnly
                        />
                    </div>
                    
                    <button
                        type="button"
                        className={styles.createButton}
                        onClick={handleCreateClick}
                        title="Create Post"
                        disabled
                    >
                        <IoMdAddCircleOutline size={24} />
                        <span>Create</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* ⭐⭐ onClick على الكارد كامل ⭐⭐ */}
            <div className={styles.createPost} onClick={() => setIsModalOpen(true)}>
                <div className={styles.createHeader}>
                    <div className={styles.userAvatar}>
                        <img
                            src={userImage}
                            alt={`${userName}'s avatar`}
                            className={styles.profileImage}
                            onError={handleImageError}
                        />
                    </div>
                    
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="What's on your mind?"
                            className={styles.postInput}
                            readOnly
                            onClick={() => setIsModalOpen(true)}
                        />
                    </div>
                    
                    <button
                        type="button"
                        className={styles.createButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        }}
                        title="Create Post"
                    >
                        <IoMdAddCircleOutline size={24} />
                        <span>Create</span>
                    </button>
                </div>
            </div>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onPostCreated={handlePostCreated}
            />
        </>
    );
};

export default CreatePost;