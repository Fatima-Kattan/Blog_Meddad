// components/create post model/CreatePostModal.tsx
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

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPostCreated: () => void;
}

// واجهة مطابقة للحقول في Laravel Controller
interface CreatePostData {
    title: string;
    caption: string;
    images: string[]; // مصفوفة من الروابط
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ 
    isOpen, 
    onClose, 
    onPostCreated 
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

    // إظهار الإشعار
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.currentTarget;
        imgElement.src = 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40';
    };

    // إغلاق المودال عند الضغط على ESC
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

    // إغلاق عند النقر خارج المودال
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
        
        // التحقق من عدد الصور (الحد الأقصى 4)
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

    // دالة خاصة لـ InputField (لأن onChange في InputField يتوقع React.ChangeEvent<HTMLInputElement>)
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setImageUrlInput(value);
        if (value) {
            setIsUrlValid(validateImageUrl(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // التحقق من المدخلات الأساسية
        if (!postData.caption.trim() || !postData.title.trim()) {
            showNotification('Please add title and caption to your post', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // الحصول على التوكن من localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required. Please login again.');
            }

            console.log('📤 Creating post with data:', postData);

            // استدعاء API إنشاء البوست
            const response = await createPost(postData, token);
            
            showNotification('Post created successfully!', 'success');
            console.log('✅ Post created:', response);

            // نجاح
            onPostCreated();
            resetForm();
            onClose();
            
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
            {/* إشعار مخصص */}
            {notification && (
                <div className={`${styles.customNotification} ${notification.type === 'success' ? styles.notificationSuccess : styles.notificationError}`}>
                    {notification.message}
                </div>
            )}
            
            <div className={styles.modalContainer} ref={modalRef}>
                {/* هيدر المودال */}
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

                {/* صورة المستخدم */}
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

                {/* الفورم الرئيسي */}
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    {/* حقل العنوان (يبقى input عادي) */}
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

                    {/* حقل الوصف (يبقى textarea عادي) */}
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

                    {/* عرض الصور المضافة */}
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

                    {/* قسم إضافة الصور عبر الرابط */}
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
                                {/* ⭐⭐ هنا استخدم InputField كما هو بدون تعديل */}
                                <div className={styles.inputFieldWrapper}>
                                    <InputField
                                        label="" // نتركه فارغاً لأننا لا نريد label
                                        name="imageUrl"
                                        type="url"
                                        value={imageUrlInput}
                                        onChange={handleImageUrlChange} // ⬅️ هذه تأخذ React.ChangeEvent<HTMLInputElement>
                                        placeholder="Enter image URL (jpg, png, gif, etc.)"
                                        disabled={postData.images.length >= 4}
                                        // ⭐ نمرر error فقط إذا كان موجوداً في InputField
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
                            {/* نعرض رسائل الخطأ هنا بدلاً من في InputField إذا كان لا يدعم error */}
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

                    {/* أزرار الإجراء */}
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