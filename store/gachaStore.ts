import { create } from 'zustand';
import { gachaApi } from '../api/gachaApi';
import type { GachaResult } from '../types';

interface GachaState {
  results: GachaResult[];
  lastSpinResult: GachaResult | null;
  loading: boolean;
  fetchResults: () => Promise<void>;
  spin: () => Promise<GachaResult>;
  useResult: (id: string, targetApp: string) => Promise<{ expiresAt: number }>;
  clearLastSpin: () => void;
}

export const useGachaStore = create<GachaState>((set, get) => ({
  results: [],
  lastSpinResult: null,
  loading: false,

  fetchResults: async () => {
    set({ loading: true });
    try {
      const results = await gachaApi.results();
      set({ results });
    } catch {
      // サーバー未起動時はスキップ
    } finally {
      set({ loading: false });
    }
  },

  spin: async () => {
    set({ loading: true });
    try {
      const result = await gachaApi.spin();
      set({ lastSpinResult: result, results: [result, ...get().results] });
      return result;
    } finally {
      set({ loading: false });
    }
  },

  useResult: async (id, targetApp) => {
    const data = await gachaApi.use(id, targetApp);
    set({
      results: get().results.map((r) =>
        r.id === id ? { ...r, used: true, usedAt: Date.now(), targetApp, expiresAt: data.expiresAt } : r
      ),
    });
    return { expiresAt: data.expiresAt };
  },

  clearLastSpin: () => set({ lastSpinResult: null }),
}));
