// app/myPost/[id]/page.tsx - النسخة المبسطة
'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import UserPostsFeed from '@/components/auth/profile/UserPostsFeed';
import axios from 'axios';
import { FaFeatherAlt } from 'react-icons/fa';

export default function MyPostsPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [isOwner, setIsOwner] = useState(false);
    const [totalPosts, setTotalPosts] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUserId = localStorage.getItem('user_id');
        setIsOwner(currentUserId === userId);
        fetchPostsCount();
    }, [userId]);

    const fetchPostsCount = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // محاولة جلب عدد البوستات من API
            const response = await axios.get(
                `http://localhost:8000/api/v1/user/${userId}/posts`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        page: 1,
                        limit: 1 // نجلب صفحة واحدة فقط للعد
                    }
                }
            );

            if (response.data.success) {
                // التحقق من بنية البيانات
                const postsData = response.data.data;
                
                // محاولة استخراج العدد الإجمالي من أماكن مختلفة
                if (postsData.posts?.total) {
                    setTotalPosts(postsData.posts.total);
                } else if (postsData.total) {
                    setTotalPosts(postsData.total);
                } else if (postsData.data?.total) {
                    setTotalPosts(postsData.data.total);
                } else if (Array.isArray(postsData.posts?.data)) {
                    // إذا كان API يرجع عدد الصفحات
                    const total = postsData.posts.total || 
                                 postsData.posts.data.length * postsData.posts.last_page;
                    setTotalPosts(total);
                }
            }
        } catch (error: any) {
            console.error('Error fetching posts count:', error);
            
            // إذا فشل، جرب API آخر
            try {
                const token = localStorage.getItem('token');
                const profileResponse = await axios.get(
                    `http://localhost:8000/api/v1/profile/${userId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (profileResponse.data.success) {
                    const stats = profileResponse.data.data.stats;
                    setTotalPosts(stats?.posts_count || stats?.total_posts || 0);
                }
            } catch (profileError) {
                console.log('Using default count of 0');
                setTotalPosts(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePostDeleted = () => {
        // تحديث العدد بعد الحذف
        setTotalPosts(prev => Math.max(0, prev - 1));
    };

    const handlePostCreated = () => {
        // تحديث العدد بعد الإنشاء
        setTotalPosts(prev => prev + 1);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'rgb(69 25 134 / 14%)',
            color: 'white',
            padding: '1rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            overflowY:'hidden'
        }}>
            {/* Header مع عدد البوستات */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                padding: '1rem',
                background: '#1a0b2e',
                borderRadius: '12px',
                width: '75%',
                textAlign: 'center',
                border:'1px solid #3b2369',
                position:'fixed',
                top:'148px',
                zIndex:'1'
            }}>
                <div style={{ width: '100%', display:'flex',
                justifyContent: 'center',
                flexDirection:'column',
                gap:'20px',
                alignItems: 'center', }}>
                    <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
                        {/* <FaFeatherAlt size={22} />  */}
                        {isOwner ? ' My Posts' : ' User Posts'}
                    </h1>
                    {!loading && (
                        <p style={{ 
                            margin: '0.5rem 0 0 0', 
                            color: '#b2a3deff',
                            fontSize: '1rem',
                            fontWeight: '600',
                            padding:'1rem',
                            width:'50%',
                            border:'1px solid #3b2369',
                            borderRadius:'12px'
                        }}>
                            total posts: {totalPosts}
                        </p>
                    )}
                </div>
            </div>

            {/* هنا نستخدم الكومبوننت */}
            <div style={{ width: '75%', minHeight: '25%' , top:'147px',position:'relative',}}>
                <UserPostsFeed
                    userId={userId}
                    isOwnProfile={isOwner}
                    onPostDeleted={handlePostDeleted}
                    onPostUpdated={handlePostCreated} // استخدمها لتحديث العدد
                />
            </div>
        </div>
    );
}