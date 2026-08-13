export interface WatchProgress {
  videoId: string;
  position: number; // in seconds
  duration: number; // in seconds
  updatedAt: number;
  completed: boolean;
  videoData?: any; // To display in "Continue watching"
}

const STORAGE_KEY = 'rj_focus_progress';

export function getAllProgress(): Record<string, WatchProgress> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: WatchProgress) {
  if (typeof window === 'undefined') return;
  const allProgress = getAllProgress();
  allProgress[progress.videoId] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
}

export function getProgress(videoId: string): WatchProgress | null {
  const allProgress = getAllProgress();
  return allProgress[videoId] || null;
}

export function clearAllProgress() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
