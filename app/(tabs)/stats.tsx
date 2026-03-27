import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis } from 'victory-native';
import { useStats } from '../../hooks/useStats';
import { useProfileStore } from '../../store/profileStore';
import { StreakDisplay } from '../../components/stats/StreakDisplay';
import { XPBar } from '../../components/gamification/XPBar';
import { CoinDisplay } from '../../components/gamification/CoinDisplay';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { weekly, streak } = useStats();
  const { profile } = useProfileStore();

  const chartData = weekly?.days.map((d) => ({
    x: new Date(d.date).toLocaleDateString('ja-JP', { weekday: 'short' }),
    y: Math.round(d.minutes / 60 * 10) / 10,
  })) ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>統計</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {profile && (
          <Surface style={styles.card}>
            <Text variant="titleSmall" style={styles.sectionTitle}>レベル・XP</Text>
            <XPBar level={profile.level} xp={profile.xp} />
            <View style={styles.row}>
              <CoinDisplay amount={profile.money} />
              <Text variant="labelSmall" style={styles.sub}>🎫 ガチャ x{profile.gachaTickets}</Text>
            </View>
          </Surface>
        )}

        {streak && (
          <Surface style={styles.card}>
            <Text variant="titleSmall" style={styles.sectionTitle}>ストリーク</Text>
            <StreakDisplay streak={streak.current} longestStreak={streak.longest} />
          </Surface>
        )}

        {weekly && (
          <Surface style={styles.card}>
            <Text variant="titleSmall" style={styles.sectionTitle}>今週の学習時間（時間）</Text>
            {chartData.some((d) => d.y > 0) ? (
              <VictoryChart
                theme={VictoryTheme.material}
                width={width - 64}
                height={180}
                padding={{ top: 10, bottom: 30, left: 30, right: 10 }}
              >
                <VictoryAxis style={{ tickLabels: { fontSize: 11, fill: '#9ca3af' } }} />
                <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 11, fill: '#9ca3af' } }} />
                <VictoryBar
                  data={chartData}
                  style={{ data: { fill: '#6366f1', borderRadius: 4 } }}
                  cornerRadius={{ top: 4 }}
                />
              </VictoryChart>
            ) : (
              <Text style={styles.noData}>今週の学習記録はまだありません</Text>
            )}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNum}>
                  {Math.round(weekly.totalMinutes / 60 * 10) / 10}h
                </Text>
                <Text variant="labelSmall" style={styles.sub}>総学習時間</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNum}>
                  {weekly.completedTasks}
                </Text>
                <Text variant="labelSmall" style={styles.sub}>完了タスク</Text>
              </View>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNum}>
                  {profile?.totalXp ?? 0}
                </Text>
                <Text variant="labelSmall" style={styles.sub}>累計XP</Text>
              </View>
            </View>
          </Surface>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff', gap: 12 },
  sectionTitle: { color: '#374151', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sub: { color: '#9ca3af' },
  noData: { color: '#d1d5db', textAlign: 'center', paddingVertical: 16 },
  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statNum: { color: '#6366f1', fontWeight: '700' },
});
