import React, { useState } from 'react';
import { TouchableOpacity, Platform, StyleSheet, NativeModules, TextInput, View, Modal } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from './Button';

// TurboModule interop が無効な環境（旧アーキテクチャ）でクラッシュしないよう動的ロード
const hasNativeDatePicker = !!NativeModules.RNCDatePicker;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DateTimePicker = hasNativeDatePicker
  ? (require('@react-native-community/datetimepicker').default as React.ComponentType<any>)
  : null;

interface Props {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

const formatDate = (date: Date) =>
  `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;

/** ネイティブピッカーが使えない環境向けのテキスト入力フォールバック */
function DateInputFallback({ value, onChange }: Props) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState(value ? formatDate(value) : '');

  const handleConfirm = () => {
    const match = text.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (match) {
      const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      if (!isNaN(d.getTime())) {
        onChange(d);
        setShow(false);
        return;
      }
    }
    setText(value ? formatDate(value) : '');
    setShow(false);
  };

  return (
    <>
      <TouchableOpacity onPress={() => { setText(value ? formatDate(value) : ''); setShow(true); }}>
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
      <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShow(false)} />
        <View style={styles.dialog}>
          <Text variant="titleSmall" style={styles.dialogTitle}>期限日を入力</Text>
          <TextInput
            style={styles.textInput}
            value={text}
            onChangeText={setText}
            placeholder="YYYY/MM/DD"
            keyboardType="numeric"
            autoFocus
          />
          <View style={styles.dialogRow}>
            <Button label="キャンセル" mode="text" onPress={() => setShow(false)} />
            <Button label="決定" mode="contained" onPress={handleConfirm} />
          </View>
        </View>
      </Modal>
    </>
  );
}

export function DatePickerField({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  // ネイティブピッカーが使えない場合はフォールバック
  if (!DateTimePicker) {
    return <DateInputFallback value={value} onChange={onChange} />;
  }

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
          onChange={(_, date: Date | undefined) => {
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  dialog: {
    position: 'absolute', left: 32, right: 32, top: '40%',
    backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 12,
  },
  dialogTitle: { color: '#1f2937', fontWeight: '700' },
  textInput: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    padding: 10, fontSize: 16, color: '#1f2937',
  },
  dialogRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
