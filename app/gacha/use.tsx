import React from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGacha } from '../../hooks/useGacha';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import type { GachaResult } from '../../types';

const RARITY_COLOR = { normal: '#6b7280', rare: '#6366f1', sr: '#f59e0b' };
const RARITY_LABEL = { normal: 'ノーマル', rare: 'レア', sr: 'SR' };

export default function UseGachaScreen() {
  const router = useRouter();
  const { results, useResult } = useGacha();
  const unused = results.filter((r) => !r.used);

  const handleUse = (result: GachaResult) => {
    Alert.alert(
      '報酬を使う',
      `「${RARITY_LABEL[result.rarity]} ${result.rewardMinutes}分」を使いますか？\n(SNS/ゲームアプリを一時解放)`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '使う', onPress: async () => {
            try {
              await useResult(result.id, 'default');
              Alert.alert('解放開始！', `${result.rewardMinutes}分間アプリが解放されました`);
            } catch {
              Alert.alert('エラー', '使用に失敗しました');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>未使用の報酬</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={unused}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Surface style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={[styles.rarity, { color: RARITY_COLOR[item.rarity] }]}>
                  {RARITY_LABEL[item.rarity]}
                </Text>
                <Text variant="headlineSmall" style={styles.minutes}>{item.rewardMinutes}分</Text>
                <Text variant="labelSmall" style={styles.sub}>アプリ解放</Text>
              </View>
              <Button label="使う" onPress={() => handleUse(item)} />
            </View>
          </Surface>
        )}
        ListEmptyComponent={
          <EmptyState icon="ticket-outline" title="未使用の報酬がありません" description="ガチャを引いて報酬を獲得しましょう" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  list: { padding: 16, gap: 8 },
  card: { borderRadius: 14, padding: 14, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rarity: { fontSize: 12, fontWeight: '700' },
  minutes: { fontWeight: '700', color: '#1f2937' },
  sub: { color: '#9ca3af' },
});
