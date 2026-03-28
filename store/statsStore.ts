import { create } from 'zustand';
import { statsApi } from '../api/statsApi';
import type { WeeklyStats, StreakInfo } from '../types';

interface StatsState {
  weekly: WeeklyStats | null;
  streak: StreakInfo | null;
  loading: boolean;
  fetchWeekly: () => Promise<void>;
  fetchStreak: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  weekly: null,
  streak: null,
  loading: false,

  fetchWeekly: async () => {
    set({ loading: true });
    try {
      const weekly = await statsApi.weekly();
      set({ weekly });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  fetchStreak: async () => {
    try {
      const streak = await statsApi.streak();
      set({ streak });
    } catch {
      // サーバー未起動時はスキップ
    }
  },
}));
