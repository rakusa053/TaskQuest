import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../ui/Button';

interface Props {
  level: number | null;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: Props) {
  return (
    <Modal visible={!!level} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>⬆️</Text>
          <Text variant="headlineMedium" style={styles.title}>レベルアップ！</Text>
          <Text variant="displaySmall" style={styles.level}>Lv.{level}</Text>
          <Text variant="bodyMedium" style={styles.sub}>
            ガチャチケット＆コインボーナス獲得！
          </Text>
          <Button label="やった！" onPress={onClose} style={styles.btn} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: 280 },
  emoji: { fontSize: 48 },
  title: { marginTop: 8, color: '#6366f1', fontWeight: '700' },
  level: { color: '#f59e0b', fontWeight: '700' },
  sub: { color: '#6b7280', textAlign: 'center', marginTop: 8 },
  btn: { marginTop: 20, width: '100%' },
});
