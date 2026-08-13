'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import styles from './playlist.module.css';

export interface PlaylistItem {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  position: number;
}

interface PlaylistSidebarProps {
  listId: string;
  currentVideoId: string | null;
  onSelectVideo: (videoId: string, index: number) => void;
}

export default function PlaylistSidebar({ listId, currentVideoId, onSelectVideo }: PlaylistSidebarProps) {
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const activeItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    async function fetchPlaylist() {
      try {
        const res = await fetch(`/api/playlist?id=${listId}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load playlist', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [listId]);

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentVideoId, items]);

  if (loading) {
    return <div className={styles.loading}>Loading playlist...</div>;
  }

  if (items.length === 0) {
    return null;
  }

  const currentIndex = items.findIndex(item => item.id === currentVideoId);
  const progressText = currentIndex !== -1 ? `${currentIndex + 1} / ${items.length}` : `${items.length} videos`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Playlist</h3>
        <span className={styles.progress}>{progressText}</span>
      </div>
      <ul className={styles.list}>
        {items.map((item, index) => {
          const isActive = item.id === currentVideoId;
          return (
            <li 
              key={item.id} 
              ref={isActive ? activeItemRef : null}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => onSelectVideo(item.id, index)}
            >
              <div className={styles.position}>
                {isActive ? <Play size={14} className={styles.playIcon} /> : index + 1}
              </div>
              <div className={styles.thumbnailWrapper}>
                <Image 
                  src={item.thumbnail}
                  alt={item.title}
                  width={120}
                  height={68}
                  className={styles.thumbnail}
                />
              </div>
              <div className={styles.details}>
                <h4 className={styles.title}>{item.title}</h4>
                <p className={styles.channel}>{item.channelName}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
