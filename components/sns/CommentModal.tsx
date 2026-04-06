import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, TextInput, TouchableOpacity,
  Modal, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSnsStore } from '../../store/snsStore';
import { useAuthStore } from '../../store/authStore';
import { formatDistanceToNow } from '../../utils/dateUtils';
import type { Comment } from '../../types';

interface Props {
  postId: string | null;
  onClose: () => void;
}

export function CommentModal({ postId, onClose }: Props) {
  const { comments, commentsLoading, fetchComments, addComment, deleteComment } = useSnsStore();
  const { user } = useAuthStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (postId) fetchComments(postId);
  }, [postId]);

  const handleSend = async () => {
    if (!postId || !text.trim() || sending) return;
    setSending(true);
    try {
      await addComment(postId, text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.comment}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.displayName.charAt(0)}</Text>
      </View>
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentName}>{item.displayName}</Text>
          <Text style={styles.commentTime}>{formatDistanceToNow(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
      {user?.uid === item.userId && postId && (
        <TouchableOpacity onPress={() => deleteComment(postId, item.id)} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={16} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal visible={!!postId} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Surface style={styles.sheet}>
          <View style={styles.header}>
            <Text variant="titleMedium" style={styles.title}>コメント</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {commentsLoading ? (
            <ActivityIndicator color="#6366f1" style={styles.loader} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              style={styles.list}
              ListEmptyComponent={
                <Text style={styles.empty}>コメントはまだありません</Text>
              }
            />
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="コメントを入力..."
              placeholderTextColor="#9ca3af"
              value={text}
              onChangeText={setText}
              maxLength={140}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, backgroundColor: '#fff', maxHeight: '75%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#1f2937', fontWeight: '700' },
  loader: { marginVertical: 32 },
  list: { maxHeight: 360 },
  empty: { color: '#9ca3af', textAlign: 'center', paddingVertical: 24 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  commentBody: { flex: 1 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  commentName: { color: '#1f2937', fontWeight: '700', fontSize: 13 },
  commentTime: { color: '#9ca3af', fontSize: 11 },
  commentText: { color: '#374151', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  input: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, color: '#1f2937' },
  sendBtn: { backgroundColor: '#6366f1', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#c7d2fe' },
});
