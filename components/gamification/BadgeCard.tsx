import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Badge } from '../../types';

interface Props {
  badge: Badge;
}

export function BadgeCard({ badge }: Props) {
  return (
    <View style={styles.card}>
      <MaterialCommunityIcons name={badge.icon as any} size={28} color="#6366f1" />
      <Text variant="labelSmall" style={styles.name} numberOfLines={2}>{badge.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 72, alignItems: 'center', backgroundColor: '#f5f3ff',
    borderRadius: 12, padding: 8, gap: 4,
  },
  name: { color: '#4f46e5', textAlign: 'center', fontWeight: '600' },
});
