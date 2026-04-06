import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
}

const MAX_LENGTH = 140;

export function NewPostModal({ visible, onClose, onSubmit }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      await onSubmit(text.trim());
      setText('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const remaining = MAX_LENGTH - text.length;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Surface style={styles.sheet}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text variant="titleMedium" style={styles.title}>投稿する</Text>
            <TouchableOpacity
              style={[styles.submitBtn, (!text.trim() || loading) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={!text.trim() || loading}
            >
              <Text style={styles.submitText}>送信</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="今日は何を勉強した？"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={MAX_LENGTH}
            value={text}
            onChangeText={setText}
            autoFocus
          />

          <Text style={[styles.counter, remaining < 20 && styles.counterWarn]}>
            {remaining}
          </Text>
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, backgroundColor: '#fff', minHeight: 280 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title: { color: '#1f2937', fontWeight: '700' },
  submitBtn: { backgroundColor: '#6366f1', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  submitBtnDisabled: { backgroundColor: '#c7d2fe' },
  submitText: { color: '#fff', fontWeight: '700' },
  input: { fontSize: 16, color: '#1f2937', lineHeight: 24, minHeight: 120, textAlignVertical: 'top' },
  counter: { alignSelf: 'flex-end', color: '#9ca3af', fontSize: 13 },
  counterWarn: { color: '#ef4444' },
});
