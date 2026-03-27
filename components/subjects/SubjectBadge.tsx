import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Subject } from '../../types';

interface Props {
  subject: Subject;
  small?: boolean;
}

export function SubjectBadge({ subject, small = false }: Props) {
  const size = small ? 14 : 18;
  return (
    <View style={[styles.badge, { backgroundColor: subject.color + '22' }]}>
      <MaterialCommunityIcons name={subject.icon as any} size={size} color={subject.color} />
      <Text style={[styles.label, { color: subject.color, fontSize: small ? 11 : 13 }]}>
        {subject.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  label: { fontWeight: '600' },
});
