import { create } from 'zustand';
import { bossApi } from '../api/bossApi';
import { sendBossDefeatedNotification } from '../lib/notifications';
import type { Boss, BossDamageLog } from '../types';

interface BossState {
  globalBoss: Boss | null;
  logs: BossDamageLog[];
  loading: boolean;
  lastDefeat: Boss | null;
  fetchGlobal: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  damage: (data: {
    taskId: string;
    priority: 'low' | 'medium' | 'high';
    isOnTime: boolean;
    displayName?: string;
  }) => Promise<{ damage: number; newHp: number; isDefeated: boolean }>;
  clearDefeat: () => void;
}

export const useBossStore = create<BossState>((set, get) => ({
  globalBoss: null,
  logs: [],
  loading: false,
  lastDefeat: null,

  fetchGlobal: async () => {
    set({ loading: true });
    try {
      const globalBoss = await bossApi.global();
      set({ globalBoss });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  fetchLogs: async () => {
    try {
      const logs = await bossApi.globalLogs();
      set({ logs });
    } catch {
      // サーバー未起動時はスキップ
    }
  },

  damage: async (data) => {
    try {
      const result = await bossApi.damageGlobal(data);
      const boss = get().globalBoss;
      if (boss) {
        const updated = { ...boss, hp: result.newHp };
        set({ globalBoss: updated });
        if (result.isDefeated) {
          set({ lastDefeat: updated });
          await sendBossDefeatedNotification(boss.name);
        }
      }
      return result;
    } catch {
      return { damage: 0, newHp: get().globalBoss?.hp ?? 0, isDefeated: false };
    }
  },

  clearDefeat: () => set({ lastDefeat: null }),
}));
