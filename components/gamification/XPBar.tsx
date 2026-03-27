import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';

const XP_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2700, 3500, 4500];

function getLevelProgress(level: number, xp: number) {
  const current = XP_THRESHOLDS[level - 1] ?? 0;
  const next = XP_THRESHOLDS[level] ?? current + 1000 * level;
  return { current, next, progress: Math.min((xp - current) / (next - current), 1) };
}

interface Props {
  level: number;
  xp: number;
}

export function XPBar({ level, xp }: Props) {
  const { next, progress } = getLevelProgress(level, xp);
  const needed = next - xp;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text variant="labelMedium" style={styles.label}>Lv.{level}</Text>
        <Text variant="labelSmall" style={styles.sub}>あと {needed} XP</Text>
      </View>
      <ProgressBar progress={progress} color="#6366f1" style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#6366f1', fontWeight: '700' },
  sub: { color: '#9ca3af' },
  bar: { height: 8, borderRadius: 4, backgroundColor: '#e0e7ff' },
});
