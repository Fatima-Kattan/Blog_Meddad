'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { deletePost } from '@/services/api/posts/delete-post';
import { addImagesToPost } from '@/services/api/posts/add-images';
import { useUserData } from '@/hooks/useUserData';
import styles from './PostHeader.module.css';
import {
    HiPencil,
    HiPhotograph,
    HiTrash,
    HiX,
    HiCheck
} from 'react-icons/hi';

interface PostHeaderProps {
    user: {
        id: number;
        full_name: string;
        image: string;
    };
    postDate: string;
    postId: number;
    imagesCount?: number;
    onPostDeleted?: (postId: number) => void;
    onImagesUpdated?: () => void;
    onEditPost?: () => void;
}

const PostHeader = ({
    user,
    postDate,
    postId,
    imagesCount = 0,
    onPostDeleted,
    onImagesUpdated,
    onEditPost
}: PostHeaderProps) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showAddImagesModal, setShowAddImagesModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const { userData } = useUserData();
    const isCurrentUser = userData?.id === user.id;
    const dropdownRef = useRef<HTMLDivElement>(null);
    const canAddMoreImages = imagesCount < 4;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleEdit = () => {
        setShowDropdown(false);
        if (onEditPost) {
            onEditPost();
        }
    };

    const handleAddImages = () => {
        setShowDropdown(false);
        setShowAddImagesModal(true);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setIsLoading(true);
            await deletePost(postId);
            setSuccess('Post deleted successfully');

            if (onPostDeleted) {
                onPostDeleted(postId);
            }

            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (error: any) {
            setError(error.message || 'Failed to delete post');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsLoading(false);
            setShowDropdown(false);
        }
    };

    const handleSubmitImage = async () => {
        if (!imageUrl.trim()) {
            setError('Please enter an image URL');
            return;
        }

        if (!canAddMoreImages) {
            setError('Maximum limit reached (4 images)');
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await addImagesToPost(postId, [imageUrl]);

            setSuccess('Image added successfully');
            setImageUrl('');

            if (onImagesUpdated) {
                onImagesUpdated();
            }

            setTimeout(() => {
                setSuccess(null);
                setShowAddImagesModal(false);
            }, 2000);
        } catch (error: any) {
            setError(error.message || 'Failed to add image');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=8b5cf6&color=fff&size=40';
    };

    return (
        <>
            <div className={styles.postHeader}>
                {/* User Info */}
                <Link
                    href={`/profile/${user?.id || ''}`}
                    className={styles.userInfo}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className={styles.avatarContainer}>
                        <Image
                            src={user?.image || '/default-avatar.png'}
                            alt={user?.full_name || 'User'}
                            width={40}
                            height={40}
                            className={styles.avatar}
                            onError={handleImageError}
                        />
                    </div>

                    <div className={styles.userDetails}>
                        <h3 className={styles.userName}>{user?.full_name || 'Unknown User'}</h3>
                        <span className={styles.postDate}>{postDate}</span>
                    </div>
                </Link>

                {/* Dropdown Menu (Three Dots) */}
                {isCurrentUser && (
                    <div className={styles.dropdownContainer} ref={dropdownRef}>
                        <button
                            className={styles.threeDots}
                            onClick={() => setShowDropdown(!showDropdown)}
                            aria-label="Post options"
                            disabled={isLoading}
                        >
                            <span className={styles.dotsIcon}>⋮</span>
                        </button>

                        {showDropdown && (
                            <div className={styles.dropdownMenu}>
                                {/* Edit Post */}
                                <button
                                    className={styles.dropdownItem}
                                    onClick={handleEdit}
                                    disabled={isLoading}
                                >
                                    <HiPencil className={styles.editIcon} />
                                    Edit Post
                                </button>

                                {/* Add Images (only if less than 4) */}
                                {canAddMoreImages && (
                                    <button
                                        className={styles.dropdownItem}
                                        onClick={handleAddImages}
                                        disabled={isLoading}
                                    >
                                        <HiPhotograph className={styles.imageIcon} />
                                        Add Image ({imagesCount}/4)
                                    </button>
                                )}

                                {/* Delete Post */}
                                <button
                                    className={`${styles.dropdownItem} ${styles.deleteItem}`}
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                >
                                    <HiTrash className={styles.deleteIcon} />
                                    Delete Post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Add Images Modal - المعدل */}
            {showAddImagesModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Add Image to Post</h3>
                            <button
                                className={styles.modalCloseButton}
                                onClick={() => setShowAddImagesModal(false)}
                                disabled={isLoading}
                                aria-label="Close modal"
                            >
                                <HiX size={18} />
                            </button>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.imageCountInfo}>
                                <HiPhotograph className={styles.imageCountIcon} />
                                <span>Current images: {imagesCount}/4</span>
                            </div>

                            <div className={styles.inputGroup}>
                                <label htmlFor="imageUrl">Image URL</label>
                                <input
                                    id="imageUrl"
                                    type="url"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    className={styles.urlInput}
                                    disabled={isLoading || !canAddMoreImages}
                                />
                                {!canAddMoreImages && (
                                    <span className={styles.modalHint}>
                                        Maximum limit reached (4 images)
                                    </span>
                                )}
                                <span className={styles.modalHint}>
                                    Supported formats: jpg
                                </span>
                            </div>

                            {error && (
                                <div className={styles.errorMessage}>
                                    <HiX className={styles.errorIcon} />
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className={`${styles.successMessage} ${styles.successPulse}`}>
                                    <HiCheck className={styles.successIcon} />
                                    {success}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowAddImagesModal(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.submitButton}
                                onClick={handleSubmitImage}
                                disabled={isLoading || !imageUrl.trim() || !canAddMoreImages}
                            >
                                {isLoading ? (
                                    <>
                                        <span className={styles.loadingSpinner}></span>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Image'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PostHeader;