import { useEffect } from 'react';
import { useProfileStore } from '../store/profileStore';

export function useProfile() {
  const { profile, badges, loading, lastLevelUp, fetch, fetchBadges, update, clearLevelUp } =
    useProfileStore();

  useEffect(() => {
    fetch();
    fetchBadges();
  }, []);

  return { profile, badges, loading, lastLevelUp, update, clearLevelUp, refetch: fetch };
}
