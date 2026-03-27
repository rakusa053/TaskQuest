import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  streak: number;
  longestStreak: number;
}

export function StreakDisplay({ streak, longestStreak }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <MaterialCommunityIcons name="fire" size={28} color="#f97316" />
        <Text variant="headlineMedium" style={styles.count}>{streak}</Text>
        <Text variant="labelSmall" style={styles.label}>現在のストリーク</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.item}>
        <MaterialCommunityIcons name="trophy" size={28} color="#f59e0b" />
        <Text variant="headlineMedium" style={styles.count}>{longestStreak}</Text>
        <Text variant="labelSmall" style={styles.label}>最長記録</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 60, backgroundColor: '#e5e7eb' },
  count: { fontWeight: '700', color: '#1f2937' },
  label: { color: '#9ca3af' },
});
