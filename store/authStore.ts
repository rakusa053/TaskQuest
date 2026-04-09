import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { profileApi } from '../api/profileApi';
import { useProfileStore } from './profileStore';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true });
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const profile = await profileApi.init({ displayName });
      // 初期化完了後にプロフィールをストアに反映（タブ遷移との競合を防ぐ）
      useProfileStore.setState({ profile });
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, initialized: true });
    });
    return unsubscribe;
  },
}));
