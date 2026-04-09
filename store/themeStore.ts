import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppTheme } from '../types';

export const PRESET_THEMES: AppTheme[] = [
  { id: 'theme_default',  name: 'デフォルト', accentColor: '#6366f1', bgColor: '#ede9fe', borderColor: '#a78bfa' },
  { id: 'theme_ocean',    name: 'オーシャン', accentColor: '#2563eb', bgColor: '#dbeafe', borderColor: '#60a5fa' },
  { id: 'theme_forest',   name: 'フォレスト', accentColor: '#16a34a', bgColor: '#dcfce7', borderColor: '#4ade80' },
  { id: 'theme_sunset',   name: 'サンセット', accentColor: '#ea580c', bgColor: '#ffedd5', borderColor: '#fb923c' },
  { id: 'theme_cherry',   name: 'チェリー',   accentColor: '#db2777', bgColor: '#fce7f3', borderColor: '#f472b6' },
  { id: 'theme_gold',     name: 'ゴールド',   accentColor: '#ca8a04', bgColor: '#fef9c3', borderColor: '#facc15' },
];

const STORAGE_KEY = 'gamingtask_theme';

interface ThemeState {
  activeThemeId: string;
  unlockedThemeIds: string[];
  theme: AppTheme;
  load: () => Promise<void>;
  applyTheme: (themeId: string) => Promise<void>;
  unlockTheme: (themeId: string) => Promise<void>;
}

const getTheme = (id: string): AppTheme =>
  PRESET_THEMES.find((t) => t.id === id) ?? PRESET_THEMES[0];

export const useThemeStore = create<ThemeState>((set, get) => ({
  activeThemeId: 'theme_default',
  unlockedThemeIds: ['theme_default'],
  theme: PRESET_THEMES[0],

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { activeThemeId, unlockedThemeIds } = JSON.parse(raw);
        set({ activeThemeId, unlockedThemeIds, theme: getTheme(activeThemeId) });
      }
    } catch {}
  },

  applyTheme: async (themeId: string) => {
    const theme = getTheme(themeId);
    set({ activeThemeId: themeId, theme });
    const { unlockedThemeIds } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ activeThemeId: themeId, unlockedThemeIds }));
  },

  unlockTheme: async (themeId: string) => {
    const { unlockedThemeIds } = get();
    if (unlockedThemeIds.includes(themeId)) return;
    const updated = [...unlockedThemeIds, themeId];
    set({ unlockedThemeIds: updated });
    const { activeThemeId } = get();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ activeThemeId, unlockedThemeIds: updated }));
  },
}));
