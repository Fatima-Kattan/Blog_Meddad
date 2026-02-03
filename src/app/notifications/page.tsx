import { redirect } from 'next/navigation';
import NotificationsClient from './NotificationsClient';

// ⭐ هذا السطر يجعل الصفحة Dynamic
export const dynamic = 'force-dynamic';

// ⭐ Interface للإشعارات (نسخ من context) - احتفظي به للتوافق
interface Notification {
    id: number;
    type: string;
    body: string;
    post_id?: number | null;
    comment_id?: number | null;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    actor: {
        id: number;
        full_name: string;
        image: string;
    };
}

export default async function NotificationsPage() {

    return <NotificationsClient />;
}