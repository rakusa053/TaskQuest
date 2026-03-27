import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';

export default function LockScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text variant="headlineMedium" style={styles.title}>アプリロック中</Text>
        <Text variant="bodyMedium" style={styles.sub}>
          タスクを完了してガチャを引き、アプリを解放しましょう
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f2937' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emoji: { fontSize: 64 },
  title: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  sub: { color: '#9ca3af', textAlign: 'center' },
});
