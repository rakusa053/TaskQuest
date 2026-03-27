import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar as PaperSnackbar } from 'react-native-paper';

interface Props {
  message: string | null;
  onDismiss: () => void;
  type?: 'error' | 'success' | 'info';
  duration?: number;
}

const TYPE_COLOR = {
  error: '#ef4444',
  success: '#22c55e',
  info: '#6366f1',
};

export function Snackbar({ message, onDismiss, type = 'info', duration = 3000 }: Props) {
  return (
    <PaperSnackbar
      visible={!!message}
      onDismiss={onDismiss}
      duration={duration}
      style={[styles.snackbar, { backgroundColor: TYPE_COLOR[type] }]}
      action={{ label: '✕', onPress: onDismiss, textColor: '#fff' }}
    >
      {message}
    </PaperSnackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: { marginBottom: 16 },
});
