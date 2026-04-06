import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSubjectStore } from '../../store/subjectStore';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRESET_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4', '#a855f7', '#ec4899', '#84cc16'];
const PRESET_ICONS = ['book', 'calculator', 'flask', 'earth', 'music-note', 'weight-lifter', 'code-tags', 'pencil'];

export default function SubjectManageScreen() {
  const router = useRouter();
  const { subjects, create, remove } = useSubjectStore();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [icon, setIcon] = useState(PRESET_ICONS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { Alert.alert('エラー', '科目名を入力してください'); return; }
    setLoading(true);
    try {
      await create({ name: name.trim(), color, icon });
      setName('');
    } catch {
      Alert.alert('エラー', '科目の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string, subjectName: string) => {
    Alert.alert('削除確認', `「${subjectName}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      { text: '削除', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>科目管理</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        <TextInput
          label="科目名"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        <Text variant="labelMedium" style={styles.label}>カラー</Text>
        <View style={styles.colorRow}>
          {PRESET_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
        <Text variant="labelMedium" style={styles.label}>アイコン</Text>
        <View style={styles.iconRow}>
          {PRESET_ICONS.map((ic) => (
            <TouchableOpacity
              key={ic}
              style={[styles.iconCell, icon === ic && styles.iconCellSelected]}
              onPress={() => setIcon(ic)}
            >
              <MaterialCommunityIcons name={ic as any} size={20} color={icon === ic ? '#6366f1' : '#6b7280'} />
            </TouchableOpacity>
          ))}
        </View>
        <Button label="科目を追加" onPress={handleCreate} loading={loading} />
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Surface style={styles.row}>
            <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            <Text variant="bodyLarge" style={styles.subjectName}>{item.name}</Text>
            <Button
              label="削除"
              onPress={() => handleDelete(item.id, item.name)}
              mode="text"
              color="#ef4444"
            />
          </Surface>
        )}
        ListEmptyComponent={<EmptyState icon="book-outline" title="科目がありません" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  form: { padding: 16, gap: 8 },
  input: { backgroundColor: '#fff' },
  label: { color: '#374151', marginTop: 4 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  iconRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  iconCell: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  iconCellSelected: { backgroundColor: '#ede9fe' },
  list: { padding: 16, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#fff', gap: 10 },
  subjectDot: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { flex: 1, color: '#1f2937' },
});
