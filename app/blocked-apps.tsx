import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Switch, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { useBlockerStore } from '../store/blockerStore';
import { useSettingsStore } from '../store/settingsStore';
import {
  hasUsagePermission,
  openUsageSettings,
  getInstalledApps,
  startMonitoring,
  stopMonitoring,
  type InstalledApp,
} from 'app-blocker';

export default function BlockedAppsScreen() {
  const router = useRouter();
  const { blockedPackages, load, toggle } = useBlockerStore();
  const { lockEnabled } = useSettingsStore();
  const [apps, setApps] = useState<InstalledApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    load();
    if (Platform.OS === 'android') {
      const perm = hasUsagePermission();
      setHasPermission(perm);
      if (perm) {
        setApps(getInstalledApps());
      }
    }
    setLoading(false);
  }, []);

  const handleRequestPermission = () => {
    openUsageSettings();
  };

  const handleToggle = async (pkg: string) => {
    await toggle(pkg);
    // 監視サービスを新しいリストで再起動
    if (lockEnabled && hasPermission) {
      const updated = blockedPackages.includes(pkg)
        ? blockedPackages.filter((p) => p !== pkg)
        : [...blockedPackages, pkg];
      if (updated.length > 0) {
        stopMonitoring();
        startMonitoring(updated);
      } else {
        stopMonitoring();
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="戻る" onPress={() => router.back()} mode="text" />
        <Text variant="titleMedium" style={styles.title}>ブロックするアプリ</Text>
        <View style={{ width: 60 }} />
      </View>

      {!hasPermission ? (
        <View style={styles.permBox}>
          <Text variant="titleSmall" style={styles.permTitle}>権限が必要です</Text>
          <Text variant="bodyMedium" style={styles.permText}>
            「使用状況へのアクセス」で GamingTask をオンにしてください。
          </Text>
          <Button label="使用状況の設定を開く →" onPress={handleRequestPermission} />
          <Button
            label="設定後にリロード"
            mode="outlined"
            onPress={() => {
              const perm = hasUsagePermission();
              setHasPermission(perm);
              if (perm) setApps(getInstalledApps());
            }}
          />
        </View>
      ) : (
        <FlatList
          data={apps}
          keyExtractor={(item) => item.packageName}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text variant="bodyMedium" style={styles.appName} numberOfLines={1}>
                {item.appName}
              </Text>
              <Text variant="labelSmall" style={styles.pkg} numberOfLines={1}>
                {item.packageName}
              </Text>
              <Switch
                value={blockedPackages.includes(item.packageName)}
                onValueChange={() => handleToggle(item.packageName)}
                color="#6366f1"
              />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 12,
  },
  title: { fontWeight: '700', color: '#1f2937' },
  permBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  permTitle: { fontWeight: '700', color: '#1f2937' },
  permText: { color: '#6b7280', textAlign: 'center' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#fff', gap: 8,
  },
  appName: { flex: 1, color: '#1f2937', fontWeight: '500' },
  pkg: { color: '#9ca3af', maxWidth: 160 },
  separator: { height: 1, backgroundColor: '#f3f4f6' },
});
