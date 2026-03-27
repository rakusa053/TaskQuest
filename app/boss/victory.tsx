import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';

export default function BossVictoryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text variant="headlineMedium" style={styles.title}>ボス討伐成功！</Text>
        <Text variant="bodyMedium" style={styles.sub}>
          参加者全員にマネーとガチャチケットが配布されました
        </Text>
        <Button label="閉じる" onPress={() => router.back()} style={styles.btn} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f2937' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emoji: { fontSize: 80 },
  title: { color: '#fbbf24', fontWeight: '700', textAlign: 'center' },
  sub: { color: '#d1d5db', textAlign: 'center' },
  btn: { marginTop: 16 },
});
