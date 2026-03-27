import { useEffect } from 'react';
import { useStatsStore } from '../store/statsStore';

export function useStats() {
  const { weekly, streak, loading, fetchWeekly, fetchStreak } = useStatsStore();

  useEffect(() => {
    fetchWeekly();
    fetchStreak();
  }, []);

  return { weekly, streak, loading, refetch: () => { fetchWeekly(); fetchStreak(); } };
}
