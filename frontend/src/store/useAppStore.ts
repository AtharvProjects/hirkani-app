import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PregnancyProfile } from '@/lib/api';

interface AppState {
  isAuthed: boolean;
  profile: PregnancyProfile | null;
  favorites: any[];
  scanHistory: any[];
  dueDate: string | null;
  // Daily Habits
  dailyWater: number;
  tookVitamin: boolean;
  lastTrackedDate: string | null;
  // Streaks
  streakCount: number;
  lastStreakDate: string | null;
  
  // Thumbnails
  scanThumbnails: Record<string, string>;
  setScanThumbnail: (id: string, base64: string) => void;
  
  setAuthed: (isAuthed: boolean) => void;
  setProfile: (profile: PregnancyProfile | null) => void;
  setDueDate: (date: string | null) => void;
  setFavorites: (favorites: any[]) => void;
  setScanHistory: (history: any[]) => void;
  
  // Habit Actions
  incrementWater: () => void;
  toggleVitamin: () => void;
  resetHabitsIfNeeded: () => void;
  
  // Streak Actions
  incrementStreak: () => void;
  hydratePreferences: (prefs: any) => void;
  
  clearState: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isAuthed: false,
      profile: null,
      dueDate: null,
      favorites: [],
      scanHistory: [],
      scanThumbnails: {},
      dailyWater: 0,
      tookVitamin: false,
      lastTrackedDate: null,
      streakCount: 0,
      lastStreakDate: null,
      
      setAuthed: (isAuthed) => set({ isAuthed }),
      setProfile: (profile) => set({ profile }),
      setDueDate: (dueDate) => {
        set({ dueDate });
        import('@/lib/api').then(({ api }) => api.syncPreferences());
      },
      setFavorites: (favorites) => set({ favorites }),
      setScanHistory: (scanHistory) => set({ scanHistory }),
      setScanThumbnail: (id, base64) => set((state) => ({ 
        scanThumbnails: { ...state.scanThumbnails, [id]: base64 } 
      })),
      
      incrementWater: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastTrackedDate !== today) {
            return { dailyWater: 1, tookVitamin: false, lastTrackedDate: today };
          }
          return { dailyWater: Math.min(state.dailyWater + 1, 8) };
        });
        import('@/lib/api').then(({ api }) => api.syncPreferences());
      },
      toggleVitamin: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastTrackedDate !== today) {
            return { dailyWater: 0, tookVitamin: true, lastTrackedDate: today };
          }
          return { tookVitamin: !state.tookVitamin };
        });
        import('@/lib/api').then(({ api }) => api.syncPreferences());
      },
      resetHabitsIfNeeded: () => {
        let changed = false;
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastTrackedDate !== today) {
            changed = true;
            return { dailyWater: 0, tookVitamin: false, lastTrackedDate: today };
          }
          return state;
        });
        if (changed) import('@/lib/api').then(({ api }) => api.syncPreferences());
      },
      incrementStreak: () => {
        let changed = false;
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.lastStreakDate === today) return state; // Already earned today
          
          changed = true;
          // If they missed yesterday, reset to 1. Otherwise, increment.
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (state.lastStreakDate === yesterdayStr) {
            return { streakCount: state.streakCount + 1, lastStreakDate: today };
          }
          return { streakCount: 1, lastStreakDate: today };
        });
        if (changed) import('@/lib/api').then(({ api }) => api.syncPreferences());
      },
      
      hydratePreferences: (prefs) => set((state) => {
        if (!prefs) return state;
        return {
          dueDate: prefs.dueDate ?? state.dueDate,
          dailyWater: prefs.dailyWater ?? state.dailyWater,
          tookVitamin: prefs.tookVitamin ?? state.tookVitamin,
          lastTrackedDate: prefs.lastTrackedDate ?? state.lastTrackedDate,
          streakCount: prefs.streakCount ?? state.streakCount,
          lastStreakDate: prefs.lastStreakDate ?? state.lastStreakDate,
        };
      }),
      
      clearState: () => set({ 
        isAuthed: false, profile: null, dueDate: null, favorites: [], scanHistory: [],
        dailyWater: 0, tookVitamin: false, lastTrackedDate: null, streakCount: 0, lastStreakDate: null
      }),
    }),
    {
      name: 'hirkani-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        isAuthed: state.isAuthed, 
        profile: state.profile,
        dueDate: state.dueDate,
        favorites: state.favorites,
        scanHistory: state.scanHistory,
        dailyWater: state.dailyWater,
        tookVitamin: state.tookVitamin,
        lastTrackedDate: state.lastTrackedDate,
        streakCount: state.streakCount,
        lastStreakDate: state.lastStreakDate
      }),
    }
  )
);
