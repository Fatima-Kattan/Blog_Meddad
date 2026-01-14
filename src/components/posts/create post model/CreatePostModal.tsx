'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './CreatePostModal.module.css';
import {
    HiPhotograph,
    HiX,
} from 'react-icons/hi';
import { useUserData } from '@/hooks/useUserData';
import { createPost } from '@/services/api/posts/createPost';
import InputField from '@/components/shared/InputField';

// غير interface
interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: (newPost: any) => void; // غير هنا
}

interface CreatePostData {
    title: string;
    caption: string;
    images: string[];
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
    isOpen, 
    onClose, 
    onPostCreated // غير هنا
}) => {
    const [postData, setPostData] = useState<CreatePostData>({
        title: '',
        caption: '',
        images: []
    });
    
    const [imageUrlInput, setImageUrlInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUrlValid, setIsUrlValid] = useState<boolean>(true);
    const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    
    const { userImage, userName, userData, refreshData } = useUserData();
    
    const modalRef = useRef<HTMLDivElement>(null);
    const urlInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            refreshData();
        }
    }, [isOpen, refreshData]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        imgElement.src = 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40';
    };

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && 
                !modalRef.current.contains(e.target as Node) &&
                isOpen) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const validateImageUrl = (url: string): boolean => {
        try {
            const parsedUrl = new URL(url);
            const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
            return imageExtensions.test(parsedUrl.pathname);
        } catch {
            return false;
        }
    };

    const handleImageUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!imageUrlInput.trim()) {
            showNotification('Please enter an image URL', 'error');
            return;
        }
        
        if (!validateImageUrl(imageUrlInput)) {
            setIsUrlValid(false);
            showNotification('Please enter a valid image URL (jpg, png, gif, etc.)', 'error');
            return;
        }
        
        if (postData.images.length >= 4) {
            showNotification('You can add up to 4 images only', 'error');
            return;
        }
        
        setIsUrlValid(true);
        const newImages = [...postData.images, imageUrlInput];
        setPostData(prev => ({ ...prev, images: newImages }));
        setImageUrlInput('');
        showNotification('Image added successfully!', 'success');
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPostData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setImageUrlInput(value);
        if (value) {
            setIsUrlValid(validateImageUrl(value));
        }
    };

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!postData.caption.trim() || !postData.title.trim()) {
            showNotification('Please add title and caption to your post', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            console.log('📤 Creating post with data:', postData);
            const response = await createPost(postData, token);
            
            showNotification('Post created successfully!', 'success');
            console.log('✅ Post created:', response);

            // أنشئ الـ newPost object
            const newPost = {
                id: response.data.id,
                user: {
                    id: userData?.id || 0,
                    full_name: userName,
                    image: userImage
                },
                title: response.data.title,
                caption: response.data.caption,
                images: response.data.images || [],
                likes_count: 0,
                comments_count: 0,
                created_at: response.data.created_at,
                updated_at: response.data.updated_at
            };
            
            console.log('🎉 Formatted new post:', newPost);
            
            // مرر الـ newPost لـ onPostCreated
            if (onPostCreated) {
                onPostCreated(newPost);
            }
            
            // أغلق المودال
            setTimeout(() => {
                resetForm();
                onClose();
            }, 1000);
            
        } catch (error: any) {
            console.error('❌ Error creating post:', error);
            showNotification(error.message || 'Failed to create post', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setPostData({
            title: '',
            caption: '',
            images: []
        });
        setImageUrlInput('');
        setIsUrlValid(true);
        setNotification(null);
    };

    const removeImage = (index: number) => {
        const newImages = [...postData.images];
        newImages.splice(index, 1);
        setPostData(prev => ({ ...prev, images: newImages }));
        showNotification('Image removed', 'success');
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            {notification && (
                <div className={`${styles.customNotification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.message}
                </div>
            )}
            
            <div className={styles.modalContainer} ref={modalRef}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Create Post</h2>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        <HiX size={24} />
                    </button>
                </div>

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            <img
                                src={userImage}
                                alt={userName}
                                onError={handleImageError}
                                className={styles.profileImage}
                            />
                        </div>
                        <div>
                            <h4 className={styles.userName}>{userName}</h4>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            name="title"
                            value={postData.title}
                            onChange={handleInputChange}
                            placeholder="Post Title"
                            className={styles.titleInput}
                            required
                        />
                    </div>

                    <div className={styles.textAreaContainer}>
                        <textarea
                            name="caption"
                            value={postData.caption}
                            onChange={handleInputChange}
                            placeholder="What's on your mind?"
                            className={styles.postTextarea}
                            rows={4}
                            required
                        />
                    </div>

                    {postData.images.length > 0 && (
                        <div className={styles.imagesPreview}>
                            <h3 className={styles.previewTitle}>Added Images ({postData.images.length}/4)</h3>
                            <div className={styles.imagesGrid}>
                                {postData.images.map((imageUrl, index) => (
                                    <div key={index} className={styles.imagePreviewItem}>
                                        <img 
                                            src={imageUrl} 
                                            alt={`Preview ${index + 1}`} 
                                            className={styles.previewImage}
                                            onError={(e) => {
                                                const imgElement = e.currentTarget;
                                                imgElement.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className={styles.removeImageButton}
                                            onClick={() => removeImage(index)}
                                            aria-label="Remove image"
                                        >
                                            ×
                                        </button>
                                        <div className={styles.imageNumber}>{index + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.imageUploadSection}>
                        <div className={styles.sectionHeader}>
                            <HiPhotograph size={20} />
                            <h3 className={styles.sectionTitle}>
                                Add Images via URL (Max: 4)
                            </h3>
                        </div>
                        
                        <div className={styles.imagesCounter}>
                            <span className={styles.counterText}>
                                {postData.images.length} / 4 images added
                            </span>
                        </div>
                        
                        <div className={styles.urlForm}>
                            <div className={styles.urlInputGroup}>
                                <div className={styles.inputFieldWrapper}>
                                    <InputField
                                        label=""
                                        name="imageUrl"
                                        type="url"
                                        value={imageUrlInput}
                                        onChange={handleImageUrlChange}
                                        placeholder="Enter image URL (jpg, png, gif, etc.)"
                                        disabled={postData.images.length >= 4}
                                        error={!isUrlValid && imageUrlInput ? 'Please enter a valid image URL' : undefined}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.urlSubmitButton}
                                    onClick={handleImageUrlSubmit}
                                    disabled={!imageUrlInput.trim() || !isUrlValid || postData.images.length >= 4}
                                >
                                    Add
                                </button>
                            </div>
                            {!isUrlValid && imageUrlInput && (
                                <p className={styles.errorText}>
                                    Please enter a valid image URL
                                </p>
                            )}
                            {postData.images.length >= 4 && (
                                <p className={styles.warningText}>
                                    You have reached the maximum limit of 4 images
                                </p>
                            )}
                            <p className={styles.urlHint}>
                                Enter a direct link to an image (e.g., https://example.com/image.jpg)
                            </p>
                        </div>
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`${styles.postButton} ${(!postData.caption.trim() || !postData.title.trim()) ? styles.disabled : ''}`}
                            disabled={(!postData.caption.trim() || !postData.title.trim()) || isLoading}
                        >
                            {isLoading ? (
                                <span className={styles.loadingSpinner}></span>
                            ) : (
                                'Post Now'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;