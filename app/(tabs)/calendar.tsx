import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Calendar } from 'react-native-calendars';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useSubjectStore } from '../../store/subjectStore';
import { useTaskStore } from '../../store/taskStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { EmptyState } from '../../components/ui/EmptyState';

function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const today = toLocalDateString(new Date());
  const [selected, setSelected] = useState(today);
  const { fetch } = useTaskStore();

  useEffect(() => { fetch(); }, []);
  const { markedDates, tasksByDate } = useCalendarData();
  const { subjects } = useSubjectStore();

  const dayTasks = tasksByDate[selected] ?? [];
  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  const combinedMarks = {
    ...markedDates,
    [selected]: {
      ...(markedDates[selected] ?? {}),
      selected: true,
      selectedColor: '#6366f1',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>カレンダー</Text>
      </View>

      <Calendar
        current={today}
        onDayPress={(day: { dateString: string }) => setSelected(day.dateString)}
        markedDates={combinedMarks}
        markingType="multi-dot"
        theme={{
          selectedDayBackgroundColor: '#6366f1',
          todayTextColor: '#6366f1',
          arrowColor: '#6366f1',
          dotColor: '#6366f1',
        }}
        style={styles.calendar}
      />

      <View style={styles.listHeader}>
        <Text variant="labelLarge" style={styles.dateLabel}>
          {new Date(selected).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
        </Text>
        <Text variant="labelSmall" style={styles.taskCount}>{dayTasks.length}件</Text>
      </View>

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
  calendar: { margin: 8, borderRadius: 16, overflow: 'hidden' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 4 },
  dateLabel: { color: '#374151' },
  taskCount: { color: '#9ca3af' },
  list: { padding: 16 },
});
