import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const toInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const todayValue = toInputValue(new Date());

export function DatePickerField({ value, onChange }: Props) {
  return (
    <View style={styles.dateRow}>
      <MaterialCommunityIcons name="calendar" size={20} color="#6366f1" />
      <input
        type="date"
        value={value ? toInputValue(value) : ''}
        min={todayValue}
        onChange={(e) => {
          const val = e.target.value;
          if (!val) { onChange(null); return; }
          const [y, mo, d] = val.split('-').map(Number);
          onChange(new Date(y, mo - 1, d));
        }}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontSize: 15,
          color: value ? '#1f2937' : '#9ca3af',
          outline: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        } as React.CSSProperties}
      />
      {value && (
        <MaterialCommunityIcons
          name="close-circle"
          size={18}
          color="#9ca3af"
          onPress={() => onChange(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#e5e7eb',
  },
});
