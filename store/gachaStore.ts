import { create } from 'zustand';
import { gachaApi } from '../api/gachaApi';
import { useProfileStore } from './profileStore';
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
    // 楽観的にチケット数を即時デクリメント
    const profileState = useProfileStore.getState();
    if (profileState.profile) {
      profileState.profile.gachaTickets -= 1;
      useProfileStore.setState({ profile: { ...profileState.profile } });
    }
    try {
      const result = await gachaApi.spin();
      // miss は即消費済みなので results リストには追加しない
      const newResults = result.rarity === 'miss' ? get().results : [result, ...get().results];
      set({ lastSpinResult: result, results: newResults });
      // サーバー側の最新値でプロフィールを同期
      useProfileStore.getState().fetch();
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
