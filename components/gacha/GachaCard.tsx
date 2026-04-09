import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { GachaResult } from '../../types';

const RARITY_COLOR  = { normal: '#6b7280', rare: '#6366f1', sr: '#f59e0b' };
const RARITY_BG     = { normal: '#f3f4f6', rare: '#ede9fe', sr: '#fef9c3' };
const RARITY_BORDER = { normal: '#d1d5db', rare: '#a78bfa', sr: '#fbbf24' };
const RARITY_ICON   = { normal: 'clock-outline', rare: 'star', sr: 'crown' };
const RARITY_LABEL  = { normal: 'ノーマル', rare: 'レア', sr: 'SR' };

interface Props {
  result: GachaResult;
  revealed?: boolean;
  onReveal?: () => void;
}

export function GachaCard({ result, revealed = false, onReveal }: Props) {
  const [flipped, setFlipped] = useState(revealed);
  const color  = RARITY_COLOR[result.rarity];
  const bg     = RARITY_BG[result.rarity];
  const border = RARITY_BORDER[result.rarity];
  const icon   = RARITY_ICON[result.rarity];

  const handlePress = () => {
    if (!flipped) {
      setFlipped(true);
      onReveal?.();
    }
  };

  return (
    <TouchableOpacity style={[styles.card, { borderColor: border, backgroundColor: bg }]} onPress={handlePress} activeOpacity={0.9}>
      {flipped ? (
        <View style={styles.front}>
          <View style={[styles.iconWrap, { backgroundColor: '#fff', borderColor: border }]}>
            <MaterialCommunityIcons name={icon as any} size={28} color={color} />
          </View>
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
  front: { alignItems: 'center', gap: 6 },
  iconWrap: {
    width: 52, height: 52, borderRadius: 14, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  back: { alignItems: 'center', gap: 4 },
  rarity: { fontSize: 13, fontWeight: '700' },
  minutes: { fontWeight: '700' },
  desc: { color: '#9ca3af' },
  question: { fontSize: 64, color: '#d1d5db' },
  tapHint: { color: '#9ca3af' },
});
