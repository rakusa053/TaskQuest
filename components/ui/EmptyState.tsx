import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = 'inbox-outline', title, description }: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon as any} size={56} color="#d1d5db" />
      <Text variant="titleMedium" style={styles.title}>{title}</Text>
      {description && <Text variant="bodyMedium" style={styles.desc}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  title: { marginTop: 12, color: '#6b7280', textAlign: 'center' },
  desc: { marginTop: 4, color: '#9ca3af', textAlign: 'center' },
});
