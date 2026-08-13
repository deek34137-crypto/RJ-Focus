'use client';

import { useState, useEffect } from 'react';
import { clearSearchHistory, getSearchHistory } from '@/lib/storage/history';
import { clearResumeProgress, getAllResumeProgress } from '@/lib/storage/resume';
import { Trash2 } from 'lucide-react';
import styles from './settings.module.css';

export default function SettingsPage() {
  const [historyCount, setHistoryCount] = useState(0);
  const [resumeCount, setResumeCount] = useState(0);

  useEffect(() => {
    setHistoryCount(getSearchHistory().length);
    setResumeCount(getAllResumeProgress().length);
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your search history?')) {
      clearSearchHistory();
      setHistoryCount(0);
    }
  };

  const handleClearResume = () => {
    if (confirm('Are you sure you want to clear your Continue Watching progress?')) {
      clearResumeProgress();
      setResumeCount(0);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Settings</h1>
          <p>Manage your local data and preferences</p>
        </div>

        <section className={styles.section}>
          <h2>Privacy & Data</h2>
          <div className={styles.card}>
            <div className={styles.info}>
              <h3>Search History</h3>
              <p>You have {historyCount} items in your search history.</p>
            </div>
            <button 
              className={styles.dangerBtn} 
              onClick={handleClearHistory}
              disabled={historyCount === 0}
            >
              <Trash2 size={16} /> Clear History
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.info}>
              <h3>Continue Watching</h3>
              <p>You have {resumeCount} videos in your resume progress.</p>
            </div>
            <button 
              className={styles.dangerBtn} 
              onClick={handleClearResume}
              disabled={resumeCount === 0}
            >
              <Trash2 size={16} /> Clear Progress
            </button>
          </div>
        </section>

        <section className={styles.section}>
          <h2>About</h2>
          <div className={styles.card}>
            <div className={styles.info}>
              <h3>RJ Focus</h3>
              <p>Pro Max educational viewing experience built with Next.js</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
