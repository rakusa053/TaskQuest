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
  addBlockListener,
} from 'app-blocker';

/**
 * ルートレイアウトで一度だけ使う。
 * - lockEnabled の変化に応じてサービスを開始/停止
 * - AppState が active になるたびに checkPendingLock() を確認し、
 *   ブロックされたアプリから戻ってきた場合にロック画面へ誘導
 */
export function useAppBlocker(isLayoutReady = false) {
  const router = useRouter();
  const { lockEnabled } = useSettingsStore();
  const { blockedPackages, load, loaded } = useBlockerStore();
  const serviceRunning = useRef(false);
  const isMounted = useRef(false);
  const isLayoutReadyRef = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // isLayoutReady の最新値を ref に同期（closure 内で常に最新値を参照）
  useEffect(() => {
    isLayoutReadyRef.current = isLayoutReady;
  }, [isLayoutReady]);

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

  // ブロック検出イベント → 即座にロック画面へ（最優先）
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const blockSub = addBlockListener(() => {
      if (isMounted.current && isLayoutReadyRef.current) router.replace('/lock');
    });

    return () => blockSub.remove();
  }, []);

  // フォールバック: AppState + ポーリングで SharedPreferences を確認
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const tryLock = () => {
      if (!isMounted.current || !isLayoutReadyRef.current) return;
      const pending = checkPendingLock();
      if (pending) router.replace('/lock');
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tryLock();
    });

    const interval = setInterval(tryLock, 1000);

    return () => {
      appStateSub.remove();
      clearInterval(interval);
    };
  }, []);
}
