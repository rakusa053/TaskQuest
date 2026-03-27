import React from 'react';
import { StyleSheet } from 'react-native';
import { Card as PaperCard, Surface } from 'react-native-paper';

interface Props {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: Props) {
  return (
    <Surface style={[styles.card, style]} elevation={1}>
      {onPress ? (
        <PaperCard onPress={onPress} style={styles.inner}>
          <PaperCard.Content>{children}</PaperCard.Content>
        </PaperCard>
      ) : (
        children
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginVertical: 4, backgroundColor: '#fff' },
  inner: { borderRadius: 16, backgroundColor: 'transparent' },
});
