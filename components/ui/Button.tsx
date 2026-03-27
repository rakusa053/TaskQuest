import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';

interface Props {
  label: string;
  onPress: () => void;
  mode?: 'contained' | 'outlined' | 'text';
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  style?: object;
}

export function Button({ label, onPress, mode = 'contained', loading, disabled, color, style }: Props) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={color}
      style={[styles.button, style]}
    >
      {label}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: { borderRadius: 12 },
});
