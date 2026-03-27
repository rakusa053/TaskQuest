import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useSubjectStore } from '../../store/subjectStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';

// react-native-calendars がなければシンプルな日付ピッカーで代替
export default function CalendarScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selected, setSelected] = useState(today);
  const { tasksByDate } = useCalendarData();
  const { subjects } = useSubjectStore();

  const dayTasks = tasksByDate[selected] ?? [];
  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  // 今週の日付を生成
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i);
    return d.toISOString().split('T')[0];
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>カレンダー</Text>
      </View>

      {/* 週表示 */}
      <View style={styles.weekRow}>
        {weekDays.map((date) => {
          const d = new Date(date);
          const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
          const isSelected = date === selected;
          const hasTasks = !!tasksByDate[date]?.length;
          return (
            <View
              key={date}
              style={[styles.dayCell, isSelected && styles.dayCellSelected]}
              onTouchEnd={() => setSelected(date)}
            >
              <Text style={[styles.dayLabel, isSelected && styles.dayLabelSelected]}>{dayLabel}</Text>
              <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                {d.getDate()}
              </Text>
              {hasTasks && <View style={[styles.dot, isSelected && styles.dotSelected]} />}
            </View>
          );
        })}
      </View>

      <Text variant="labelLarge" style={styles.dateLabel}>
        {new Date(selected).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
      </Text>

      <FlatList
        data={dayTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskCard task={item} subject={getSubject(item.subjectId)} />
        )}
        ListEmptyComponent={
          <EmptyState icon="calendar-blank" title="この日のタスクはありません" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 12, gap: 4 },
  dayCell: {
    flex: 1, alignItems: 'center', padding: 6, borderRadius: 12,
  },
  dayCellSelected: { backgroundColor: '#6366f1' },
  dayLabel: { fontSize: 11, color: '#9ca3af' },
  dayLabelSelected: { color: '#fff' },
  dayNum: { fontSize: 16, fontWeight: '600', color: '#374151' },
  dayNumSelected: { color: '#fff' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#6366f1', marginTop: 2 },
  dotSelected: { backgroundColor: '#fff' },
  dateLabel: { paddingHorizontal: 16, color: '#374151', marginBottom: 4 },
  list: { padding: 16 },
});
