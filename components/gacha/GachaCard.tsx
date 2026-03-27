import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import type { GachaResult } from '../../types';

const RARITY_COLOR = { normal: '#6b7280', rare: '#6366f1', sr: '#f59e0b' };
const RARITY_LABEL = { normal: 'ノーマル', rare: 'レア', sr: 'SR' };

interface Props {
  result: GachaResult;
  revealed?: boolean;
  onReveal?: () => void;
}

export function GachaCard({ result, revealed = false, onReveal }: Props) {
  const [flipped, setFlipped] = useState(revealed);
  const color = RARITY_COLOR[result.rarity];

  const handlePress = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal?.();
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { borderColor: color }]} onPress={handlePress} activeOpacity={0.9}>
      {flipped ? (
        <View style={styles.front}>
          <Text style={[styles.rarity, { color }]}>{RARITY_LABEL[result.rarity]}</Text>
          <Text variant="displaySmall" style={[styles.minutes, { color }]}>
            {result.rewardMinutes}分
          </Text>
          <Text variant="bodySmall" style={styles.desc}>アプリ解放</Text>
        </View>
      ) : (
        <View style={styles.back}>
          <Text style={styles.question}>?</Text>
          <Text variant="labelSmall" style={styles.tapHint}>タップで開封</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160, height: 220, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  front: { alignItems: 'center', gap: 8 },
  back: { alignItems: 'center', gap: 4 },
  rarity: { fontSize: 13, fontWeight: '700' },
  minutes: { fontWeight: '700' },
  desc: { color: '#9ca3af' },
  question: { fontSize: 64, color: '#d1d5db' },
  tapHint: { color: '#9ca3af' },
});
