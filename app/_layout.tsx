import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// TODO: Firebase Auth 実装後に authStore から取得
const useAuth = () => ({ user: null, isLoading: false });

export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="task/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="gacha" options={{ presentation: 'modal' }} />
          <Stack.Screen name="shop" />
          <Stack.Screen name="boss/victory" options={{ presentation: 'modal' }} />
          <Stack.Screen name="lock" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
