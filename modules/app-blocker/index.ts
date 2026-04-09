import { requireOptionalNativeModule, EventEmitter, type EventSubscription } from 'expo-modules-core';

const AppBlocker = requireOptionalNativeModule('AppBlocker');
const emitter = AppBlocker ? new EventEmitter(AppBlocker) : null;

export type InstalledApp = {
  packageName: string;
  appName: string;
  icon?: string; // data:image/png;base64,...
};

/** UsageStats 権限が付与されているか確認 */
export function hasUsagePermission(): boolean {
  return AppBlocker?.hasUsagePermission() ?? false;
}

/** 使用状況アクセスの設定画面を開く */
export function openUsageSettings(): void {
  AppBlocker?.openUsageSettings();
}

/** 「他のアプリの上に表示」権限があるか（Android 10+ のバックグラウンド起動に必要） */
export function canDrawOverlays(): boolean {
  return AppBlocker?.canDrawOverlays() ?? false;
}

/** 「他のアプリの上に表示」設定画面を開く */
export function openOverlaySettings(): void {
  AppBlocker?.openOverlaySettings();
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

/** ブロック検出イベントのリスナーを登録する */
export function addBlockListener(listener: () => void): EventSubscription {
  return emitter?.addListener('onBlockDetected', listener) ?? { remove: () => {} };
}

/** 現在の解放期限（Unix ms）を返す。0 なら解放中ではない */
export function getUnlockExpiry(): number {
  return AppBlocker?.getUnlockExpiry?.() ?? 0;
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
