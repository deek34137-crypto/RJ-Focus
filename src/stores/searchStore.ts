import { create } from 'zustand';
import { SearchSession, SearchMode, VideoResult } from '@/types';

interface SearchState {
  currentSession: SearchSession | null;
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  setSession: (session: SearchSession) => void;
  clearSession: () => void;
  setCurrentVideoIndex: (index: number) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  currentSession: null,
  mode: 'STRICT',
  setMode: (mode) => set({ mode }),
  setSession: (session) => set({ currentSession: session }),
  clearSession: () => set({ currentSession: null }),
  setCurrentVideoIndex: (index) => set((state) => ({
    currentSession: state.currentSession ? { ...state.currentSession, currentIndex: index } : null
  })),
}));
