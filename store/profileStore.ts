import { create } from 'zustand';
import { profileApi } from '../api/profileApi';
import type { UserProfile, Badge } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  badges: Badge[];
  loading: boolean;
  lastLevelUp: number | null;
  fetch: () => Promise<void>;
  fetchBadges: () => Promise<void>;
  rewardXp: (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) => Promise<{ xp: number; money: number; gachaTickets: number; newLevel?: number; newBadges?: Badge[] }>;
  update: (data: { displayName?: string; avatarId?: string }) => Promise<void>;
  clearLevelUp: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  badges: [],
  loading: false,
  lastLevelUp: null,

  fetch: async () => {
    set({ loading: true });
    try {
      const profile = await profileApi.get();
      set({ profile });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  fetchBadges: async () => {
    try {
      const badges = await profileApi.badges();
      set({ badges });
    } catch {
      // サーバー未起動時はスキップ
    }
  },

  rewardXp: async (data) => {
    try {
      const result = await profileApi.rewardXp(data);
      if (result.profile) set({ profile: result.profile });
      if (result.newLevel) set({ lastLevelUp: result.newLevel });
      if (result.newBadges?.length) {
        set({ badges: [...get().badges, ...result.newBadges] });
      }
      return { xp: result.xp, money: result.money, gachaTickets: result.gachaTickets, newLevel: result.newLevel, newBadges: result.newBadges };
    } catch {
      return { xp: 0, money: 0, gachaTickets: 0 };
    }
  },

  update: async (data) => {
    try {
      await profileApi.update(data);
      await get().fetch();
    } catch {
      // サーバー未起動時はスキップ
    }
  },

  clearLevelUp: () => set({ lastLevelUp: null }),
}));
