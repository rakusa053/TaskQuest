import { requireOptionalNativeModule } from 'expo-modules-core';

const AppBlocker = requireOptionalNativeModule('AppBlocker');

export type InstalledApp = {
  packageName: string;
  appName: string;
};

/** UsageStats 権限が付与されているか確認 */
export function hasUsagePermission(): boolean {
  return AppBlocker?.hasUsagePermission() ?? false;
}

/** 使用状況アクセスの設定画面を開く */
export function openUsageSettings(): void {
  AppBlocker?.openUsageSettings();
}

/** インストール済みの起動可能アプリ一覧を取得 */
export function getInstalledApps(): InstalledApp[] {
  return AppBlocker?.getInstalledApps() ?? [];
}

/** 監視開始（blockedPackages に含まれるアプリが前面に来たらロック画面へ） */
export function startMonitoring(blockedPackages: string[]): void {
  AppBlocker?.startMonitoring(blockedPackages);
}

/** 監視停止 */
export function stopMonitoring(): void {
  AppBlocker?.stopMonitoring();
}

/**
 * ガチャ報酬の解放期限を設定する（Unix ms）。
 * この時刻までブロック対象アプリを開いても監視サービスがスキップする。
 */
export function setUnlockExpiry(expiresAt: number): void {
  AppBlocker?.setUnlockExpiry(expiresAt);
}

/**
 * SharedPreferences に "show_lock=true" が残っているか確認し、
 * 残っていれば true を返してフラグをクリアする。
 */
export function checkPendingLock(): boolean {
  return AppBlocker?.checkPendingLock() ?? false;
}
