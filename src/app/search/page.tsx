// app/search/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import SearchClient from './SearchClient';
import LoadingIcon from '@/components/shared/LoadingIcon/LoadingIcon'; // ✅ استيراد LoadingIcon
import styles from './SearchPage.module.css';

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; type?: string }>
}) {
    const params = await searchParams;
    const query = params.q || '';
    const type = params.type || 'all';

    return (
        <div className={styles.searchPage}>
            <div className={styles.container}>
                <Suspense fallback={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                        width: '100%'
                    }}>
                        <LoadingIcon 
                            message="Loading search..."
                            size={50}
                            position="relative"
                            fullScreen={false}
                            color="#8b5cf6"
                        />
                    </div>
                }>
                    <SearchClient
                        initialQuery={query}
                        initialType={type}
                    />
                </Suspense>
            </div>
        </div>
    );
}