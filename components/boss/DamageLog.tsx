import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { BossDamageLog } from '../../types';

interface Props {
  logs: BossDamageLog[];
}

export function DamageLog({ logs }: Props) {
  return (
    <FlatList
      data={logs.slice(0, 20)}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text variant="labelMedium" style={styles.name}>{item.displayName ?? 'プレイヤー'}</Text>
          <Text variant="labelMedium" style={styles.damage}>-{item.damage} ダメージ</Text>
          <Text variant="labelSmall" style={styles.time}>
            {new Date(item.createdAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  name: { flex: 1, color: '#374151' },
  damage: { color: '#ef4444', fontWeight: '700', marginRight: 8 },
  time: { color: '#9ca3af' },
});
