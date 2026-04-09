import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { CoinDisplay } from '../gamification/CoinDisplay';
import type { ShopItem } from '../../types';

const TYPE_ICON: Record<string, string> = {
  gacha_ticket: 'ticket-confirmation',
  time_extension: 'clock-plus',
  xp_boost: 'lightning-bolt',
  avatar: 'account-circle',
  costume: 'tshirt-crew',
  accessory: 'star-four-points',
};

const TYPE_BG: Record<string, string> = {
  gacha_ticket: '#ede9fe',
  time_extension: '#dbeafe',
  xp_boost: '#fef9c3',
  avatar: '#dcfce7',
  costume: '#fce7f3',
  accessory: '#ffedd5',
};

const TYPE_BORDER: Record<string, string> = {
  gacha_ticket: '#a78bfa',
  time_extension: '#60a5fa',
  xp_boost: '#facc15',
  avatar: '#4ade80',
  costume: '#f472b6',
  accessory: '#fb923c',
};

const TYPE_COLOR: Record<string, string> = {
  gacha_ticket: '#7c3aed',
  time_extension: '#2563eb',
  xp_boost: '#ca8a04',
  avatar: '#16a34a',
  costume: '#db2777',
  accessory: '#ea580c',
};

interface Props {
  item: ShopItem;
  canAfford: boolean;
  onBuy: () => void;
  purchasing?: boolean;
}

export function ShopItemCard({ item, canAfford, onBuy, purchasing }: Props) {
  const icon = TYPE_ICON[item.type] ?? 'shopping';
  const bg = TYPE_BG[item.type] ?? '#f3f4f6';
  const border = TYPE_BORDER[item.type] ?? '#d1d5db';
  const color = TYPE_COLOR[item.type] ?? '#6366f1';

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: bg, borderColor: border }]}>
        <MaterialCommunityIcons name={icon as any} size={32} color={color} />
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
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  info: { flex: 1, gap: 2 },
  name: { color: '#1f2937', fontWeight: '700' },
  desc: { color: '#6b7280' },
  btn: { minWidth: 60 },
});
