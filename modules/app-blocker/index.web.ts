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
export function getUnlockExpiry(): number { return 0; }
export function setUnlockExpiry(_expiresAt: number): void {}
export function canDrawOverlays(): boolean { return false; }
export function openOverlaySettings(): void {}
export function addBlockListener(_listener: () => void): { remove: () => void } {
  return { remove: () => {} };
}
