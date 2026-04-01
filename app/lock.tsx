import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';

export default function LockScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text variant="headlineMedium" style={styles.title}>フォーカスモード</Text>
        <Text variant="bodyMedium" style={styles.sub}>
          タスクに集中しましょう
        </Text>
        <Button
          label="タスク画面に戻る"
          onPress={() => router.replace('/')}
          mode="contained"
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f2937' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 24 },
  emoji: { fontSize: 56 },
  title: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  sub: { color: '#9ca3af', textAlign: 'center' },
  btn: { marginTop: 8 },
});
