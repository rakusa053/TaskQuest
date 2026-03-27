import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, loading, initialized, signIn, signUp, logout, init } = useAuthStore();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  return { user, loading, initialized, signIn, signUp, logout };
}
