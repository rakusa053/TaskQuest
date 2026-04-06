import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSnsStore } from '../../store/snsStore';
import { PostCard } from '../../components/sns/PostCard';
import { NewPostModal } from '../../components/sns/NewPostModal';
import { CommentModal } from '../../components/sns/CommentModal';
import { UserSearchModal } from '../../components/sns/UserSearchModal';
import { Snackbar } from '../../components/ui/Snackbar';
import type { Post } from '../../types';

type FeedType = 'all' | 'following' | 'party';

const TABS: { key: FeedType; label: string }[] = [
  { key: 'all', label: '全体' },
  { key: 'following', label: 'フォロー中' },
  { key: 'party', label: 'パーティ' },
];

export default function SnsScreen() {
  const router = useRouter();
  const { posts, feedType, loading, locked, fetchFeed, setFeedType, toggleLike, deletePost, createPost } = useSnsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [newPostVisible, setNewPostVisible] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [snackbar, setSnackbar] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  const handleDelete = async (post: Post) => {
    try {
      await deletePost(post.id);
      setSnackbar({ msg: '投稿を削除しました', type: 'success' });
    } catch {
      setSnackbar({ msg: '削除に失敗しました', type: 'error' });
    }
  };

  const handlePost = async (text: string) => {
    await createPost(text);
    setSnackbar({ msg: '投稿しました', type: 'success' });
  };

  if (locked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockedContainer}>
          <MaterialCommunityIcons name="lock" size={64} color="#c7d2fe" />
          <Text variant="titleLarge" style={styles.lockedTitle}>SNSがロックされています</Text>
          <Text style={styles.lockedDesc}>今日のタスクを1つ完了すると{'\n'}SNSが解放されます</Text>
          <TouchableOpacity style={styles.lockedBtn} onPress={() => router.push('/')}>
            <Text style={styles.lockedBtnText}>タスク画面に戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>SNS</Text>
        <TouchableOpacity onPress={() => setSearchVisible(true)} hitSlop={8}>
          <MaterialCommunityIcons name="account-search-outline" size={26} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* タブ */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, feedType === tab.key && styles.tabActive]}
            onPress={() => setFeedType(tab.key)}
          >
            <Text style={[styles.tabText, feedType === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => toggleLike(item.id)}
            onComment={() => setCommentPostId(item.id)}
            onDelete={() => handleDelete(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>投稿がありません</Text>
            </View>
          ) : null
        }
      />

      <FAB
        icon="pencil"
        style={styles.fab}
        onPress={() => setNewPostVisible(true)}
        color="#fff"
      />

      <NewPostModal
        visible={newPostVisible}
        onClose={() => setNewPostVisible(false)}
        onSubmit={handlePost}
      />

      <CommentModal
        postId={commentPostId}
        onClose={() => setCommentPostId(null)}
      />

      <UserSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
      />

      <Snackbar message={snackbar?.msg ?? null} type={snackbar?.type} onDismiss={() => setSnackbar(null)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  title: { color: '#1f2937', fontWeight: '700' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  tab: { flex: 1, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f3f4f6', alignItems: 'center' },
  tabActive: { backgroundColor: '#6366f1' },
  tabText: { color: '#6b7280', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { color: '#9ca3af' },
  fab: { position: 'absolute', right: 16, bottom: 24, backgroundColor: '#6366f1' },
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  lockedTitle: { color: '#1f2937', fontWeight: '700', textAlign: 'center' },
  lockedDesc: { color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  lockedBtn: { backgroundColor: '#6366f1', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginTop: 8 },
  lockedBtnText: { color: '#fff', fontWeight: '700' },
});
