import React, { useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileStore } from '../store/profileStore';
import { Button } from '../components/ui/Button';
import { Snackbar } from '../components/ui/Snackbar';

export default function EditNameScreen() {
  const router = useRouter();
  const { profile, update } = useProfileStore();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile?.displayName]);

  const handleSave = async () => {
    if (!displayName.trim()) {
      setSnackbar({ msg: 'ニックネームを入力してください', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await update({ displayName: displayName.trim() });
      setSnackbar({ msg: '保存しました ✓', type: 'success' });
      setTimeout(() => router.back(), 800);
    } catch {
      setSnackbar({ msg: '保存に失敗しました', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Button label="戻る" onPress={() => router.back()} mode="text" />
          <Text variant="titleMedium" style={styles.headerTitle}>ニックネーム変更</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          {/* アイコン */}
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="account-edit" size={56} color="#6366f1" />
          </View>

          <Text variant="bodyMedium" style={styles.desc}>
            SNS やプロフィールに表示される名前を設定します
          </Text>

          {/* 入力カード */}
          <Surface style={styles.card}>
            <Text variant="labelMedium" style={styles.label}>ニックネーム</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              mode="flat"
              style={styles.input}
              underlineColor="#e0e7ff"
              activeUnderlineColor="#6366f1"
              maxLength={20}
              autoFocus
            />
            <Text style={styles.counter}>{displayName.length} / 20</Text>
          </Surface>

          <Button
            label="保存する"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        message={snackbar?.msg ?? null}
        type={snackbar?.type}
        onDismiss={() => setSnackbar(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  headerTitle: { fontWeight: '700', color: '#1f2937' },
  content: { flex: 1, padding: 24, gap: 20, alignItems: 'center' },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center',
    marginTop: 16,
  },
  desc: { color: '#6b7280', textAlign: 'center' },
  card: { width: '100%', borderRadius: 16, padding: 20, backgroundColor: '#fff', gap: 8 },
  label: { color: '#6366f1', fontWeight: '700', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', fontSize: 18 },
  counter: { color: '#9ca3af', fontSize: 12, textAlign: 'right' },
  saveBtn: { width: '100%', marginTop: 8 },
});
