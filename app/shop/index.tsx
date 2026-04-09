import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useShop } from '../../hooks/useShop';
import { useProfileStore } from '../../store/profileStore';
import { useThemeStore } from '../../store/themeStore';
import { ShopItemCard } from '../../components/shop/ShopItemCard';
import { CoinDisplay } from '../../components/gamification/CoinDisplay';
import { Button } from '../../components/ui/Button';
import type { ShopItem } from '../../types';

export default function ShopScreen() {
  const router = useRouter();
  const { items, purchasing, buy } = useShop();
  const { profile } = useProfileStore();
  const { unlockTheme, applyTheme } = useThemeStore();
  const [buyingId, setBuyingId] = useState<string | null>(null);

  const handleBuy = (item: ShopItem) => {
    Alert.alert(
      '購入確認',
      `「${item.name}」を${item.price}コインで購入しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '購入', onPress: async () => {
            setBuyingId(item.id);
            try {
              const result = await buy(item.id);
              if (item.type === 'theme') {
                await unlockTheme(item.id);
                Alert.alert(
                  '購入完了！',
                  `「${item.name}」を入手しました！\n適用しますか？`,
                  [
                    { text: '後で', style: 'cancel' },
                    { text: '適用する', onPress: () => applyTheme(item.id) },
                  ]
                );
              } else {
                Alert.alert('購入完了！', `残高: ${result.remainingMoney}コイン`);
              }
            } catch {
              Alert.alert('エラー', 'コインが足りないか、購入に失敗しました');
            } finally {
              setBuyingId(null);
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
        <Text variant="titleLarge" style={styles.title}>ショップ</Text>
        <CoinDisplay amount={profile?.money ?? 0} size="small" />
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ShopItemCard
            item={item}
            canAfford={(profile?.money ?? 0) >= item.price}
            onBuy={() => handleBuy(item)}
            purchasing={buyingId === item.id}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  list: { padding: 16 },
});
