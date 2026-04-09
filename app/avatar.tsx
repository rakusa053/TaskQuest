import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const PREMIUM_AVATARS = [
  { id: 'avatar_dragon', label: 'ドラゴン', initials: '🐉' },
  { id: 'avatar_fox',    label: 'キツネ',   initials: '🦊' },
  { id: 'avatar_panda',  label: 'パンダ',   initials: '🐼' },
  { id: 'avatar_king',   label: '王者',     initials: '👑' },
  { id: 'avatar_robot',  label: 'ロボット', initials: '🤖' },
  { id: 'avatar_star',   label: 'スター',   initials: '🌟' },
];

export default function AvatarScreen() {
  const router = useRouter();
  const { profile, update } = useProfile();
  const unlockedAvatars: string[] = profile?.unlockedAvatars ?? [];

  const handleSelect = async (avatarId: string) => {
    await update({ avatarId });
    router.back();
  };

  const allAvatars = [
    ...DEFAULT_AVATARS.map((a) => ({ ...a, locked: false })),
    ...PREMIUM_AVATARS.map((a) => ({ ...a, locked: !unlockedAvatars.includes(a.id) })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>アバター選択</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={allAvatars}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const selected = profile?.avatarId === item.id;
          return (
            <TouchableOpacity
              style={[styles.cell, selected && styles.cellSelected, item.locked && styles.cellLocked]}
              onPress={() => !item.locked && handleSelect(item.id)}
              activeOpacity={item.locked ? 1 : 0.7}
            >
              <View style={styles.avatarWrap}>
                <Avatar.Text
                  size={56}
                  label={item.initials}
                  style={[styles.avatar, selected && styles.avatarSelected, item.locked && styles.avatarLocked]}
                />
                {item.locked && (
                  <View style={styles.lockBadge}>
                    <MaterialCommunityIcons name="lock" size={14} color="#fff" />
                  </View>
                )}
              </View>
              <Text variant="labelSmall" style={[styles.label, item.locked && styles.labelLocked]}>
                {item.label}
              </Text>
              {item.locked && (
                <Text variant="labelSmall" style={styles.shopHint}>ショップで購入</Text>
              )}
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
  cellLocked: { opacity: 0.6 },
  avatarWrap: { position: 'relative' },
  avatar: { backgroundColor: '#6366f1' },
  avatarSelected: { backgroundColor: '#4f46e5' },
  avatarLocked: { backgroundColor: '#9ca3af' },
  lockBadge: {
    position: 'absolute', bottom: 0, right: -4,
    backgroundColor: '#374151', borderRadius: 10, padding: 2,
  },
  label: { color: '#374151', marginTop: 6 },
  labelLocked: { color: '#9ca3af' },
  shopHint: { color: '#6366f1', fontSize: 10 },
});
