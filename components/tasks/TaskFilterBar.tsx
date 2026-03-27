import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import type { Subject } from '../../types';

interface Props {
  subjects: Subject[];
  selectedSubjectId: string | null;
  selectedStatus: string | null;
  onSubjectChange: (id: string | null) => void;
  onStatusChange: (status: string | null) => void;
}

const STATUS_OPTIONS = [
  { label: 'すべて', value: null },
  { label: '未完了', value: 'pending' },
  { label: '進行中', value: 'in_progress' },
  { label: '完了', value: 'completed' },
];

export function TaskFilterBar({ subjects, selectedSubjectId, selectedStatus, onSubjectChange, onStatusChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll} contentContainerStyle={styles.content}>
      {STATUS_OPTIONS.map((opt) => (
        <Chip
          key={opt.value ?? 'all'}
          selected={selectedStatus === opt.value}
          onPress={() => onStatusChange(opt.value)}
          style={styles.chip}
          compact
        >
          {opt.label}
        </Chip>
      ))}
      {subjects.map((s) => (
        <Chip
          key={s.id}
          selected={selectedSubjectId === s.id}
          onPress={() => onSubjectChange(selectedSubjectId === s.id ? null : s.id)}
          style={[styles.chip, { borderColor: s.color }]}
          selectedColor={s.color}
          compact
        >
          {s.name}
        </Chip>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  content: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: { marginRight: 2 },
});
