import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { registerBackgroundFetch } from '../lib/notifications';
import { useAppBlocker } from '../hooks/useAppBlocker';

const SETUP_DONE_KEY = 'taskqest_blocker_setup_done';

export default function RootLayout() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const { load: loadSettings } = useSettingsStore();
  const { theme, load: loadTheme } = useThemeStore();
  useAppBlocker();

  useEffect(() => {
    loadSettings();
    loadTheme();
    registerBackgroundFetch();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      // 初回ログイン時はロック設定画面へ、2回目以降はタブへ
      AsyncStorage.getItem(SETUP_DONE_KEY).then((done) => {
        if (!done) {
          AsyncStorage.setItem(SETUP_DONE_KEY, '1');
          router.replace('/(tabs)');
          setTimeout(() => router.push('/blocked-apps'), 300);
        } else {
          router.replace('/(tabs)');
        }
      });
    }
  }, [user, initialized, segments]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: theme.accentColor,
      secondary: theme.borderColor,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="task/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="gacha/index" options={{ presentation: 'modal' }} />
          <Stack.Screen name="gacha/use" options={{ presentation: 'modal' }} />
          <Stack.Screen name="shop/index" />
          <Stack.Screen name="boss/victory" options={{ presentation: 'modal' }} />
          <Stack.Screen name="lock" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="settings" />
          <Stack.Screen name="subject/manage" />
          <Stack.Screen name="party/manage" options={{ presentation: 'modal' }} />
          <Stack.Screen name="avatar" />
          <Stack.Screen name="blocked-apps" />
          <Stack.Screen name="note-check" options={{ presentation: 'modal' }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
