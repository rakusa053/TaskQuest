import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Task, Subject } from '../../types';

const PRIORITY_COLOR = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };
const PRIORITY_LABEL = { low: '低', medium: '中', high: '高' };

interface Props {
  task: Task;
  subject?: Subject;
  onPress?: () => void;
  onComplete?: () => void;
}

export function TaskCard({ task, subject, onPress, onComplete }: Props) {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.dueDate && !isCompleted && Date.now() > task.dueDate;
  const dueStr = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    : null;

  return (
    <TouchableOpacity style={[styles.card, isCompleted && styles.completedCard]} onPress={onPress} activeOpacity={0.8}>
      <TouchableOpacity
        style={[styles.checkBtn, isCompleted && styles.checkBtnDone]}
        onPress={onComplete}
        disabled={isCompleted}
      >
        {isCompleted && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          variant="bodyLarge"
          style={[styles.title, isCompleted && styles.completedText]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {subject && (
            <View style={[styles.subjectDot, { backgroundColor: subject.color }]} />
          )}
          {subject && (
            <Text variant="labelSmall" style={{ color: subject.color }}>{subject.name}</Text>
          )}
          <View style={[styles.priorityChip, { backgroundColor: PRIORITY_COLOR[task.priority] + '22' }]}>
            <Text style={[styles.priorityText, { color: PRIORITY_COLOR[task.priority] }]}>
              {PRIORITY_LABEL[task.priority]}
            </Text>
          </View>
          {dueStr && (
            <Text variant="labelSmall" style={[styles.due, isOverdue ? styles.overdue : null]}>
              {dueStr}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginVertical: 4, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  completedCard: { opacity: 0.6 },
  checkBtn: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: '#6366f1', alignItems: 'center', justifyContent: 'center',
  },
  checkBtnDone: { backgroundColor: '#6366f1', borderColor: '#6366f1' },
  content: { flex: 1, gap: 6 },
  title: { color: '#111827', fontWeight: '600' },
  completedText: { textDecorationLine: 'line-through', color: '#9ca3af' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  subjectDot: { width: 8, height: 8, borderRadius: 4 },
  priorityChip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  due: { fontSize: 11, color: '#6b7280' },
  overdue: { color: '#ef4444' },
});
