import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useProfile } from '../hooks/useProfile';
import { Button } from '../components/ui/Button';

const DEFAULT_AVATARS = [
  { id: 'default', label: 'デフォルト', initials: 'U' },
  { id: 'scholar', label: '学者', initials: '📚' },
  { id: 'warrior', label: '戦士', initials: '⚔️' },
  { id: 'mage', label: '魔法使い', initials: '🔮' },
  { id: 'hero', label: 'ヒーロー', initials: '🦸' },
  { id: 'ninja', label: '忍者', initials: '🥷' },
];

export default function AvatarScreen() {
  const router = useRouter();
  const { profile, update } = useProfile();

  const handleSelect = async (avatarId: string) => {
    await update({ avatarId });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>アバター選択</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={DEFAULT_AVATARS}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const selected = profile?.avatarId === item.id;
          return (
            <TouchableOpacity
              style={[styles.cell, selected && styles.cellSelected]}
              onPress={() => handleSelect(item.id)}
            >
              <Avatar.Text
                size={56}
                label={item.initials}
                style={[styles.avatar, selected && styles.avatarSelected]}
              />
              <Text variant="labelSmall" style={styles.label}>{item.label}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  title: { fontWeight: '700', color: '#1f2937' },
  grid: { padding: 16, gap: 12 },
  cell: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 16, margin: 4 },
  cellSelected: { backgroundColor: '#ede9fe' },
  avatar: { backgroundColor: '#6366f1' },
  avatarSelected: { backgroundColor: '#4f46e5' },
  label: { color: '#374151', marginTop: 6 },
});
