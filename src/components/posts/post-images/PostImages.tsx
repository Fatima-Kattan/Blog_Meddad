// components/posts/post-images/PostImages.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './PostImages.module.css';

interface PostImagesProps {
    images: string[];
}

const PostImages = ({ images }: PostImagesProps) => {
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
            <div className={`${styles.imagesContainer} ${getGridClass()}`}>
                {images.map((imageUrl, index) => (
                    <div 
                        key={index} 
                        className={styles.imageWrapper}
                        onClick={() => handleImageClick(index)}
                    >
                        <Image
                            src={imageUrl}
                            alt={`Post image ${index + 1}`}
                            width={600}
                            height={400}
                            className={styles.postImage}
                            onError={(e) => {
                                e.currentTarget.src = '/default-image.png';
                            }}
                        />
                        
                        {/* Show image count for multiple images */}
                        {images.length > 1 && index === 3 && images.length > 4 && (
                            <div className={styles.moreImagesOverlay}>
                                +{images.length - 4} more
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
                        
                        <Image
                            src={images[selectedImageIndex]}
                            alt={`Selected image ${selectedImageIndex + 1}`}
                            width={800}
                            height={600}
                            className={styles.modalImage}
                        />
                        
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