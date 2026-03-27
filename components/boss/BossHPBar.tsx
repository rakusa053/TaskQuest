import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import type { Boss } from '../../types';

interface Props {
  boss: Boss;
}

export function BossHPBar({ boss }: Props) {
  const progress = boss.maxHp > 0 ? boss.hp / boss.maxHp : 0;
  const hpColor = progress > 0.5 ? '#22c55e' : progress > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text variant="titleLarge" style={styles.name}>{boss.name}</Text>
        <Text variant="labelMedium" style={styles.level}>Lv.{boss.level}</Text>
      </View>
      <ProgressBar progress={progress} color={hpColor} style={styles.bar} />
      <View style={styles.hpRow}>
        <Text variant="labelSmall" style={styles.hpText}>
          HP: {boss.hp.toLocaleString()} / {boss.maxHp.toLocaleString()}
        </Text>
        <Text variant="labelSmall" style={styles.hpText}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#1f2937', fontWeight: '700' },
  level: { color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  bar: { height: 12, borderRadius: 6 },
  hpRow: { flexDirection: 'row', justifyContent: 'space-between' },
  hpText: { color: '#9ca3af' },
});
