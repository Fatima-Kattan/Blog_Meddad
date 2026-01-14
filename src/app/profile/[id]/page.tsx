// app/profile/[id]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProfileService, { UserProfile } from '@/services/api/auth/profileService';
import Profile from '@/components/auth/profile/profile';

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // ⭐⭐ تنظيف عند الدخول للصفحة
        if (typeof window !== 'undefined') {
            localStorage.removeItem('profileOpenedFromTop');
        }
        
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!userId || userId === 'undefined') {
                    // إذا لم يكن هناك ID، اذهب إلى الصفحة الرئيسية
                    router.push('/');
                    return;
                }
                
                // ⬇️ استخدم الدالة الصحيحة لتحميل البروفايل
                const response = await ProfileService.getUserProfileById(userId);
                setProfile(response.data.user as UserProfile);
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'فشل في تحميل البروفايل');
                
                // إذا كان المستخدم غير موجود، ارجع إلى الصفحة الرئيسية
                if (err.message === 'المستخدم غير موجود') {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfile();
        
        // تنظيف إضافي عند مغادرة الصفحة
        return () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('profileOpenedFromTop');
            }
        };
    }, [userId, router]);
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div className="text-center py-8">
                <div>المستخدم غير موجود</div>
            </div>
        );
    }
    
    // ⬇️ استخدم المكون Profile مباشرة
    return <Profile userId={userId} />;
}