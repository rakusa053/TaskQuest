import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, SegmentedButtons, Surface } from 'react-native-paper';
import { useBoss } from '../../hooks/useBoss';
import { useParty } from '../../hooks/useParty';
import { useProfileStore } from '../../store/profileStore';
import { BossHPBar } from '../../components/boss/BossHPBar';
import { DamageLog } from '../../components/boss/DamageLog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export default function BossScreen() {
  const [tab, setTab] = useState('global');
  const { globalBoss, logs, loading } = useBoss();
  const { party, partyBoss, create: createParty, join: joinParty, leave: leaveParty } = useParty();
  const { profile } = useProfileStore();

  const endsAt = globalBoss?.endsAt
    ? new Date(globalBoss.endsAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
    : '';

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
                  <Text variant="labelSmall" style={styles.deadline}>リセット: {endsAt}</Text>
                )}
              </Surface>
            ) : (
              <EmptyState icon="sword" title="ボスを読み込み中..." />
            )}

            {logs.length > 0 && (
              <Surface style={styles.card}>
                <Text variant="titleSmall" style={styles.sectionTitle}>ダメージログ</Text>
                <DamageLog logs={logs} />
              </Surface>
            )}
          </>
        ) : (
          <>
            {party ? (
              <>
                <Surface style={styles.card}>
                  <Text variant="titleMedium" style={styles.partyName}>{party.name}</Text>
                  <Text variant="labelSmall" style={styles.partyInfo}>
                    メンバー: {party.memberIds.length}/5 | 招待コード: {party.inviteCode}
                  </Text>
                </Surface>
                {partyBoss && (
                  <Surface style={styles.card}>
                    <BossHPBar boss={partyBoss} />
                  </Surface>
                )}
                <Button label="パーティを脱退" onPress={leaveParty} mode="outlined" />
              </>
            ) : (
              <Surface style={styles.card}>
                <EmptyState
                  icon="account-group"
                  title="パーティに参加していません"
                  description="パーティを作成するか、招待コードで参加しましょう"
                />
                <Button label="パーティを作成" onPress={() => createParty()} style={styles.btn} />
              </Surface>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  tabs: { marginHorizontal: 16, marginTop: 8 },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff' },
  deadline: { color: '#9ca3af', marginTop: 8 },
  sectionTitle: { color: '#374151', fontWeight: '700', marginBottom: 8 },
  partyName: { color: '#1f2937', fontWeight: '700' },
  partyInfo: { color: '#6b7280', marginTop: 4 },
  btn: { marginTop: 12 },
});
