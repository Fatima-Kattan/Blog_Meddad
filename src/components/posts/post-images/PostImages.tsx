// PostImages.tsx مع unoptimized
'use client';

import { useState, useEffect } from 'react';
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

    const getGridClass = () => {
        if (compact) return styles.compactGrid;
        
        switch (images.length) {
            case 1:
                return styles.singleImage;
            case 2:
                return styles.twoImages;
            case 3:
                return styles.threeImages;
            case 4:
                return styles.fourImages;
            default:
                return styles.multipleImages;
        }
    };

    return (
        <>
            <div 
                className={`${styles.imagesContainer} ${getGridClass()} ${compact ? styles.compact : ''}`}
                style={compact ? { maxHeight: `${maxHeight}px` } : {}}
            >
                {images.slice(0, compact ? 4 : images.length).map((imageUrl, index) => (
                    <div 
                        key={index} 
                        className={styles.imageWrapper}
                        onClick={() => handleImageClick(index)}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            width={compact ? 150 : 600}
                            height={compact ? 150 : 400}
                            className={styles.postImage}
                            unoptimized={true} 
                            loading={index < 2 ? 'eager' : 'lazy'}
                            onError={(e) => {
                                e.currentTarget.src = '/default-image.png';
                            }}
                        />
                        
                        {/* Show image count for multiple images */}
                        {!compact && images.length > 1 && index === 3 && images.length > 4 && (
                            <div className={styles.moreImagesOverlay}>
                                +{images.length - 4} more
                            </div>
                        )}
                        
                        {compact && images.length > 4 && index === 3 && (
                            <div className={styles.compactMoreOverlay}>
                                +{images.length - 3}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Image Modal */}
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
                                alt={`Selected image ${selectedImageIndex + 1}`}
                                className={styles.modalImage}
                            />
                        </div>
                        
                        {/* Navigation for multiple images */}
                        {images.length > 1 && (
                            <div className={styles.navigation}>
                                <button 
                                    className={styles.navButton}
                                    onClick={() => setSelectedImageIndex(
                                        selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1
                                    )}
                                    aria-label="Previous image"
                                >
                                    ←
                                </button>
                                
                                <span className={styles.imageCounter}>
                                    {selectedImageIndex + 1} / {images.length}
                                </span>
                                
                                <button 
                                    className={styles.navButton}
                                    onClick={() => setSelectedImageIndex(
                                        selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0
                                    )}
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