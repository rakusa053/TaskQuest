import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface DayData {
  date: string;
  minutes: number;
}

interface Props {
  days: DayData[];
}

export function WeeklyBarChart({ days }: Props) {
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 1);

  return (
    <View style={styles.container}>
      {days.map((d) => {
        const label = new Date(d.date).toLocaleDateString('ja-JP', { weekday: 'short' });
        const height = Math.max((d.minutes / maxMinutes) * 120, d.minutes > 0 ? 4 : 0);
        const hours = d.minutes > 0 ? (d.minutes / 60).toFixed(1) : '';
        return (
          <View key={d.date} style={styles.col}>
            <Text style={styles.val}>{hours}</Text>
            <View style={styles.barWrap}>
              <View style={[styles.bar, { height }]} />
            </View>
            <Text style={styles.label}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4 },
  col: { flex: 1, alignItems: 'center', gap: 2 },
  barWrap: { width: '100%', height: 120, justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '70%', backgroundColor: '#6366f1', borderRadius: 4, minHeight: 0 },
  label: { fontSize: 11, color: '#9ca3af' },
  val: { fontSize: 10, color: '#6366f1', fontWeight: '600', height: 16 },
});
