// app/search/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { Suspense } from 'react';
import SearchClient from './SearchClient';
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
                    <div className={styles.resultsContainer}>
                        <div className={styles.loadingState}>
                            <div className={styles.spinner}></div>
                            <p className={styles.loadingText}>Loading search...</p>
                        </div>
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