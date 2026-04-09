import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, SegmentedButtons, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useBoss } from '../../hooks/useBoss';
import { useParty } from '../../hooks/useParty';
import { useProfileStore } from '../../store/profileStore';
import { BossHPBar } from '../../components/boss/BossHPBar';
import { DamageLog } from '../../components/boss/DamageLog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Snackbar } from '../../components/ui/Snackbar';

export default function BossScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('global');
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');

  const { globalBoss, logs, loading, lastDefeat, clearDefeat, refetch } = useBoss();
  const { party, partyBoss, create: createParty, leave: leaveParty, refetch: refetchParty } = useParty();
  const { profile } = useProfileStore();

  const endsAt = globalBoss?.endsAt
    ? new Date(globalBoss.endsAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    : '';

  // ボス討伐演出
  if (lastDefeat) {
    return (
      <SafeAreaView style={styles.victory}>
        <View style={styles.victoryContent}>
          <Text style={styles.victoryEmoji}>🎉</Text>
          <Text variant="headlineMedium" style={styles.victoryTitle}>ボス討伐成功！</Text>
          <Text variant="titleLarge" style={styles.bossName}>{lastDefeat.name}</Text>
          <Text variant="bodyMedium" style={styles.victoryDesc}>
            参加者全員にマネーとガチャチケットが配布されました
          </Text>
          <Button label="閉じる" onPress={() => { clearDefeat(); refetch(); }} style={styles.victoryBtn} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>ボス戦</Text>
      </View>

      <SegmentedButtons
        value={tab}
        onValueChange={setTab}
        style={styles.tabs}
        buttons={[
          { value: 'global', label: 'グローバル' },
          { value: 'party', label: 'パーティ' },
        ]}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {tab === 'global' ? (
          <>
            {globalBoss ? (
              <Surface style={styles.card}>
                <BossHPBar boss={globalBoss} />
                {endsAt && (
                  <Text variant="labelSmall" style={styles.deadline}>週次リセット: {endsAt}</Text>
                )}
                <Text variant="labelSmall" style={styles.hint}>
                  タスクを完了するとボスにダメージを与えます
                </Text>
              </Surface>
            ) : (
              <Surface style={styles.card}>
                <EmptyState icon="sword" title="ボスを読み込み中..." />
              </Surface>
            )}

            {logs.length > 0 && (
              <Surface style={styles.card}>
                <Text variant="titleSmall" style={styles.sectionTitle}>最近のダメージログ</Text>
                <DamageLog logs={logs} />
              </Surface>
            )}
          </>
        ) : (
          <>
            {party ? (
              <>
                <Surface style={styles.card}>
                  <View style={styles.partyHeader}>
                    <Text variant="titleMedium" style={styles.partyName}>{party.name}</Text>
                    <Text variant="labelSmall" style={styles.partyInfo}>
                      {party.memberIds.length}/5人
                    </Text>
                  </View>
                  <View style={styles.inviteBox}>
                    <Text variant="labelSmall" style={styles.inviteLabel}>招待コード</Text>
                    <Text variant="titleLarge" style={styles.inviteCode}>{party.inviteCode}</Text>
                  </View>
                </Surface>

                {partyBoss && (
                  <Surface style={styles.card}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>パーティボス</Text>
                    <BossHPBar boss={partyBoss} />
                  </Surface>
                )}

                <Button
                  label="パーティを管理"
                  onPress={() => router.push('/party/manage')}
                  mode="outlined"
                />
                <Button
                  label="脱退"
                  onPress={() => Alert.alert('脱退確認', 'パーティを脱退しますか？', [
                    { text: 'キャンセル', style: 'cancel' },
                    { text: '脱退', style: 'destructive', onPress: async () => { await leaveParty(); refetchParty(); } },
                  ])}
                  mode="outlined"
                  color="#ef4444"
                />
              </>
            ) : (
              <Surface style={styles.card}>
                <EmptyState
                  icon="account-group"
                  title="パーティに参加していません"
                  description="パーティを作成するか、招待コードで参加しましょう"
                />
                <View style={styles.partyActions}>
                  <Button
                    label="パーティを作成"
                    onPress={async () => {
                      try {
                        await createParty();
                        setSnackbar('パーティを作成しました！');
                      } catch {
                        setSnackbar('作成に失敗しました');
                      }
                    }}
                  />
                  <Button
                    label="招待コードで参加"
                    onPress={() => router.push('/party/manage')}
                    mode="outlined"
                  />
                  <Button
                    label="再読み込み"
                    onPress={refetchParty}
                    mode="text"
                  />
                </View>
              </Surface>
            )}
          </>
        )}
      </ScrollView>

      <Snackbar
        message={snackbar}
        type="success"
        onDismiss={() => setSnackbar(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  victory: { flex: 1, backgroundColor: '#1f2937' },
  victoryContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  victoryEmoji: { fontSize: 72 },
  victoryTitle: { color: '#fbbf24', fontWeight: '700', textAlign: 'center' },
  bossName: { color: '#fff', textAlign: 'center' },
  victoryDesc: { color: '#d1d5db', textAlign: 'center' },
  victoryBtn: { marginTop: 16 },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  tabs: { marginHorizontal: 16, marginTop: 8 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff', gap: 8 },
  deadline: { color: '#9ca3af' },
  hint: { color: '#a5b4fc' },
  sectionTitle: { color: '#374151', fontWeight: '700' },
  partyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partyName: { color: '#1f2937', fontWeight: '700' },
  partyInfo: { color: '#6b7280', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  inviteBox: { backgroundColor: '#f5f3ff', borderRadius: 12, padding: 12, alignItems: 'center', gap: 2 },
  inviteLabel: { color: '#6b7280' },
  inviteCode: { color: '#6366f1', fontWeight: '700', letterSpacing: 4 },
  partyActions: { gap: 8, marginTop: 4 },
});
