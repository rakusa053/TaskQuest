import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';

export default function BlockedAppsScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>ブロックするアプリ</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.body}>
        <Text variant="bodyMedium" style={styles.msg}>
          アプリブロック機能は Android アプリ版のみ対応しています。
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  msg: { color: '#6b7280', textAlign: 'center' },
});
