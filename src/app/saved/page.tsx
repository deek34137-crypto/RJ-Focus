'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchResultCard from '@/components/search/SearchResultCard';
import { getBookmarks } from '@/lib/storage/bookmarks';
import { VideoResult } from '@/types';
import styles from './saved.module.css';

export default function SavedPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<VideoResult[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.logo} onClick={() => router.push('/')}>RJ Focus</h1>
        </div>
      </header>

      <section className={styles.content}>
        <h2>Saved Videos</h2>
        {bookmarks.length === 0 ? (
          <p className={styles.empty}>No saved videos yet.</p>
        ) : (
          <div className={styles.resultsList}>
            {bookmarks.map((video, idx) => (
              <SearchResultCard key={video.id} video={video} index={idx} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
