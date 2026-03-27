import { useEffect } from 'react';
import { useBossStore } from '../store/bossStore';

export function useBoss() {
  const { globalBoss, logs, loading, lastDefeat, fetchGlobal, fetchLogs, damage, clearDefeat } =
    useBossStore();

  useEffect(() => {
    fetchGlobal();
    fetchLogs();
  }, []);

  return { globalBoss, logs, loading, lastDefeat, damage, clearDefeat, refetch: fetchGlobal };
}
