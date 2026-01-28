// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserPostsFeed from '@/components/auth/profile/UserPostsFeed';
import axios from 'axios';
import { 
    FaFeatherAlt, 
    FaQuoteLeft,
    FaHeart,
    FaPenAlt
} from 'react-icons/fa';
import { 
    HiOutlineDocumentText,
    HiOutlineLightningBolt,
    HiOutlineFire,
    HiOutlineSparkles
} from 'react-icons/hi';
import { 
    FiZap,
    FiStar
} from 'react-icons/fi';
import styles from './MyPostsPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// مجموعة من الجمل الملهمة
const INSPIRING_QUOTES = [
    "Your words have power. Share your story and inspire others.",
    "Every post is a piece of your journey. Keep writing your story.",
    "Your thoughts deserve to be heard. Keep sharing your perspective.",
    "The world needs your unique voice. Keep expressing yourself.",
    "Every post is a chance to connect, inspire, and grow."
];

// مجموعة من الجمل التحفيزية
const MOTIVATION_MESSAGES = [
    { text: "Creative journey continues", icon: HiOutlineSparkles },
    { text: "Share amazing stories", icon: HiOutlineLightningBolt },
    { text: "Words inspire others", icon: FaHeart },
    { text: "Every post makes a difference", icon: HiOutlineFire },
    { text: "Unleash your creativity", icon: FiZap },
    { text: "Share shining moments", icon: FiStar }
];

export default function MyPostsPage() {
    const params = useParams();
    const userId = params.id as string;

    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [randomQuote, setRandomQuote] = useState('');
    const [randomMotivation, setRandomMotivation] = useState<any>(null);

    // اختيار جملة عشوائية عند التحميل
    useEffect(() => {
        const randomIndex = Math.floor(Math.random() * INSPIRING_QUOTES.length);
        setRandomQuote(INSPIRING_QUOTES[randomIndex]);
        
        const motivationIndex = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
        setRandomMotivation(MOTIVATION_MESSAGES[motivationIndex]);
    }, []);

    // دالة لجلب عدد البوستات
    const fetchPostsCount = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `${API_URL}/api/v1/user/${userId}/posts`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: { page: 1, limit: 1 }
                }
            );

            if (response.data.success) {
                const data = response.data.data;
                
                if (data.posts?.total) {
                    setTotalPosts(data.posts.total);
                } else if (data.total) {
                    setTotalPosts(data.total);
                } else if (data.data?.total) {
                    setTotalPosts(data.data.total);
                } else {
                    setTotalPosts(0);
                }
            }
        } catch (error: any) {
            console.error('Error fetching posts count:', error);
            setError('Unable to load posts count');
        } finally {
            setLoading(false);
        }
    };

    // التهيئة
    useEffect(() => {
        fetchPostsCount();
    }, [userId]);

    // معالجة حذف البوست
    const handlePostDeleted = () => {
        setTotalPosts(prev => Math.max(0, prev - 1));
    };

    // معالجة إنشاء/تحديث البوست
    const handlePostCreated = () => {
        setTotalPosts(prev => prev + 1);
        // تحديث بعد فترة
        setTimeout(() => {
            fetchPostsCount();
        }, 1000);
    };

    const MotivationIcon = randomMotivation?.icon || HiOutlineSparkles;

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <FaFeatherAlt className={styles.titleIcon} />
                        <h1 className={styles.title}>
                            Posts Collection
                        </h1>
                    </div>
                    
                    {!loading && !error && (
                        <div className={styles.postsCount}>
                            <HiOutlineDocumentText />
                            <span>Total: <span className={styles.countNumber}>{totalPosts}</span></span>
                        </div>
                    )}
                </div>
            </header>

            {/* قسم الجملة الملهمة */}
            <section className={`${styles.quoteSection} ${styles.animatedElement}`}>
                <p className={styles.quoteText}>
                    {randomQuote}
                </p>
                <div className={styles.quoteAuthor}>
                    Writing Community
                </div>
            </section>

            {/* بانر تحفيزي */}
            {randomMotivation && (
                <div className={`${styles.motivationBanner} ${styles.animatedElement}`}>
                    <p className={styles.motivationText}>
                        <MotivationIcon className={styles.motivationIcon} />
                        <span>{randomMotivation.text}</span>
                        <FaPenAlt />
                    </p>
                </div>
            )}

            {/* قسم البوستات */}
            <main className={styles.postsSection}>
                <h2 className={styles.sectionTitle}>
                    <FaQuoteLeft className={styles.sectionIcon} />
                    Featured Stories
                </h2>
                
                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <span className={styles.loadingText}>Loading stories...</span>
                    </div>
                )}
                
                {error && !loading && (
                    <div className={styles.emptyState}>
                        <FaFeatherAlt className={styles.emptyIcon} />
                        <h3 className={styles.emptyTitle}>Connection Error</h3>
                        <p className={styles.emptyMessage}>
                            Unable to load stories. Please check your connection and try again.
                        </p>
                    </div>
                )}
                
                {!loading && !error && (
                    <UserPostsFeed
                        userId={userId}
                        isOwnProfile={false}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostCreated}
                        
                    />
                )}
            </main>
        </div>
    );
}