import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  requestNotificationPermission,
} from '../lib/notifications';

interface SettingsState {
  notificationsEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  lockEnabled: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setReminderTime: (hour: number, minute: number) => Promise<void>;
  setLockEnabled: (enabled: boolean) => Promise<void>;
}

const SETTINGS_KEY = 'gamingtask_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notificationsEnabled: false,
  reminderHour: 12,
  reminderMinute: 0,
  lockEnabled: false,
  loaded: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        set({ ...s, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  setNotifications: async (enabled) => {
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      await scheduleDailyReminder(get().reminderHour, get().reminderMinute);
    } else {
      await cancelDailyReminder();
    }
    set({ notificationsEnabled: enabled });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), notificationsEnabled: enabled }));
  },

  setReminderTime: async (hour, minute) => {
    set({ reminderHour: hour, reminderMinute: minute });
    if (get().notificationsEnabled) {
      await scheduleDailyReminder(hour, minute);
    }
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), reminderHour: hour, reminderMinute: minute }));
  },

  setLockEnabled: async (enabled) => {
    set({ lockEnabled: enabled });
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...get(), lockEnabled: enabled }));
  },
}));
