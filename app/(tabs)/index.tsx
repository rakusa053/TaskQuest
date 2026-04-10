import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB, Surface } from 'react-native-paper';
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
import { getUnlockExpiry } from 'app-blocker';
import type { Task } from '../../types';

function useUnlockCountdown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const update = () => {
      const expiry = getUnlockExpiry();
      setRemaining(Math.max(0, expiry - Date.now()));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);
  return remaining;
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}時間${m}分${s}秒`;
  if (m > 0) return `${m}分${s}秒`;
  return `${s}秒`;
}

export default function TasksScreen() {
  const router = useRouter();
  const unlockRemaining = useUnlockCountdown();
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
      router.push(`/note-check?taskId=${task.id}`);
    } catch {
      setSnackbar({ msg: '完了処理に失敗しました', type: 'error' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>タスク</Text>
      </View>

      {unlockRemaining > 0 && (
        <Surface style={styles.unlockBanner}>
          <Text style={styles.unlockEmoji}>🔓</Text>
          <View style={styles.unlockText}>
            <Text variant="labelMedium" style={styles.unlockLabel}>アプリ解放中</Text>
            <Text variant="titleSmall" style={styles.unlockTimer}>{formatCountdown(unlockRemaining)}</Text>
          </View>
        </Surface>
      )}

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

      {lastLevelUp !== null && <LevelUpModal level={lastLevelUp} onClose={clearLevelUp} />}
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
  unlockBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 8, borderRadius: 12,
    padding: 12, backgroundColor: '#dcfce7',
  },
  unlockEmoji: { fontSize: 22 },
  unlockText: { flex: 1 },
  unlockLabel: { color: '#15803d', fontWeight: '600' },
  unlockTimer: { color: '#166534', fontWeight: '700' },
});
