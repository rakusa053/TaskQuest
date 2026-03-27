import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { CartesianChart, Bar } from 'victory-native';
import { useStats } from '../../hooks/useStats';
import { useProfileStore } from '../../store/profileStore';
import { StreakDisplay } from '../../components/stats/StreakDisplay';
import { XPBar } from '../../components/gamification/XPBar';
import { CoinDisplay } from '../../components/gamification/CoinDisplay';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
  const { weekly, streak } = useStats();
  const { profile } = useProfileStore();

  const chartData = weekly?.days.map((d, i) => ({
    day: new Date(d.date).toLocaleDateString('ja-JP', { weekday: 'short' }),
    hours: Math.round((d.minutes / 60) * 10) / 10,
    index: i,
  })) ?? [];

  const hasData = chartData.some((d) => d.hours > 0);

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
            {hasData ? (
              <View style={{ height: 180, width: width - 64 }}>
                <CartesianChart
                  data={chartData}
                  xKey="day"
                  yKeys={['hours']}
                  domainPadding={{ left: 20, right: 20 }}
                >
                  {({ points, chartBounds }) => (
                    <Bar
                      points={points.hours}
                      chartBounds={chartBounds}
                      color="#6366f1"
                      roundedCorners={{ topLeft: 4, topRight: 4 }}
                    />
                  )}
                </CartesianChart>
              </View>
            ) : (
              <Text style={styles.noData}>今週の学習記録はまだありません</Text>
            )}
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text variant="headlineMedium" style={styles.statNum}>
                  {Math.round((weekly.totalMinutes / 60) * 10) / 10}h
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
