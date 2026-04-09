import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { useBlockerStore } from '../store/blockerStore';
import {
  hasUsagePermission,
  startMonitoring,
  stopMonitoring,
  checkPendingLock,
} from 'app-blocker';

/**
 * ルートレイアウトで一度だけ使う。
 * - lockEnabled の変化に応じてサービスを開始/停止
 * - AppState が active になるたびに checkPendingLock() を確認し、
 *   ブロックされたアプリから戻ってきた場合にロック画面へ誘導
 */
export function useAppBlocker() {
  const router = useRouter();
  const { lockEnabled } = useSettingsStore();
  const { blockedPackages, load, loaded } = useBlockerStore();
  const serviceRunning = useRef(false);

  // ストア読み込み
  useEffect(() => {
    load();
  }, []);

  // lockEnabled / blockedPackages の変化に応じてサービス制御
  useEffect(() => {
    if (!loaded || Platform.OS !== 'android') return;

    if (lockEnabled && blockedPackages.length > 0 && hasUsagePermission()) {
      startMonitoring(blockedPackages);
      serviceRunning.current = true;
    } else {
      if (serviceRunning.current) {
        stopMonitoring();
        serviceRunning.current = false;
      }
    }

    return () => {
      if (serviceRunning.current) {
        stopMonitoring();
        serviceRunning.current = false;
      }
    };
  }, [lockEnabled, blockedPackages, loaded]);

  // アプリが foreground に戻るたびにロックフラグを確認（AppState + ポーリング両方で確実に拾う）
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const tryLock = () => {
      const pending = checkPendingLock();
      if (pending) router.push('/lock');
    };

    // AppState 変化時
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tryLock();
    });

    // 1秒ごとのポーリング（startActivity で戻ってきたとき AppState が遅延する場合の保険）
    const interval = setInterval(tryLock, 1000);

    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, []);
}
