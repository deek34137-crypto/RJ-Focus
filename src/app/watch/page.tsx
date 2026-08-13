'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/searchStore';
import styles from './watch.module.css';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function YouTubePlayer({ videoId }: { videoId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setUseFallback(false);
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    let script = document.getElementById('youtube-iframe-api') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    const host = useFallback ? 'https://www.youtube.com' : 'https://www.youtube-nocookie.com';

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      if (!containerRef.current) return;
      
      const targetDiv = document.createElement('div');
      targetDiv.style.width = '100%';
      targetDiv.style.height = '100%';
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(targetDiv);

      playerRef.current = new window.YT.Player(targetDiv, {
        videoId,
        host,
        playerVars: {
          autoplay: 1,
          rel: 0,
        },
        events: {
          onError: (event: any) => {
            console.warn('YouTube Player Error:', event.data);
            if (!useFallback) {
              console.log('Falling back to standard youtube.com embed...');
              setUseFallback(true);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId, useFallback]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

function WatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const videoId = searchParams.get('v');
  const indexParam = searchParams.get('index');
  const index = indexParam ? parseInt(indexParam, 10) : -1;
  
  const { currentSession } = useSearchStore();

  if (!videoId) {
    return <div className={styles.error}>No video selected</div>;
  }

  const currentVideo = currentSession?.results[index];

  const handleNext = () => {
    if (currentSession && index >= 0 && index < currentSession.results.length - 1) {
      const nextVid = currentSession.results[index + 1];
      router.push(`/watch?v=${nextVid.id}&index=${index + 1}`);
    }
  };

  const handlePrev = () => {
    if (currentSession && index > 0) {
      const prevVid = currentSession.results[index - 1];
      router.push(`/watch?v=${prevVid.id}&index=${index - 1}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          ← Back to results
        </button>
        {currentSession && (
          <div className={styles.sessionInfo}>
            Current search: <strong>{currentSession.query}</strong>
          </div>
        )}
      </div>

      <div className={styles.playerContainer}>
        <YouTubePlayer videoId={videoId} />
      </div>

      <div className={styles.controls}>
        <button 
          onClick={handlePrev} 
          disabled={!currentSession || index <= 0}
          className={styles.navBtn}
        >
          Previous
        </button>
        
        <div className={styles.videoInfo}>
          <h2>{currentVideo?.title || 'Loading...'}</h2>
          <p>{currentVideo?.channelName}</p>
        </div>

        <button 
          onClick={handleNext} 
          disabled={!currentSession || index >= currentSession.results.length - 1}
          className={styles.navBtn}
        >
          Next
        </button>
      </div>
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading player...</div>}>
      <WatchContent />
    </Suspense>
  );
}
