import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, HelperText } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, loading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    setError('');
    try {
      await signIn(email.trim(), password);
    } catch {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text variant="headlineLarge" style={styles.title}>TaskQest</Text>
        <Text variant="bodyMedium" style={styles.sub}>ログイン</Text>

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
          label="パスワード"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          mode="outlined"
        />
        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button label="ログイン" onPress={handleLogin} loading={loading} style={styles.btn} />
        <Button
          label="アカウントを作成"
          onPress={() => router.push('/auth/register')}
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
