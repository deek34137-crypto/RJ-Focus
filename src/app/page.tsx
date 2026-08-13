'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getSearchHistory } from '@/lib/storage/history';
import { VideoResult } from '@/types';
import VideoGridCard from '@/components/feed/VideoGridCard';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [feed, setFeed] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const history = getSearchHistory();
        // If they have history, use the most recent search. Otherwise, default to a broad educational query.
        const query = history.length > 0 ? history[0] : 'JEE NEET Physics Chemistry Maths One Shot';
        
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=DISCOVERY`);
        if (res.ok) {
          const data = await res.json();
          setFeed(data.results || []);
        }
      } catch (err) {
        console.error('Failed to fetch feed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeed();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.feedHeader}>
        <h2>Recommended</h2>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Curating your feed...</p>
        </div>
      ) : feed.length > 0 ? (
        <div className={styles.grid}>
          {feed.map((video, idx) => (
            <VideoGridCard key={video.id} video={video} index={idx} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No recommendations found. Try searching for something!</p>
        </div>
      )}
    </main>
  );
}
