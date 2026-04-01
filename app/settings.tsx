import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, reminderHour, lockEnabled, load, setNotifications, setLockEnabled } =
    useSettingsStore();

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>設定</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
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
});
