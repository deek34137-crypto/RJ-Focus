'use client';

import Image from 'next/image';
import Link from 'next/link';
import { VideoResult } from '@/types';
import styles from './feed.module.css';
import { ListVideo } from 'lucide-react';

interface VideoGridCardProps {
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

export default function VideoGridCard({ video, index }: VideoGridCardProps) {
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
              {video.duration ? formatDuration(video.duration) : '--:--'}
            </>
          )}
        </div>
      </Link>
      
      <div className={styles.details}>
        <div className={styles.avatar}>
          {video.channelName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.textDetails}>
          <h3 className={styles.title}>
            <Link href={watchUrl} title={video.title}>
              {video.title}
            </Link>
          </h3>
          <p className={styles.channel}>{video.channelName}</p>
          <div className={styles.relevanceBox}>
            <div className={styles.score}>{video.relevanceScore}% match</div>
          </div>
        </div>
      </div>
    </div>
  );
}
