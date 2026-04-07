import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, SegmentedButtons, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!task) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await update(task.id, {
        title: title.trim(),
        priority,
        estimatedMinutes: parseInt(estimatedMinutes) || 30,
        dueDate: dueDate ? dueDate.getTime() : null,
      });
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

  const formatDate = (date: Date) =>
    `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

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

        <Text variant="labelLarge" style={styles.label}>期限日</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)}>
          <Surface style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar" size={20} color="#6366f1" />
            <Text style={[styles.dateText, !dueDate && styles.datePlaceholder]}>
              {dueDate ? formatDate(dueDate) : '期限日を設定'}
            </Text>
            {dueDate && (
              <TouchableOpacity onPress={() => setDueDate(null)} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </Surface>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => {
              setShowPicker(Platform.OS === 'ios');
              if (date) setDueDate(date);
            }}
          />
        )}

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
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#fff' },
  dateText: { flex: 1, fontSize: 15, color: '#1f2937' },
  datePlaceholder: { color: '#9ca3af' },
  deleteBtn: { marginTop: 16, borderColor: '#ef4444' },
});
