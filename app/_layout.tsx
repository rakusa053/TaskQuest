import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';
import { useThemeStore } from '../store/themeStore';
import { registerBackgroundFetch } from '../lib/notifications';
import { useAppBlocker } from '../hooks/useAppBlocker';

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
      // Web はアプリブロック機能非対応なのでタブへ直接遷移
      router.replace(Platform.OS === 'android' ? '/blocked-apps' : '/(tabs)');
    }
  }, [user, initialized, segments]);

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
        {!initialized && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
