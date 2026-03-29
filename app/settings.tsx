import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, Divider, List } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../store/settingsStore';
import { hasPin, savePin, clearPin } from '../lib/pinStorage';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, reminderHour, lockEnabled, loaded, load, setNotifications, setLockEnabled } =
    useSettingsStore();
  const [pinSet, setPinSet] = useState(false);

  useEffect(() => {
    load();
    hasPin().then(setPinSet);
  }, []);

  const handleSetPin = () => {
    Alert.prompt(
      'PINを設定',
      '4桁の数字を入力してください',
      async (pin) => {
        if (!pin || !/^\d{4}$/.test(pin)) {
          Alert.alert('エラー', '4桁の数字で入力してください');
          return;
        }
        await savePin(pin);
        setPinSet(true);
        Alert.alert('設定完了', 'PINを設定しました');
      },
      'plain-text'
    );
  };

  const handleClearPin = () => {
    Alert.alert('PIN削除', 'PINを削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive', onPress: async () => {
          await clearPin();
          setPinSet(false);
        }
      },
    ]);
  };

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
            title="緊急解除PIN"
            description={pinSet ? '設定済み' : '未設定'}
            right={() => (
              <Button
                label={pinSet ? '変更' : '設定'}
                onPress={handleSetPin}
                mode="outlined"
                style={styles.pinBtn}
              />
            )}
          />
          {pinSet && (
            <List.Item
              title="PINを削除"
              titleStyle={{ color: '#ef4444' }}
              onPress={handleClearPin}
            />
          )}
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
  pinBtn: { alignSelf: 'center' },
});
