export const BACKGROUND_FETCH_TASK = 'background-check-task';

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleDailyReminder(_hour = 12, _minute = 0): Promise<void> {}

export async function cancelDailyReminder(): Promise<void> {}

export async function scheduleGachaExpiry(_id: string, _expiresAt: number, _app: string): Promise<void> {}

export async function cancelGachaExpiry(_id: string): Promise<void> {}

export async function sendBossDefeatedNotification(_bossName: string): Promise<void> {}

export async function registerBackgroundFetch(): Promise<void> {}
