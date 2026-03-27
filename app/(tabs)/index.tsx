import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTasks } from '../../hooks/useTasks';
import { useSubjectStore } from '../../store/subjectStore';
import { useProfileStore } from '../../store/profileStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskFilterBar } from '../../components/tasks/TaskFilterBar';
import { LevelUpModal } from '../../components/gamification/LevelUpModal';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Task } from '../../types';

export default function TasksScreen() {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { subjects } = useSubjectStore();
  const { tasks, loading, completeTask } = useTasks();
  const { lastLevelUp, clearLevelUp } = useProfileStore();

  const filtered = tasks.filter((t) => {
    if (selectedStatus && t.status !== selectedStatus) return false;
    if (selectedSubjectId && t.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  const handleComplete = async (task: Task) => {
    Alert.alert('タスク完了', `「${task.title}」を完了しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '完了', onPress: async () => {
          try {
            const result = await completeTask(task, task.estimatedMinutes);
            Alert.alert(
              'タスク完了！',
              `+${result.xpResult.profile.xp - (result.xpResult.profile.xp)}XP\n` +
              `ボスに${result.bossResult.damage}ダメージ！`
            );
          } catch {
            Alert.alert('エラー', '完了処理に失敗しました');
          }
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>タスク</Text>
      </View>

      <TaskFilterBar
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        selectedStatus={selectedStatus}
        onSubjectChange={setSelectedSubjectId}
        onStatusChange={setSelectedStatus}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            subject={getSubject(item.subjectId)}
            onPress={() => router.push(`/task/${item.id}`)}
            onComplete={() => handleComplete(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="checkbox-marked-circle-outline"
            title="タスクがありません"
            description="右下の＋ボタンからタスクを追加しましょう"
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/task/new')}
        color="#fff"
      />

      <LevelUpModal level={lastLevelUp} onClose={clearLevelUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#6366f1' },
});
