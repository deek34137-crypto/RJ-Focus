'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getSearchHistory, clearSearchHistory, removeSearchFromHistory } from '@/lib/storage/history';
import { X, Trash2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    setRecentSearches(getSearchHistory());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleRecentClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRemoveHistory = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeSearchFromHistory(query);
    setRecentSearches(getSearchHistory());
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setRecentSearches([]);
  };

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.logo}>RJ Focus</h1>
        </div>
      </header>

      <section className={styles.hero}>
        <h2 className={styles.tagline}>Search exactly what you need.</h2>
        
        <form onSubmit={handleSearch} className={styles.searchContainer}>
          <input 
            type="text" 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search YouTube for exactly what I need..." 
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>Search</button>
        </form>
      </section>

      {recentSearches.length > 0 && (
        <section className={styles.recentSearches}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Recent Searches</h3>
            <button 
              onClick={handleClearAll}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
          <ul className={styles.searchList}>
            {recentSearches.slice(0, 10).map((q, idx) => (
              <li key={idx} onClick={() => handleRecentClick(q)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingRight: '0.5rem' }}>
                <span>{q}</span>
                <button 
                  onClick={(e) => handleRemoveHistory(e, q)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', display: 'flex', borderRadius: '50%' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
