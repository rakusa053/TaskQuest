import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  level: number | null;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: Props) {
  if (!level) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={styles.card}>
        <Text style={styles.emoji}>⬆️</Text>
        <Text variant="headlineMedium" style={styles.title}>レベルアップ！</Text>
        <Text variant="displaySmall" style={styles.level}>Lv.{level}</Text>
        <Text variant="bodyMedium" style={styles.sub}>
          ガチャチケット＆コインボーナス獲得！
        </Text>
        <TouchableOpacity style={styles.btn} onPress={onClose}>
          <Text style={styles.btnText}>やった！</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: 280,
    zIndex: 10000,
  },
  emoji: { fontSize: 48 },
  title: { marginTop: 8, color: '#6366f1', fontWeight: '700' },
  level: { color: '#f59e0b', fontWeight: '700' },
  sub: { color: '#6b7280', textAlign: 'center', marginTop: 8 },
  btn: {
    marginTop: 20, width: '100%', backgroundColor: '#6366f1',
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
