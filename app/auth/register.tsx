import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp, loading } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    setError('');
    if (!displayName.trim()) { setError('ニックネームを入力してください'); return; }
    if (password.length < 6) { setError('パスワードは6文字以上で入力してください'); return; }
    try {
      await signUp(email.trim(), password, displayName.trim());
    } catch {
      setError('登録に失敗しました。メールアドレスを確認してください');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text variant="headlineLarge" style={styles.title}>GamingTask</Text>
        <Text variant="bodyMedium" style={styles.sub}>新規登録</Text>

        <TextInput
          label="ニックネーム"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="メールアドレス"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          mode="outlined"
        />
        <TextInput
          label="パスワード（6文字以上）"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button label="登録" onPress={handleRegister} loading={loading} style={styles.btn} />
        <Button
          label="ログインに戻る"
          onPress={() => router.back()}
          mode="text"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { color: '#6366f1', fontWeight: '700', textAlign: 'center' },
  sub: { color: '#6b7280', textAlign: 'center', marginBottom: 8 },
  input: { backgroundColor: '#fff' },
  btn: { marginTop: 8 },
});
