const STORAGE_KEY = 'rj_focus_history';

export function getSearchHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSearchToHistory(query: string) {
  if (typeof window === 'undefined') return;
  const history = getSearchHistory();
  const newHistory = [query, ...history.filter(q => q !== query)].slice(0, 50); // Keep last 50
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
}

export function clearSearchHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function removeSearchFromHistory(query: string) {
  if (typeof window === 'undefined') return;
  const history = getSearchHistory().filter(q => q !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}
