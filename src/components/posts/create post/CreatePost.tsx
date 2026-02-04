'use client';

import React, { useState } from 'react';
import styles from './CreatePost.module.css';
import CreatePostModal from '../create post model/CreatePostModal';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { useUserData } from '@/hooks/useUserData';

// أضف interface
interface CreatePostProps {
  onPostCreated?: (newPost: any) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostCreated }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { userImage, userName, isLoading } = useUserData();

    const handleCreateClick = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setIsModalOpen(true);
    };

    // غير هذه الدالة - إضافة auto refresh
    const handlePostCreated = (newPost: any) => {
        console.log('✅ Post created:', newPost);
        setIsModalOpen(false);
        
        // مرر البوست لل parent
        if (onPostCreated) {
            onPostCreated(newPost);
        }
        
        // أرسل إشارة refresh للصفحة الرئيسية
        window.dispatchEvent(new CustomEvent('postCreatedSuccess', { 
            detail: newPost 
        }));
        
        // إعادة تحميل الصفحة بعد تأخير (حل مؤكد)
        setTimeout(() => {
            console.log('🔄 Auto-refreshing page after post creation');
            window.location.reload();
        }, 1500);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        imgElement.src = 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40';
    };

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
                        className={`${styles.btn} ${styles.createButton}`}
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