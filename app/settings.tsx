import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, Divider, List, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettingsStore } from '../store/settingsStore';
import { useTaskStore } from '../store/taskStore';
import { useThemeStore, PRESET_THEMES } from '../store/themeStore';
import { Button } from '../components/ui/Button';

export default function SettingsScreen() {
  const router = useRouter();
  const { notificationsEnabled, reminderHour, lockEnabled, load, setNotifications, setLockEnabled } =
    useSettingsStore();
  const { tasks, fetch } = useTaskStore();
  const { activeThemeId, unlockedThemeIds, applyTheme, load: loadTheme } = useThemeStore();

  useEffect(() => {
    load();
    fetch();
    loadTheme();
  }, []);

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

        {Platform.OS !== 'web' && (
          <>
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
          </>
        )}

        <List.Section>
          <List.Subheader>テーマ</List.Subheader>
          <View style={styles.themeGrid}>
            {PRESET_THEMES.map((t) => {
              const unlocked = unlockedThemeIds.includes(t.id);
              const active = activeThemeId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.themeCard, active && styles.themeCardActive]}
                  onPress={() => unlocked ? applyTheme(t.id) : null}
                  activeOpacity={unlocked ? 0.7 : 1}
                >
                  <View style={[styles.themeIcon, { backgroundColor: t.bgColor, borderColor: t.borderColor }]}>
                    <MaterialCommunityIcons name="palette" size={24} color={t.accentColor} />
                  </View>
                  <Text variant="labelSmall" style={[styles.themeName, !unlocked && styles.themeNameLocked]}>
                    {t.name}
                  </Text>
                  {!unlocked && (
                    <MaterialCommunityIcons name="lock" size={12} color="#9ca3af" style={styles.lockIcon} />
                  )}
                  {active && (
                    <MaterialCommunityIcons name="check-circle" size={14} color={t.accentColor} style={styles.lockIcon} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <Text variant="labelSmall" style={styles.themeHint}>
            ロックされたテーマはショップで購入できます
          </Text>
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>アカウント</List.Subheader>
          <List.Item
            title="ニックネーム変更"
            description="SNS・プロフィールの表示名を変更"
            onPress={() => router.push('/edit-name')}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
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
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  themeCard: {
    width: 72, alignItems: 'center', gap: 4, padding: 8,
    borderRadius: 12, borderWidth: 2, borderColor: 'transparent',
  },
  themeCardActive: { borderColor: '#6366f1', backgroundColor: '#f5f3ff' },
  themeIcon: { width: 44, height: 44, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  themeName: { color: '#374151', textAlign: 'center' },
  themeNameLocked: { color: '#9ca3af' },
  lockIcon: { position: 'absolute', top: 6, right: 6 },
  themeHint: { color: '#9ca3af', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
});
