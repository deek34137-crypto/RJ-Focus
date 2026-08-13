'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/searchStore';
import SearchResultCard from '@/components/search/SearchResultCard';
import styles from './search.module.css';
import { SearchMode } from '@/types';
import { addSearchToHistory } from '@/lib/storage/history';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q');
  
  const { mode, setMode, currentSession, setSession } = useSearchStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchInput, setSearchInput] = useState(query || '');

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&mode=${mode}`);
        if (!res.ok) throw new Error('Search failed');
        
        const data = await res.json();
        
        setSession({
          id: Date.now().toString(),
          query,
          intent: data.intent,
          mode,
          results: data.results,
          createdAt: Date.now(),
        });

        addSearchToHistory(query);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, mode, setSession]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.logo} onClick={() => router.push('/')}>RJ Focus</h1>
          <form onSubmit={handleSearch} className={styles.searchContainer}>
            <input 
              type="text" 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..." 
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>Search</button>
          </form>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <div className={styles.modes}>
            {(['STRICT', 'BALANCED', 'DISCOVERY'] as SearchMode[]).map(m => (
              <button 
                key={m}
                onClick={() => setMode(m)}
                className={`${styles.modeBtn} ${mode === m ? styles.activeMode : ''}`}
              >
                {m}
              </button>
            ))}
          </div>

          {currentSession?.intent && Object.keys(currentSession.intent).length > 0 && (
            <div className={styles.intentSection}>
              <h3>Detected Intent</h3>
              <div className={styles.intentTags}>
                {Object.entries(currentSession.intent).map(([key, val]) => (
                  <span key={key} className={styles.intentTag}>{val as React.ReactNode}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.resultsArea}>
          {loading && <div className={styles.loading}>Searching highly relevant videos...</div>}
          
          {error && <div className={styles.error}>{error}</div>}

          {!loading && !error && currentSession?.results.length === 0 && (
            <div className={styles.empty}>
              <h2>No highly relevant videos found.</h2>
              <p>Try switching to Balanced mode or modify your search.</p>
            </div>
          )}

          {!loading && !error && currentSession && currentSession.results.length > 0 && (
            <div className={styles.resultsList}>
              <p className={styles.resultsCount}>{currentSession.results.length} highly relevant results</p>
              {currentSession.results.map((video, idx) => (
                <SearchResultCard key={video.id} video={video} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
