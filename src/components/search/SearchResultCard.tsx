import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { VideoResult } from '@/types';
import styles from '@/app/search/search.module.css';
import { isBookmarked, addBookmark, removeBookmark } from '@/lib/storage/bookmarks';
import { Bookmark, BookmarkCheck, ListVideo, PlayCircle } from 'lucide-react';

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

  const isPlaylist = video.itemType === 'playlist';
  const watchUrl = isPlaylist 
    ? `/watch?list=${video.id}&index=${index}` 
    : `/watch?v=${video.id}&index=${index}`;

  return (
    <div className={styles.card}>
      <Link href={watchUrl} className={styles.thumbnailWrapper}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          width={320}
          height={180}
          className={styles.thumbnail}
        />
        <div className={styles.mediaBadge}>
          {isPlaylist ? (
            <>
              <ListVideo size={14} />
              {video.itemCount} videos
            </>
          ) : (
            <>
              <PlayCircle size={14} />
              {video.duration ? formatDuration(video.duration) : '--:--'}
            </>
          )}
        </div>
      </Link>
      
      <div className={styles.details}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h3 className={styles.title}>
            <Link href={watchUrl}>
              {video.title}
            </Link>
          </h3>
          <button className={styles.bookmarkBtn} onClick={toggleBookmark} style={{ color: saved ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
        <p className={styles.channel}>{video.channelName}</p>
        
        <div className={styles.relevanceBox}>
          <div className={styles.score}>{video.relevanceScore}% match</div>
          <ul className={styles.reasons}>
            {video.relevanceReasons.map((r, i) => (
              <li key={i}>• {r}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
