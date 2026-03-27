import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTasks } from '../../hooks/useTasks';
import { useSubjectStore } from '../../store/subjectStore';
import { useProfileStore } from '../../store/profileStore';
import { TaskCard } from '../../components/tasks/TaskCard';
import { TaskFilterBar } from '../../components/tasks/TaskFilterBar';
import { LevelUpModal } from '../../components/gamification/LevelUpModal';
import { XPPopup } from '../../components/gamification/XPPopup';
import { Snackbar } from '../../components/ui/Snackbar';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Task } from '../../types';

export default function TasksScreen() {
  const router = useRouter();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ xp: number; money: number; damage: number } | null>(null);
  const [snackbar, setSnackbar] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { subjects } = useSubjectStore();
  const { tasks, loading, completeTask, fetch } = useTasks();
  const { lastLevelUp, clearLevelUp } = useProfileStore();

  const filtered = tasks.filter((t) => {
    if (selectedStatus && t.status !== selectedStatus) return false;
    if (selectedSubjectId && t.subjectId !== selectedSubjectId) return false;
    return true;
  });

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  const handleComplete = async (task: Task) => {
    try {
      const result = await completeTask(task, task.estimatedMinutes);
      setPopup({
        xp: result.xpResult.xp,
        money: result.xpResult.money,
        damage: result.bossResult.damage,
      });
      setSnackbar({ msg: `タスク完了！${result.isOnTime ? ' 期限内ボーナス獲得！' : ''}`, type: 'success' });
    } catch {
      setSnackbar({ msg: '完了処理に失敗しました', type: 'error' });
    }
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            subject={getSubject(item.subjectId)}
            onPress={() => router.push(`/task/${item.id}`)}
            onComplete={() => handleComplete(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="checkbox-marked-circle-outline"
              title="タスクがありません"
              description="右下の＋ボタンからタスクを追加しましょう"
            />
          ) : null
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/task/new')}
        color="#fff"
      />

      {popup && (
        <XPPopup
          xp={popup.xp}
          money={popup.money}
          damage={popup.damage}
          visible={!!popup}
          onHide={() => setPopup(null)}
        />
      )}

      <LevelUpModal level={lastLevelUp} onClose={clearLevelUp} />
      <Snackbar message={snackbar?.msg ?? null} type={snackbar?.type} onDismiss={() => setSnackbar(null)} />
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
