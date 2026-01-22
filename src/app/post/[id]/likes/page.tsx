// app/post/[id]/likes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LikesModal from '@/components/likes/LikesModal';

export default function PostLikesPage() {
    const params = useParams();
    const router = useRouter();
    const [postTitle, setPostTitle] = useState('');

    const postId = params.id as string;

    useEffect(() => {
        // جلب عنوان البوست إذا تحتاجه
        // fetch post title here...
    }, [postId]);

    const handleCloseModal = () => {
        router.back(); // الرجوع للصفحة السابقة عند إغلاق المودال
    };

    return (
        <LikesModal
            postId={postId}
            postTitle={postTitle}
            isOpen={true}
            onClose={handleCloseModal}
        />
    );
}