'use client';

import MyFollowers from '@/components/follow/myFollowers/MyFollowers';

export default function FollowersClient() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <MyFollowers />
            </div>
        </div>
    );
}