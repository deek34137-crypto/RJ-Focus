import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VideoResult } from '@/types';
import styles from './search.module.css';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/storage/bookmarks';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface SearchResultCardProps {
  video: VideoResult;
  index: number;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

export default function SearchResultCard({ video, index }: SearchResultCardProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(video.id));
  }, [video.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeBookmark(video.id);
      setSaved(false);
    } else {
      addBookmark(video);
      setSaved(true);
    }
  };

  return (
    <div className={styles.card}>
      <Link href={`/watch?v=${video.id}&index=${index}`} className={styles.thumbnailWrapper}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={320}
          height={180}
          className={styles.thumbnail}
        />
        <div className={styles.duration}>{formatDuration(video.duration)}</div>
      </Link>
      
      <div className={styles.details}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className={styles.title}>
            <Link href={`/watch?v=${video.id}&index=${index}`}>
              {video.title}
            </Link>
          </h3>
          <button onClick={toggleBookmark} style={{ color: saved ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
        <p className={styles.channel}>{video.channelName}</p>
        
        <div className={styles.relevanceBox}>
          <div className={styles.score}>{video.relevanceScore}% relevant</div>
          <ul className={styles.reasons}>
            {video.relevanceReasons.map((r, i) => (
              <li key={i}>✓ {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
