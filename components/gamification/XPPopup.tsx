import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface Props {
  xp: number;
  money: number;
  damage: number;
  visible: boolean;
  onHide: () => void;
}

export function XPPopup({ xp, money, damage, visible, onHide }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(1);
    translateY.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 1500, delay: 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -60, duration: 2000, useNativeDriver: true }),
    ]).start(onHide);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.xp}>+{xp} XP</Text>
      <Text style={styles.money}>+{money} 💰</Text>
      <Text style={styles.damage}>⚔️ -{damage}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    alignItems: 'flex-end',
    gap: 2,
    pointerEvents: 'none',
  },
  xp: { color: '#6366f1', fontWeight: '700', fontSize: 18 },
  money: { color: '#f59e0b', fontWeight: '700', fontSize: 16 },
  damage: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});
