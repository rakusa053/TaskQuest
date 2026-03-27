import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useGacha } from '../../hooks/useGacha';
import { useProfileStore } from '../../store/profileStore';
import { GachaCard } from '../../components/gacha/GachaCard';
import { Button } from '../../components/ui/Button';

export default function GachaScreen() {
  const router = useRouter();
  const { spin, lastSpinResult, loading, clearLastSpin } = useGacha();
  const { profile } = useProfileStore();
  const [revealed, setRevealed] = useState(false);

  const handleSpin = async () => {
    if (!profile || profile.gachaTickets < 1) {
      Alert.alert('チケット不足', 'ガチャチケットがありません。ショップで購入できます。');
      return;
    }
    setRevealed(false);
    try {
      await spin();
    } catch {
      Alert.alert('エラー', 'ガチャに失敗しました');
    }
  };

  const handleClose = () => {
    clearLastSpin();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="閉じる" onPress={handleClose} mode="text" />
        <Text variant="titleLarge" style={styles.title}>ガチャ</Text>
        <Text variant="labelMedium" style={styles.tickets}>🎫 x{profile?.gachaTickets ?? 0}</Text>
      </View>

      <View style={styles.content}>
        {lastSpinResult ? (
          <>
            <GachaCard result={lastSpinResult} revealed={revealed} onReveal={() => setRevealed(true)} />
            {revealed && (
              <Text variant="bodyMedium" style={styles.hint}>
                報酬は「報酬を使う」から選んで使用できます
              </Text>
            )}
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.emoji}>🎴</Text>
            <Text variant="bodyLarge" style={styles.desc}>チケット1枚でガチャを引けます</Text>
          </View>
        )}

        <Button
          label={lastSpinResult ? 'もう一度引く' : 'ガチャを引く！'}
          onPress={handleSpin}
          loading={loading}
          style={styles.spinBtn}
        />
        <Button label="報酬を使う" onPress={() => router.push('/gacha/use')} mode="outlined" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  tickets: { color: '#d97706' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  placeholder: { alignItems: 'center', gap: 8 },
  emoji: { fontSize: 80 },
  desc: { color: '#6b7280', textAlign: 'center' },
  hint: { color: '#6b7280', textAlign: 'center' },
  spinBtn: { width: '100%' },
});
