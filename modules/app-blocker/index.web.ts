export type InstalledApp = {
  packageName: string;
  appName: string;
};

export function hasUsagePermission(): boolean { return false; }
export function openUsageSettings(): void {}
export function getInstalledApps(): InstalledApp[] { return []; }
export function startMonitoring(_blockedPackages: string[]): void {}
export function stopMonitoring(): void {}
export function checkPendingLock(): boolean { return false; }
