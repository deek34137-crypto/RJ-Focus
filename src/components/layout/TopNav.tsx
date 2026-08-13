'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Clock } from 'lucide-react';
import styles from './topnav.module.css';
import { getSearchHistory, removeSearchFromHistory } from '@/lib/storage/history';

export default function TopNav() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [isFocused]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    setIsFocused(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleRemoveHistory = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    removeSearchFromHistory(q);
    setHistory(getSearchHistory());
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navLeft}>
        <Link href="/" className={styles.logo}>
          RJ Focus
        </Link>
      </div>

      <div className={styles.navCenter} ref={dropdownRef}>
        <form className={`${styles.searchBox} ${isFocused ? styles.focused : ''}`} onSubmit={handleSearch}>
          {isFocused && <Search size={18} className={styles.searchIconLeft} />}
          <input
            type="text"
            placeholder="Search"
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          <button type="submit" className={styles.searchButton}>
            <Search size={20} />
          </button>
        </form>

        {isFocused && history.length > 0 && (
          <div className={styles.dropdown}>
            <ul>
              {history.slice(0, 10).map((h, i) => (
                <li key={i} className={styles.historyItem} onClick={() => handleHistoryClick(h)}>
                  <div className={styles.historyText}>
                    <Clock size={16} className={styles.historyIcon} />
                    <span>{h}</span>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => handleRemoveHistory(e, h)}
                    title="Remove from history"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.navRight}>
        {/* Placeholder for future auth/settings */}
      </div>
    </nav>
  );
}
