'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PostFeed from '@/components/posts/post-feed/PostFeed';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function TagPage() {
    const params = useParams();
    const tagId = params.id as string;
    const [tagName, setTagName] = useState<string>('Tag');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTagName = async () => {
            try {
                console.log(`🔗 [TagPage] Fetching tag name for ID: ${tagId}`);
                
                // 👇 **استخدم الـ endpoint الصحيح - تحت api/v1**
                const response = await fetch(`${API_URL}/api/v1/tags/${tagId}`);
                console.log(`🔗 [TagPage] Response status: ${response.status}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔗 [TagPage] Tag data:', data);
                    
                    if (data.success && data.data) {
                        setTagName(data.data.tag_name || `Tag #${tagId}`);
                        console.log(`✅ [TagPage] Tag name set to: ${data.data.tag_name}`);
                    } else {
                        console.log('⚠️ [TagPage] No tag data found, using default');
                        setTagName(`Tag #${tagId}`);
                    }
                } else {
                    console.log(`❌ [TagPage] Failed to fetch tag: ${response.status}`);
                    setTagName(`Tag #${tagId}`);
                }
            } catch (error) {
                console.error('❌ [TagPage] Error fetching tag name:', error);
                setTagName(`Tag #${tagId}`);
            } finally {
                setLoading(false);
                console.log(`✅ [TagPage] Loading finished for tag ID: ${tagId}`);
            }
        };

        if (tagId) {
            fetchTagName();
        }
    }, [tagId]);

    if (loading) {
        return (
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f0ff',
                    borderTop: '3px solid #8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }}></div>
                <p>Loading tag information...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>
                    <span style={{ color: '#8b5cf6' }}>#{tagName}</span>
                </h1>
                <p style={{ color: '#666', fontSize: '16px' }}>
                    Posts with tag: <strong>#{tagName}</strong>
                </p>
                <p style={{ color: '#999', fontSize: '14px', marginTop: '5px' }}>
                    Tag ID: {tagId}
                </p>
            </div>

            <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px', 
                padding: '15px', 
                marginBottom: '20px',
                backgroundColor: '#f9fafb'
            }}>
                <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    📌 <strong>Debug Info:</strong> Showing posts for tag ID: <code>{tagId}</code> ({tagName})
                </p>
            </div>

            <PostFeed 
                tagId={Number(tagId)}
                hideInfiniteScroll={false}
            />

            <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <Link 
                    href="/" 
                    style={{ 
                        color: '#8b5cf6', 
                        textDecoration: 'none',
                        fontSize: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 20px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f3ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    ← Back to all posts
                </Link>
            </div>
        </div>
    );
}