import React, { useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  Modal, FlatList, ActivityIndicator,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { snsApi } from '../../api/snsApi';
import { getAvatarLabel } from '../../utils/avatarUtils';
import type { SnsUser } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function UserSearchModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SnsUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length === 0) { setResults([]); return; }
    setLoading(true);
    try {
      const users = await snsApi.searchUsers(q.trim());
      setResults(users);
      const map: Record<string, boolean> = {};
      users.forEach(u => { map[u.userId] = u.followedByMe ?? false; });
      setFollowingMap(map);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    const { following } = await snsApi.toggleFollow(userId);
    setFollowingMap(prev => ({ ...prev, [userId]: following }));
  };

  const renderUser = ({ item }: { item: SnsUser }) => (
    <View style={styles.userRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getAvatarLabel(item.avatarId)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.displayName}</Text>
        <Text style={styles.userLevel}>Lv.{item.level}</Text>
      </View>
      <TouchableOpacity
        style={[styles.followBtn, followingMap[item.userId] && styles.followingBtn]}
        onPress={() => handleFollow(item.userId)}
      >
        <Text style={[styles.followText, followingMap[item.userId] && styles.followingText]}>
          {followingMap[item.userId] ? 'フォロー中' : 'フォロー'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Surface style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>ユーザー検索</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="名前で検索..."
              placeholderTextColor="#9ca3af"
              value={query}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>

          {loading ? (
            <ActivityIndicator color="#6366f1" style={styles.loader} />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.userId}
              renderItem={renderUser}
              ListEmptyComponent={
                query.length > 0 ? (
                  <Text style={styles.empty}>見つかりませんでした</Text>
                ) : null
              }
            />
          )}
        </Surface>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, backgroundColor: '#fff', minHeight: 400 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#1f2937', fontWeight: '700' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: '#1f2937' },
  loader: { marginVertical: 32 },
  empty: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  userInfo: { flex: 1 },
  userName: { color: '#1f2937', fontWeight: '700', fontSize: 15 },
  userLevel: { color: '#9ca3af', fontSize: 12 },
  followBtn: { backgroundColor: '#6366f1', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  followingBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#6366f1' },
  followText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  followingText: { color: '#6366f1' },
});
