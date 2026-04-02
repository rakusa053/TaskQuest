import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Image, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '../components/ui/Button';
import { evaluateNote, NoteEvaluationResult } from '../api/noteApi';
import { useProfileStore } from '../store/profileStore';

export default function NoteCheckScreen() {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { fetchProfile } = useProfileStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NoteEvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // スコアカウントアップアニメーション
  const animatedScore = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (result) {
      animatedScore.setValue(0);
      Animated.timing(animatedScore, {
        toValue: result.score,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      const listener = animatedScore.addListener(({ value }) => {
        setDisplayScore(Math.round(value));
      });
      return () => animatedScore.removeListener(listener);
    }
  }, [result]);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('カメラの権限が必要です');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (picked.canceled) return;

    const uri = picked.assets[0].uri;

    // 圧縮・リサイズ
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
    setImageUri(compressed.uri);
    handleEvaluate(compressed.base64!);
  };

  const handleEvaluate = async (base64: string) => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await evaluateNote(base64, taskId);
      setResult(res);
      await fetchProfile();
    } catch (e: any) {
      const msg = e?.response?.data?.error ?? '評価に失敗しました';
      setError(msg === 'Already evaluated' ? 'このタスクはすでに評価済みです' : msg);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 80 ? '#10b981'
      : result.score >= 60 ? '#6366f1'
        : result.score >= 40 ? '#f59e0b'
          : '#ef4444'
    : '#6366f1';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="閉じる" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>ノート評価</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!result && !loading && (
          <>
            <Text variant="bodyLarge" style={styles.desc}>
              今日勉強したノートを撮影して、頑張りを評価してもらいましょう！
            </Text>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            )}
            {error && <Text style={styles.error}>{error}</Text>}
            <Button label="カメラで撮影する" onPress={handlePickImage} mode="contained" />
            <Button label="スキップ" onPress={() => router.back()} mode="text" />
          </>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text variant="bodyMedium" style={styles.loadingText}>
              ノートを評価中...
            </Text>
          </View>
        )}

        {result && (
          <>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
            )}

            {/* スコア */}
            <View style={[styles.scoreBox, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreNum, { color: scoreColor }]}>{displayScore}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>

            {/* コメント */}
            <View style={styles.card}>
              <Text variant="labelLarge" style={styles.cardTitle}>総評</Text>
              <Text variant="bodyMedium" style={styles.cardText}>{result.comment}</Text>
            </View>

            {/* 良かった点 */}
            <View style={styles.card}>
              <Text variant="labelLarge" style={styles.cardTitle}>良かった点</Text>
              {result.points.map((p, i) => (
                <Text key={i} variant="bodyMedium" style={styles.cardText}>・{p}</Text>
              ))}
            </View>

            {/* アドバイス */}
            <View style={styles.card}>
              <Text variant="labelLarge" style={styles.cardTitle}>アドバイス</Text>
              <Text variant="bodyMedium" style={styles.cardText}>{result.advice}</Text>
            </View>

            {/* 報酬 */}
            <View style={styles.rewardBox}>
              <Text variant="labelLarge" style={styles.rewardTitle}>獲得報酬</Text>
              <Text style={styles.rewardText}>+{result.reward.xp} XP　+{result.reward.money} コイン</Text>
            </View>

            <Button label="タスク画面に戻る" onPress={() => router.back()} mode="contained" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 12,
  },
  title: { fontWeight: '700', color: '#1f2937' },
  content: { padding: 20, gap: 16, alignItems: 'stretch' },
  desc: { color: '#4b5563', textAlign: 'center', marginBottom: 8 },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#e5e7eb' },
  error: { color: '#ef4444', textAlign: 'center' },
  loadingBox: { alignItems: 'center', gap: 16, marginTop: 60 },
  loadingText: { color: '#6b7280' },
  scoreBox: {
    alignSelf: 'center', borderWidth: 4, borderRadius: 80,
    width: 140, height: 140,
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  scoreLabel: { fontSize: 16, color: '#6b7280' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    gap: 6, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, elevation: 2,
  },
  cardTitle: { color: '#1f2937', fontWeight: '700', marginBottom: 4 },
  cardText: { color: '#374151', lineHeight: 22 },
  rewardBox: {
    backgroundColor: '#ede9fe', borderRadius: 12, padding: 16,
    alignItems: 'center', gap: 4,
  },
  rewardTitle: { color: '#6366f1', fontWeight: '700' },
  rewardText: { fontSize: 20, fontWeight: '800', color: '#4f46e5' },
});
