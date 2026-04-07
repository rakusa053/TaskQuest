import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTaskStore } from '../../store/taskStore';
import { useSubjectStore } from '../../store/subjectStore';
import { Button } from '../../components/ui/Button';
import { DatePickerField } from '../../components/ui/DatePickerField';

export default function NewTaskScreen() {
  const router = useRouter();
  const { create } = useTaskStore();
  const { subjects } = useSubjectStore();
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState('30');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) { Alert.alert('エラー', 'タイトルを入力してください'); return; }
    setLoading(true);
    try {
      await create({
        title: title.trim(),
        subjectId: subjectId || (subjects[0]?.id ?? ''),
        status: 'pending',
        priority,
        dueDate: dueDate ? dueDate.getTime() : null,
        estimatedMinutes: parseInt(estimatedMinutes) || 30,
        actualMinutes: 0,
        completedAt: null,
      });
      router.back();
    } catch {
      Alert.alert('エラー', 'タスクの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="キャンセル" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>新規タスク</Text>
        <Button label="作成" onPress={handleCreate} loading={loading} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="タイトル"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
        />

        <Text variant="labelLarge" style={styles.label}>優先度</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={(v) => setPriority(v as any)}
          buttons={[
            { value: 'low', label: '低' },
            { value: 'medium', label: '中' },
            { value: 'high', label: '高' },
          ]}
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
        <DatePickerField value={dueDate} onChange={setDueDate} />

        {subjects.length > 0 && (
          <>
            <Text variant="labelLarge" style={styles.label}>科目</Text>
            <SegmentedButtons
              value={subjectId || subjects[0]?.id}
              onValueChange={setSubjectId}
              buttons={subjects.slice(0, 4).map((s) => ({ value: s.id, label: s.name }))}
            />
          </>
        )}
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
});
