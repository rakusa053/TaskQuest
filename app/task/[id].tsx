import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTaskStore } from '../../store/taskStore';
import { Button } from '../../components/ui/Button';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, update, remove } = useTaskStore();
  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title ?? '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority ?? 'medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(task?.estimatedMinutes ?? 30));
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await update(task.id, { title: title.trim(), priority, estimatedMinutes: parseInt(estimatedMinutes) || 30 });
      router.back();
    } catch {
      Alert.alert('エラー', '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('削除確認', 'このタスクを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: async () => { await remove(task.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="閉じる" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>タスク編集</Text>
        <Button label="保存" onPress={handleSave} loading={loading} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput label="タイトル" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />

        <Text variant="labelLarge" style={styles.label}>優先度</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={(v) => setPriority(v as any)}
          buttons={[{ value: 'low', label: '低' }, { value: 'medium', label: '中' }, { value: 'high', label: '高' }]}
        />

        <Text variant="labelLarge" style={styles.label}>予定時間（分）</Text>
        <TextInput
          value={estimatedMinutes}
          onChangeText={setEstimatedMinutes}
          keyboardType="number-pad"
          mode="outlined"
          style={styles.input}
        />

        <Button label="タスクを削除" onPress={handleDelete} mode="outlined" color="#ef4444" style={styles.deleteBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 4 },
  title: { fontWeight: '700', color: '#1f2937' },
  content: { padding: 16, gap: 12 },
  label: { color: '#374151', marginTop: 4 },
  input: { backgroundColor: '#fff' },
  deleteBtn: { marginTop: 16, borderColor: '#ef4444' },
});
