'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { getSearchHistory } from '@/lib/storage/history';

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

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.logo}>RJ Focus</h1>
          <button className={styles.settingsBtn}>History ⚙</button>
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
          <h3>Recent Searches</h3>
          <ul className={styles.searchList}>
            {recentSearches.slice(0, 5).map((q, idx) => (
              <li key={idx} onClick={() => handleRecentClick(q)}>
                {q}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
