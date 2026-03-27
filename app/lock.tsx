import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { verifyPin } from '../lib/pinStorage';
import { Button } from '../components/ui/Button';

const PAD = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function LockScreen() {
  const router = useRouter();
  const [input, setInput] = useState('');

  const handleKey = async (key: string) => {
    if (key === '⌫') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }
    if (key === '') return;
    const next = input + key;
    setInput(next);
    if (next.length === 4) {
      const ok = await verifyPin(next);
      if (ok) {
        router.back();
      } else {
        setInput('');
        Alert.alert('PINが違います', '正しい4桁のPINを入力してください');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text variant="headlineMedium" style={styles.title}>フォーカスモード</Text>
        <Text variant="bodyMedium" style={styles.sub}>
          タスクを完了してアプリを解放しましょう
        </Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i < input.length && styles.dotFilled]} />
          ))}
        </View>

        <Text variant="labelLarge" style={styles.pinLabel}>緊急解除PIN</Text>
        <View style={styles.pad}>
          {PAD.map((key, i) => (
            <View key={i} style={styles.padCell}>
              {key !== '' ? (
                <Button
                  label={key}
                  onPress={() => handleKey(key)}
                  mode={key === '⌫' ? 'outlined' : 'contained'}
                  style={styles.padBtn}
                />
              ) : null}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1f2937' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 },
  emoji: { fontSize: 56 },
  title: { color: '#fff', fontWeight: '700', textAlign: 'center' },
  sub: { color: '#9ca3af', textAlign: 'center' },
  dots: { flexDirection: 'row', gap: 16, marginVertical: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#6366f1' },
  dotFilled: { backgroundColor: '#6366f1' },
  pinLabel: { color: '#9ca3af' },
  pad: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 8 },
  padCell: { width: 72, height: 52 },
  padBtn: { flex: 1 },
});
