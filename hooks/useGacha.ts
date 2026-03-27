import { useEffect } from 'react';
import { useGachaStore } from '../store/gachaStore';

export function useGacha() {
  const { results, lastSpinResult, loading, fetchResults, spin, useResult, clearLastSpin } =
    useGachaStore();

  useEffect(() => {
    fetchResults();
  }, []);

  return { results, lastSpinResult, loading, spin, useResult, clearLastSpin, refetch: fetchResults };
}
