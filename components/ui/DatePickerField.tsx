import React, { useState } from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

export function DatePickerField({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)}>
        <Surface style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar" size={20} color="#6366f1" />
          <Text style={[styles.dateText, !value && styles.datePlaceholder]}>
            {value ? formatDate(value) : '期限日を設定'}
          </Text>
          {value && (
            <TouchableOpacity onPress={() => onChange(null)} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </Surface>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(_, date) => {
            setShow(Platform.OS === 'ios');
            if (date) onChange(date);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, backgroundColor: '#fff',
  },
  dateText: { flex: 1, fontSize: 15, color: '#1f2937' },
  datePlaceholder: { color: '#9ca3af' },
});
