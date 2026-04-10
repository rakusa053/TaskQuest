import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gamingtask_blocked_packages';

interface BlockerState {
  blockedPackages: string[];
  loaded: boolean;
  load: () => Promise<void>;
  toggle: (pkg: string) => Promise<void>;
}

export const useBlockerStore = create<BlockerState>((set, get) => ({
  blockedPackages: [],
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      set({ blockedPackages: raw ? JSON.parse(raw) : [], loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  toggle: async (pkg: string) => {
    const current = get().blockedPackages;
    const next = current.includes(pkg)
      ? current.filter((p) => p !== pkg)
      : [...current, pkg];
    set({ blockedPackages: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));
