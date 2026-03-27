import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useProfile } from '../../hooks/useProfile';
import { useAuthStore } from '../../store/authStore';
import { XPBar } from '../../components/gamification/XPBar';
import { CoinDisplay } from '../../components/gamification/CoinDisplay';
import { BadgeCard } from '../../components/gamification/BadgeCard';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, badges } = useProfile();
  const { logout } = useAuthStore();

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* アバター & 基本情報 */}
        <Surface style={styles.card}>
          <View style={styles.avatarRow}>
            <TouchableOpacity onPress={() => router.push('/avatar')}>
              <Avatar.Text size={72} label={profile.displayName.charAt(0).toUpperCase()} style={styles.avatar} />
            </TouchableOpacity>
            <View style={styles.info}>
              <Text variant="titleLarge" style={styles.name}>{profile.displayName}</Text>
              <XPBar level={profile.level} xp={profile.xp} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <CoinDisplay amount={profile.money} size="medium" />
            <View style={styles.ticketBadge}>
              <Text style={styles.ticketText}>🎫 x{profile.gachaTickets}</Text>
            </View>
          </View>
        </Surface>

        {/* ボタン */}
        <View style={styles.btnRow}>
          <Button
            label="ショップ"
            onPress={() => router.push('/shop')}
            mode="outlined"
            style={styles.halfBtn}
          />
          <Button
            label="ガチャを引く"
            onPress={() => router.push('/gacha')}
            style={styles.halfBtn}
          />
        </View>

        {/* バッジ */}
        {badges.length > 0 && (
          <Surface style={styles.card}>
            <Text variant="titleSmall" style={styles.sectionTitle}>バッジ</Text>
            <View style={styles.badgeGrid}>
              {badges.map((b) => (
                <BadgeCard key={b.id} badge={b} />
              ))}
            </View>
          </Surface>
        )}

        {/* 累計実績 */}
        <Surface style={styles.card}>
          <Text variant="titleSmall" style={styles.sectionTitle}>累計実績</Text>
          <View style={styles.achieveRow}>
            <Text variant="labelMedium" style={styles.achieveLabel}>累計獲得コイン</Text>
            <CoinDisplay amount={profile.totalMoneyEarned} size="small" />
          </View>
          <View style={styles.achieveRow}>
            <Text variant="labelMedium" style={styles.achieveLabel}>累計XP</Text>
            <Text variant="labelMedium" style={styles.achieveVal}>{profile.totalXp} XP</Text>
          </View>
          <View style={styles.achieveRow}>
            <Text variant="labelMedium" style={styles.achieveLabel}>最長ストリーク</Text>
            <Text variant="labelMedium" style={styles.achieveVal}>{profile.longestStreak} 日</Text>
          </View>
        </Surface>

        <Button label="設定" onPress={() => router.push('/settings')} mode="outlined" />
        <Button label="ログアウト" onPress={logout} mode="outlined" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, backgroundColor: '#fff', gap: 12 },
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  avatar: { backgroundColor: '#6366f1' },
  info: { flex: 1, gap: 8 },
  name: { color: '#1f2937', fontWeight: '700' },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ticketBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ticketText: { color: '#d97706', fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 12 },
  halfBtn: { flex: 1 },
  sectionTitle: { color: '#374151', fontWeight: '700' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  achieveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  achieveLabel: { color: '#6b7280' },
  achieveVal: { color: '#374151', fontWeight: '600' },
});
