import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { clearAllDataUseCase } from '@/src/infrastructure/di/container';

export default function SettingsScreen() {
  const [clearing, setClearing] = useState(false);

  const handleClearAll = () => {
    Alert.alert(
      '全データ削除',
      '支出・テンプレート・設定値をすべて削除します。\nこの操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await clearAllDataUseCase.execute({});
              Alert.alert('完了', 'すべてのデータを削除しました');
            } catch {
              Alert.alert('エラー', '削除に失敗しました');
            } finally {
              setClearing(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>設定</Text>
      </View>

      {/* データ保存について */}
      <View style={styles.noticeCard}>
        <Text style={styles.noticeTitle}>データ保存について</Text>
        <Text style={styles.noticeText}>
          データはこの端末内にのみ保存されます。{'\n'}
          アプリを削除するとデータも削除されます。{'\n'}
          クラウドへの同期は行われません。
        </Text>
      </View>

      {/* 危険な操作 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>データ管理</Text>
        <TouchableOpacity
          style={[styles.dangerRow, clearing && styles.dangerRowDisabled]}
          onPress={handleClearAll}
          disabled={clearing}>
          <Text style={styles.dangerText}>
            {clearing ? '削除中...' : '全データを削除'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  noticeCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  noticeTitle: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  noticeText: { fontSize: 13, color: '#666', lineHeight: 20 },
  section: { marginHorizontal: 16 },
  sectionTitle: { fontSize: 12, color: '#888', marginBottom: 8, marginLeft: 4 },
  dangerRow: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  dangerRowDisabled: { opacity: 0.5 },
  dangerText: { fontSize: 16, fontWeight: '600', color: '#e53935' },
});
