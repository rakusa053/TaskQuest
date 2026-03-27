import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useParty } from '../../hooks/useParty';
import { Button } from '../../components/ui/Button';

export default function PartyManageScreen() {
  const router = useRouter();
  const { party, create, join, leave } = useParty();
  const [inviteCode, setInviteCode] = useState('');
  const [partyName, setPartyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await create(partyName || undefined);
      router.back();
    } catch {
      Alert.alert('エラー', 'パーティの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim()) return;
    setLoading(true);
    try {
      await join(inviteCode.trim().toUpperCase());
      router.back();
    } catch {
      Alert.alert('エラー', '招待コードが無効です');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = () => {
    Alert.alert('パーティを脱退', '本当に脱退しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      { text: '脱退', style: 'destructive', onPress: async () => { await leave(); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>パーティ管理</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.content}>
        {party ? (
          <>
            <Text variant="titleLarge" style={styles.partyName}>{party.name}</Text>
            <Text variant="bodyMedium" style={styles.info}>招待コード: {party.inviteCode}</Text>
            <Text variant="bodyMedium" style={styles.info}>メンバー: {party.memberIds.length}/5</Text>
            <Button label="パーティを脱退" onPress={handleLeave} mode="outlined" color="#ef4444" />
          </>
        ) : (
          <>
            <Text variant="titleMedium" style={styles.section}>パーティを作成</Text>
            <TextInput
              label="パーティ名（任意）"
              value={partyName}
              onChangeText={setPartyName}
              mode="outlined"
              style={styles.input}
            />
            <Button label="作成" onPress={handleCreate} loading={loading} />

            <Text variant="titleMedium" style={[styles.section, styles.divider]}>招待コードで参加</Text>
            <TextInput
              label="招待コード（6文字）"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              mode="outlined"
              style={styles.input}
            />
            <Button label="参加" onPress={handleJoin} loading={loading} mode="outlined" />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  content: { padding: 16, gap: 12 },
  section: { color: '#374151', fontWeight: '700' },
  divider: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 16 },
  input: { backgroundColor: '#fff' },
  partyName: { color: '#1f2937', fontWeight: '700' },
  info: { color: '#6b7280' },
});
