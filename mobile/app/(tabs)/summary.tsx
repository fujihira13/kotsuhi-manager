import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSummaryUseCase } from '@/src/infrastructure/di/container';
import { SummaryResult } from '@/src/application/summary/get-summary/get-summary.query';
import { CATEGORY_LABELS, SUBCATEGORY_LABELS, formatAmount } from '@/src/presentation/constants';

type Period = 'this_month' | 'last_month' | 'last_3_months';

const PERIOD_LABELS: Record<Period, string> = {
  this_month: '今月',
  last_month: '先月',
  last_3_months: '過去3ヶ月',
};

export default function SummaryScreen() {
  const [period, setPeriod] = useState<Period>('this_month');
  const [summary, setSummary] = useState<SummaryResult | null>(null);

  const load = useCallback(async () => {
    const result = await getSummaryUseCase.execute({ period });
    setSummary(result);
  }, [period]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>サマリー</Text>
      </View>

      {/* 期間選択 */}
      <View style={styles.periodRow}>
        {(['this_month', 'last_month', 'last_3_months'] as Period[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
            onPress={() => setPeriod(p)}>
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {PERIOD_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {summary && (
          <>
            {/* 合計 */}
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>合計金額</Text>
              <Text style={styles.totalAmount}>{formatAmount(summary.totalAmount)}</Text>
              <Text style={styles.totalPeriod}>
                {summary.period.from} 〜 {summary.period.to}
              </Text>
            </View>

            {/* カテゴリ別内訳 */}
            {summary.breakdown.map((cat) => (
              <View key={cat.category} style={styles.catCard}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{CATEGORY_LABELS[cat.category as keyof typeof CATEGORY_LABELS]}</Text>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmount}>{formatAmount(cat.total)}</Text>
                    <Text style={styles.catShare}>{(cat.share * 100).toFixed(1)}%</Text>
                  </View>
                </View>

                {/* プログレスバー */}
                <View style={styles.progressBg}>
                  <View style={[styles.progressFg, { width: `${cat.share * 100}%` }]} />
                </View>

                {/* サブカテゴリ */}
                {cat.subcategories.map((sub) => (
                  <View key={sub.subcategory} style={styles.subRow}>
                    <Text style={styles.subName}>{SUBCATEGORY_LABELS[sub.subcategory as keyof typeof SUBCATEGORY_LABELS]}</Text>
                    <Text style={styles.subAmount}>{formatAmount(sub.total)}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* 満足度 */}
            {summary.satisfactionStats.average !== null && summary.satisfactionStats.average > 0 && (
              <View style={styles.satCard}>
                <Text style={styles.satTitle}>満足度</Text>
                <Text style={styles.satAvg}>
                  {'★'.repeat(Math.round(summary.satisfactionStats.average!))}
                  {'☆'.repeat(5 - Math.round(summary.satisfactionStats.average!))}
                  {'  '}
                  {summary.satisfactionStats.average!.toFixed(1)}
                </Text>
                <View style={styles.satDist}>
                  {summary.satisfactionStats.distribution.map((d) => (
                    <View key={d.value} style={styles.satDistRow}>
                      <Text style={styles.satDistStar}>★{d.value}</Text>
                      <View style={styles.satBarBg}>
                        <View style={[styles.satBarFg, { width: `${(d.count / (summary.satisfactionStats.distribution.reduce((s, x) => s + x.count, 0) || 1)) * 100}%` }]} />
                      </View>
                      <Text style={styles.satDistCount}>{d.count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {summary.totalAmount === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>この期間の支出はありません</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const TINT = '#0a7ea4';

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
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  periodChipActive: { backgroundColor: TINT },
  periodText: { fontSize: 13, color: '#444' },
  periodTextActive: { color: '#fff', fontWeight: '600' },
  content: { padding: 12, paddingBottom: 40, gap: 12 },
  totalCard: {
    backgroundColor: TINT,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  totalAmount: { fontSize: 32, fontWeight: '800', color: '#fff' },
  totalPeriod: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  catCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontSize: 15, fontWeight: '600' },
  catRight: { alignItems: 'flex-end' },
  catAmount: { fontSize: 15, fontWeight: '700' },
  catShare: { fontSize: 12, color: '#888' },
  progressBg: { height: 6, backgroundColor: '#f0f0f0', borderRadius: 3, marginBottom: 12 },
  progressFg: { height: 6, backgroundColor: TINT, borderRadius: 3 },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f0f0f0',
  },
  subName: { fontSize: 13, color: '#666' },
  subAmount: { fontSize: 13, color: '#444', fontWeight: '600' },
  satCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  satTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  satAvg: { fontSize: 22, color: '#f5a623', marginBottom: 12 },
  satDist: { gap: 6 },
  satDistRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  satDistStar: { width: 28, fontSize: 12, color: '#666' },
  satBarBg: { flex: 1, height: 8, backgroundColor: '#f0f0f0', borderRadius: 4 },
  satBarFg: { height: 8, backgroundColor: '#f5a623', borderRadius: 4 },
  satDistCount: { width: 24, fontSize: 12, color: '#888', textAlign: 'right' },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#aaa' },
});
