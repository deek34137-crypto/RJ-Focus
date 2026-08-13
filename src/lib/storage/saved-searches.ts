const STORAGE_KEY = 'rj_focus_saved_searches';

export function getSavedSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addSavedSearch(query: string) {
  if (typeof window === 'undefined') return;
  const searches = getSavedSearches();
  if (!searches.includes(query)) {
    searches.unshift(query);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  }
}

export function removeSavedSearch(query: string) {
  if (typeof window === 'undefined') return;
  const searches = getSavedSearches().filter(q => q !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
}

export function isSearchSaved(query: string): boolean {
  return getSavedSearches().includes(query);
}
