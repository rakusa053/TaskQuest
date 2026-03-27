import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuth } from '../hooks/useAuth';

export default function RootLayout() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!user && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, initialized, segments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
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
        </Stack>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
