import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';

export const BACKGROUND_FETCH_TASK = 'background-check-task';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// 毎日のリマインド通知をスケジュール
export async function scheduleDailyReminder(hour = 12, minute = 0) {
  await Notifications.cancelScheduledNotificationAsync('daily-reminder').catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: {
      title: 'GamingTask',
      body: '今日のタスクをチェックしよう！ボスが待っています 🐉',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync('daily-reminder').catch(() => {});
}

// ガチャタイマー終了通知
export async function scheduleGachaExpiry(id: string, expiresAt: number, app: string) {
  const trigger = new Date(expiresAt);
  if (trigger.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier: `gacha-expiry-${id}`,
    content: {
      title: 'アプリ解放終了',
      body: `${app} の解放時間が終了しました`,
      sound: true,
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: trigger },
  });
}

export async function cancelGachaExpiry(id: string) {
  await Notifications.cancelScheduledNotificationAsync(`gacha-expiry-${id}`).catch(() => {});
}

// ボス討伐通知（全参加者に）
export async function sendBossDefeatedNotification(bossName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ボス討伐成功！ 🎉',
      body: `${bossName} を倒した！報酬を確認しよう！`,
      sound: true,
    },
    trigger: null,
  });
}

// バックグラウンドタスク登録（アプリロック用）
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerBackgroundFetch() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 60 * 15,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (_) {}
}
