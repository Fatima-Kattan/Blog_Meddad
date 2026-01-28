// app/post/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import PostFeed from '@/components/posts/post-feed/PostFeed';

export default function PostPage() {
    const params = useParams();
    const postId = params.id;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <PostFeed 
                singlePostMode={true}
                postId={Number(postId)}
                hideInfiniteScroll={true}
            />
        </div>
    );
}