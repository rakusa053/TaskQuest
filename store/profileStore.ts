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
  }) => Promise<{ newLevel?: number; newBadges?: Badge[] }>;
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
    } finally {
      set({ loading: false });
    }
  },

  fetchBadges: async () => {
    const badges = await profileApi.badges();
    set({ badges });
  },

  rewardXp: async (data) => {
    const result = await profileApi.rewardXp(data);
    set({ profile: result.profile });
    if (result.newLevel) set({ lastLevelUp: result.newLevel });
    if (result.newBadges?.length) {
      set({ badges: [...get().badges, ...result.newBadges] });
    }
    return { newLevel: result.newLevel, newBadges: result.newBadges };
  },

  update: async (data) => {
    const profile = await profileApi.update(data);
    set({ profile });
  },

  clearLevelUp: () => set({ lastLevelUp: null }),
}));
