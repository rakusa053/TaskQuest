import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  amount: number;
  size?: 'small' | 'medium' | 'large';
}

export function CoinDisplay({ amount = 0, size = 'medium' }: Props) {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 28 : 20;
  const variant = size === 'large' ? 'headlineSmall' : size === 'small' ? 'labelMedium' : 'titleMedium';

  return (
    <View style={styles.row}>
      <MaterialCommunityIcons name="circle-multiple" size={iconSize} color="#f59e0b" />
      <Text variant={variant as any} style={styles.amount}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amount: { color: '#d97706', fontWeight: '700' },
});
