import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { CoinDisplay } from '../gamification/CoinDisplay';
import type { ShopItem } from '../../types';

const TYPE_ICON: Record<string, string> = {
  gacha_ticket: 'ticket',
  time_extension: 'clock-plus',
  xp_boost: 'lightning-bolt',
  avatar: 'account',
  costume: 'tshirt-crew',
  accessory: 'star',
};

interface Props {
  item: ShopItem;
  canAfford: boolean;
  onBuy: () => void;
  purchasing?: boolean;
}

export function ShopItemCard({ item, canAfford, onBuy, purchasing }: Props) {
  const icon = TYPE_ICON[item.type] ?? 'shopping';

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon as any} size={32} color="#6366f1" />
      </View>
      <View style={styles.info}>
        <Text variant="titleSmall" style={styles.name}>{item.name}</Text>
        <Text variant="bodySmall" style={styles.desc}>{item.description}</Text>
        <CoinDisplay amount={item.price} size="small" />
      </View>
      <Button
        label="購入"
        onPress={onBuy}
        disabled={!canAfford}
        loading={purchasing}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginVertical: 4, gap: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#ede9fe',
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  name: { color: '#1f2937', fontWeight: '700' },
  desc: { color: '#6b7280' },
  btn: { minWidth: 60 },
});
