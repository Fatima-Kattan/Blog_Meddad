'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PostImages.module.css';

interface PostImagesProps {
    images: string[];
    compact?: boolean;
    maxHeight?: number;
}

const PostImages = ({ images, compact = false, maxHeight = 400 }: PostImagesProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    if (!images || images.length === 0) {
        return null;
    }

    const handleImageClick = (index: number) => {
        setSelectedImageIndex(index);
    };

    const handleCloseModal = () => {
        setSelectedImageIndex(null);
    };

    const handleViewAllClick = () => {
        setSelectedImageIndex(0);
    };

    const getGridClass = () => {
        if (compact) return styles.compactGrid;
        
        switch (images.length) {
            case 1:
                return styles.singleImage;
            case 2:
                return styles.twoImages;
            default:
                // For 3 or more images
                return styles.threeOrMoreImages;
        }
    };

    // Determine how many images to show initially
    const getInitialImagesToShow = () => {
        if (compact) {
            return images.slice(0, 4);
        }
        
        if (images.length <= 2) {
            // If 1 or 2 images, show all of them
            return images;
        }
        
        // If 3 or more images, show only the first two
        return images.slice(0, 2);
    };

    const imagesToShow = getInitialImagesToShow();
    const showViewAllButton = images.length > 2;

    return (
        <>
            <div 
                className={`${styles.imagesContainer} ${getGridClass()} ${compact ? styles.compact : ''}`}
                style={compact ? { maxHeight: `${maxHeight}px` } : {}}
            >
                {imagesToShow.map((imageUrl, index) => (
                    <div 
                        key={index} 
                        className={styles.imageWrapper}
                        onClick={() => handleImageClick(index)}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            width={compact ? 150 : 600}
                            height={compact ? 150 : 250}
                            className={styles.postImage}
                            unoptimized={true}
                            loading="eager"
                        />
                        
                        {/* Overlay for second image when there are more than 2 images */}
                        {index === 1 && images.length > 2 && (
                            <div className={styles.moreOverlay}>
                                +{images.length - 2}
                            </div>
                        )}
                    </div>
                ))}
                
                {/* View All button for more than 2 images */}
                {showViewAllButton && !compact && (
                    <button 
                        className={styles.viewAllButton}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewAllClick();
                        }}
                        aria-label="View all photos"
                    >
                        {images.length === 3 ? 'View all 3 photos' : `View all ${images.length} photos`}
                        <span className={styles.viewAllIcon}>→</span>
                    </button>
                )}
            </div>

            {/* Image Modal - shows all images */}
            {selectedImageIndex !== null && (
                <div className={styles.imageModal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <button 
                            className={styles.closeButton}
                            onClick={handleCloseModal}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        
                        <div className={styles.modalImageContainer}>
                            <img
                                src={images[selectedImageIndex]}
                                alt={`Image ${selectedImageIndex + 1}`}
                                className={styles.modalImage}
                                onError={(e) => {
                                    e.currentTarget.src = '/default-image.png';
                                }}
                            />
                        </div>
                        
                        {/* Navigation buttons for all images */}
                        {images.length > 1 && (
                            <div className={styles.navigation}>
                                <button 
                                    className={styles.navButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageIndex(
                                            selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
                                        );
                                    }}
                                    aria-label="Previous image"
                                >
                                    ←
                                </button>
                                
                                <span className={styles.imageCounter}>
                                    {selectedImageIndex + 1} / {images.length}
                                </span>
                                
                                <button 
                                    className={styles.navButton}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageIndex(
                                            selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
                                        );
                                    }}
                                    aria-label="Next image"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default PostImages;