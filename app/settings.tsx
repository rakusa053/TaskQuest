import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, Divider, List, Surface, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useTaskStore } from '../store/taskStore';
import { useProfileStore } from '../store/profileStore';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, reminderHour, lockEnabled, load, setNotifications, setLockEnabled } =
    useSettingsStore();
  const { tasks, fetch } = useTaskStore();
  const { profile, update } = useProfileStore();
  const [displayName, setDisplayName] = useState('');
  const [nameLoading, setNameLoading] = useState(false);

  useEffect(() => {
    load();
    fetch();
  }, []);

  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile?.displayName]);

  const handleSaveName = async () => {
    if (!displayName.trim()) { Alert.alert('エラー', 'ニックネームを入力してください'); return; }
    setNameLoading(true);
    try {
      await update({ displayName: displayName.trim() });
      Alert.alert('保存しました');
    } catch {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setNameLoading(false);
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCompletedCount = tasks.filter(
    (t) => t.status === 'completed' && t.completedAt !== null && t.completedAt >= todayStart.getTime()
  ).length;
  const snsUnlocked = todayCompletedCount >= 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>設定</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        <Surface style={styles.todayCard}>
          <View style={styles.todayRow}>
            <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={28} color="#6366f1" />
            <View style={styles.todayText}>
              <Text variant="titleMedium" style={styles.todayCount}>今日の完了タスク: {todayCompletedCount}件</Text>
              <Text variant="labelSmall" style={styles.todaySub}>
                {snsUnlocked ? '✅ SNS 解放済み' : '🔒 SNS はタスクを1件完了すると解放されます'}
              </Text>
            </View>
          </View>
        </Surface>

        <List.Section>
          <List.Subheader>通知</List.Subheader>
          <List.Item
            title="デイリーリマインド"
            description={`毎日 ${String(reminderHour).padStart(2, '0')}:00 に通知`}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotifications}
                color="#6366f1"
              />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>フォーカスモード（アプリロック）</List.Subheader>
          <List.Item
            title="フォーカスモード"
            description="タスク完了でガチャ報酬を使い特定アプリを解放できます"
            right={() => (
              <Switch
                value={lockEnabled}
                onValueChange={setLockEnabled}
                color="#6366f1"
              />
            )}
          />
          <List.Item
            title="ブロックするアプリを選択"
            description="フォーカスモード中に開けなくするアプリを設定"
            onPress={() => router.push('/blocked-apps')}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>アカウント</List.Subheader>
          <View style={styles.nameSection}>
            <TextInput
              label="ニックネーム"
              value={displayName}
              onChangeText={setDisplayName}
              mode="outlined"
              style={styles.nameInput}
            />
            <Button label="保存" onPress={handleSaveName} loading={nameLoading} style={styles.nameBtn} />
          </View>
          <List.Item
            title="科目管理"
            onPress={() => router.push('/subject/manage')}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  todayCard: { margin: 16, borderRadius: 16, padding: 16, backgroundColor: '#fff' },
  todayRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayText: { flex: 1 },
  todayCount: { color: '#1f2937', fontWeight: '700' },
  todaySub: { color: '#6b7280', marginTop: 2 },
  nameSection: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: { flex: 1, backgroundColor: '#fff' },
  nameBtn: { marginTop: 6 },
});
