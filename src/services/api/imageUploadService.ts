// services/api/imageUploadService.ts
import axios from 'axios';

export interface ImageUploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        path: string;
        filename: string;
        size: number;
        mime_type: string;
    };
}

export interface UploadProgress {
    percentage: number;
    loaded: number;
    total: number;
}

export const imageUploadService = {
    // رفع صورة واحدة
    async uploadSingleImage(file: File, onProgress?: (progress: UploadProgress) => void): Promise<ImageUploadResponse> {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            formData.append('image', file);
            
            // إضافة بيانات إضافية اختيارية
            formData.append('type', 'profile');
            formData.append('folder', 'users');

            const response = await axios.post<ImageUploadResponse>(
                'http://localhost:8000/api/v1/upload/image',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                    onUploadProgress: (progressEvent) => {
                        if (onProgress && progressEvent.total) {
                            const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            onProgress({
                                percentage,
                                loaded: progressEvent.loaded,
                                total: progressEvent.total
                            });
                        }
                    }
                }
            );
            return response.data;
            
        } catch (error: any) {
            if (error.response) {
                if (error.response.status === 413) {
                    throw new Error('Image size is too large. Maximum size is 5MB');
                }
                if (error.response.status === 415) {
                    throw new Error('Unsupported image format. Please use JPEG, PNG, or GIF');
                }
                throw new Error(error.response.data.message || 'Failed to upload image');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    // رفع صور متعددة
    async uploadMultipleImages(files: File[], onProgress?: (progress: UploadProgress) => void): Promise<ImageUploadResponse[]> {
        const uploadPromises = files.map(file => this.uploadSingleImage(file, onProgress));
        return Promise.all(uploadPromises);
    },

    // حذف صورة
    async deleteImage(imageUrl: string): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.delete(
                'http://localhost:8000/api/v1/upload/image',
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    data: { url: imageUrl }
                }
            );
            return response.data;
            
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to delete image');
            }
            throw new Error('Network error. Please check your connection.');
        }
    },

    // تحويل الصورة إلى Data URL (للعرض المباشر)
    convertToDataURL(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    // التحقق من صحة الملف
    validateImageFile(file: File): { valid: boolean; message?: string } {
        // التحقق من النوع
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return {
                valid: false,
                message: 'Unsupported image format. Please use JPEG, PNG, or GIF'
            };
        }

        // التحقق من الحجم (5MB كحد أقصى)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return {
                valid: false,
                message: 'Image size is too large. Maximum size is 5MB'
            };
        }

        return { valid: true };
    },

    // استخراج اسم الملف من URL
    extractFilenameFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.split('/').pop() || 'image';
        } catch {
            return url.split('/').pop() || 'image';
        }
    },

    // الحصول على حجم الصورة من URL
    async getImageSize(url: string): Promise<{ width: number; height: number }> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({
                    width: img.width,
                    height: img.height
                });
            };
            img.onerror = reject;
            img.src = url;
        });
    },

    // ضغط الصورة قبل الرفع (اختياري - للعميل)
    compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                // حساب الأبعاد الجديدة مع الحفاظ على النسبة
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // رسم الصورة المضغوطة
                ctx.drawImage(img, 0, 0, width, height);

                // تحويل إلى Blob ثم File
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now()
                        });

                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };

            img.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
};