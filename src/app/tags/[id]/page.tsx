'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import Link from 'next/link';
import styles from '@/app/tags/TagPage.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TagPage() {
    const params = useParams();
    const tagId = params.id as string;
    const [tagName, setTagName] = useState<string>(`Tag #${tagId}`);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagName = async () => {
            try {
                console.log(`🔗 [TagPage] Fetching tag name for ID: ${tagId}`);
                
                // ⭐ **استخدم endpoint post-tags مباشرة - لأنه يعمل!**
                const response = await fetch(`${API_URL}/api/v1/post-tags/tag/${tagId}/posts?page=1&limit=1`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔗 [TagPage] Tag data from post-tags:', data);
                    
                    // ابحث عن اسم التاغ في البيانات
                    const tagData = data.data?.tag || data.tag;
                    if (tagData && tagData.tag_name) {
                        setTagName(tagData.tag_name);
                        console.log(`✅ [TagPage] Tag name set to: ${tagData.tag_name}`);
                    }
                }
            } catch (error) {
                console.error('❌ [TagPage] Error fetching tag name:', error);
                // نستخدم الاسم الافتراضي (Tag #{id})
            } finally {
                setLoading(false);
                console.log(`✅ [TagPage] Loading finished for tag ID: ${tagId}`);
            }
        };

        if (tagId) {
            fetchTagName();
        } else {
            setLoading(false);
        }
    }, [tagId]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Loading tag information...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.tagName}>#{tagName}</span>
                </h1>
                <p className={styles.description}>
                    Posts with tag: <strong>#{tagName}</strong>
                </p>
                
                
            </div>

            <PostFeed 
                tagId={Number(tagId)}
                hideInfiniteScroll={false}
            />

            <div className={styles.backLinkContainer}>
                <Link 
                    href="/" 
                    className={styles.backLink}
                >
                    ← Back to all posts
                </Link>
            </div>
        </div>
    );
}