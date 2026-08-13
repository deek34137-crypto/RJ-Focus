export interface ResumeData {
  videoId: string;
  title: string;
  channelName: string;
  thumbnail: string;
  currentTime: number;
  duration: number; // if known
  timestamp: number;
}

const STORAGE_KEY = 'rjfocus_resume_progress';

export function saveResumeProgress(data: Omit<ResumeData, 'timestamp'>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAllResumeProgress();
    
    // Only save if progress is meaningful (>5s) and not almost finished (within 10s of end)
    const isMeaningful = data.currentTime > 5;
    const isFinished = data.duration > 0 && (data.duration - data.currentTime < 10);

    if (!isMeaningful || isFinished) {
      // Remove it if it was saved before
      const filtered = existing.filter(item => item.videoId !== data.videoId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return;
    }

    const newItem: ResumeData = {
      ...data,
      timestamp: Date.now(),
    };

    const filtered = existing.filter(item => item.videoId !== data.videoId);
    const updated = [newItem, ...filtered].slice(0, 20); // Keep max 20

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save resume progress', e);
  }
}

export function getResumeProgress(videoId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const existing = getAllResumeProgress();
    const item = existing.find(i => i.videoId === videoId);
    return item ? item.currentTime : 0;
  } catch (e) {
    return 0;
  }
}

export function getAllResumeProgress(): ResumeData[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function clearResumeProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
