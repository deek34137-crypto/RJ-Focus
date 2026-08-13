import { VideoResult } from '@/types';

const STORAGE_KEY = 'rj_focus_bookmarks';

export function getBookmarks(): VideoResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addBookmark(video: VideoResult) {
  if (typeof window === 'undefined') return;
  const bookmarks = getBookmarks();
  if (!bookmarks.find(b => b.id === video.id)) {
    bookmarks.unshift(video);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
}

export function removeBookmark(videoId: string) {
  if (typeof window === 'undefined') return;
  const bookmarks = getBookmarks().filter(b => b.id !== videoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(videoId: string): boolean {
  return getBookmarks().some(b => b.id === videoId);
}

export function clearBookmarks() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
