'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import { getSearchHistory } from '@/lib/storage/history';
import { getAllResumeProgress, ResumeData } from '@/lib/storage/resume';
import { VideoResult } from '@/types';
import VideoGridCard from '@/components/feed/VideoGridCard';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Play } from 'lucide-react';

export default function Home() {
  const [feed, setFeed] = useState<VideoResult[]>([]);
  const [resumeItems, setResumeItems] = useState<ResumeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setResumeItems(getAllResumeProgress().slice(0, 4)); // Get top 4 recent

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
      {resumeItems.length > 0 && (
        <div className={styles.resumeSection}>
          <div className={styles.feedHeader}>
            <h2>Continue Watching</h2>
          </div>
          <div className={styles.resumeGrid}>
            {resumeItems.map((item) => (
              <Link href={`/watch?v=${item.videoId}`} key={item.videoId} className={styles.resumeCard}>
                <div className={styles.resumeThumbnail}>
                  <Image src={item.thumbnail} alt={item.title} fill className={styles.image} />
                  <div className={styles.resumeOverlay}>
                    <Play className={styles.playIcon} size={32} />
                  </div>
                  {item.duration > 0 && (
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill} 
                        style={{ width: `${Math.min(100, (item.currentTime / item.duration) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className={styles.resumeInfo}>
                  <h4 className={styles.resumeTitle}>{item.title}</h4>
                  <p className={styles.resumeChannel}>{item.channelName}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
