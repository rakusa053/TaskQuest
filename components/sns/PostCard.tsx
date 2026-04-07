import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Post } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from '../../utils/dateUtils';
import { getAvatarLabel } from '../../utils/avatarUtils';

interface Props {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onDelete: () => void;
}

export function PostCard({ post, onLike, onComment, onDelete }: Props) {
  const { user } = useAuthStore();
  const isOwn = user?.uid === post.userId;

  return (
    <Surface style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getAvatarLabel(post.avatarId)}</Text>
        </View>
        <View style={styles.meta}>
          <Text variant="labelLarge" style={styles.name}>{post.displayName}</Text>
          <Text variant="labelSmall" style={styles.time}>
            {formatDistanceToNow(post.createdAt)}
          </Text>
        </View>
        {isOwn && (
          <TouchableOpacity onPress={onDelete} hitSlop={8}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.text}>{post.text}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.action} onPress={onLike}>
          <MaterialCommunityIcons
            name={post.likedByMe ? 'heart' : 'heart-outline'}
            size={20}
            color={post.likedByMe ? '#ef4444' : '#9ca3af'}
          />
          <Text style={[styles.count, post.likedByMe && styles.countLiked]}>
            {post.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.action} onPress={onComment}>
          <MaterialCommunityIcons name="comment-outline" size={20} color="#9ca3af" />
          <Text style={styles.count}>{post.commentsCount}</Text>
        </TouchableOpacity>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { flex: 1 },
  name: { color: '#1f2937', fontWeight: '700' },
  time: { color: '#9ca3af', marginTop: 2 },
  text: { color: '#374151', fontSize: 15, lineHeight: 22, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 20 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { color: '#9ca3af', fontSize: 13 },
  countLiked: { color: '#ef4444' },
});
