import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listExpensesUseCase,
  deleteExpenseUseCase,
} from '@/src/infrastructure/di/container';
import { ExpenseListItem } from '@/src/application/expense/list-expenses/list-expenses.query';
import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  formatAmount,
  formatMonth,
  currentMonthString,
  prevMonth,
  nextMonth,
} from '@/src/presentation/constants';

export default function ExpenseListScreen() {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonthString());
  const [category, setCategory] = useState<CategoryValue | undefined>();
  const [expenses, setExpenses] = useState<ExpenseListItem[]>([]);

  const load = useCallback(async () => {
    const result = await listExpensesUseCase.execute({ month, category });
    setExpenses(result);
  }, [month, category]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleDelete = (id: string) => {
    Alert.alert('削除確認', 'この支出を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteExpenseUseCase.execute({ id });
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 月ナビゲーション */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={() => setMonth(prevMonth(month))} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{formatMonth(month)}</Text>
        <TouchableOpacity onPress={() => setMonth(nextMonth(month))} style={styles.monthArrow}>
          <Text style={styles.monthArrowText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* カテゴリフィルター */}
      <View style={styles.filterRow}>
        {([undefined, 'transportation', 'entertainment'] as const).map((cat) => (
          <TouchableOpacity
            key={cat ?? 'all'}
            style={[styles.filterChip, category === cat && styles.filterChipActive]}
            onPress={() => setCategory(cat)}>
            <Text style={[styles.filterChipText, category === cat && styles.filterChipTextActive]}>
              {cat ? CATEGORY_LABELS[cat] : '全て'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 支出リスト */}
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>支出がありません</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/expense/${item.id}`)}>
            <View style={styles.cardLeft}>
              <Text style={styles.cardDate}>{item.date.slice(5)}</Text>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{SUBCATEGORY_LABELS[item.subcategory as keyof typeof SUBCATEGORY_LABELS]}</Text>
              </View>
            </View>
            <View style={styles.cardCenter}>
              {item.memo ? <Text style={styles.cardMemo} numberOfLines={1}>{item.memo}</Text> : null}
              {item.satisfaction ? (
                <Text style={styles.cardStar}>{'★'.repeat(item.satisfaction)}{'☆'.repeat(5 - item.satisfaction)}</Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>{formatAmount(item.amount)}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={8}>
                <Text style={styles.deleteBtn}>🗑</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
      />

      {/* 合計 */}
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>合計</Text>
        <Text style={styles.footerAmount}>{formatAmount(total)}</Text>
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/expense/create')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const TINT = '#0a7ea4';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  monthArrow: { paddingHorizontal: 20, paddingVertical: 4 },
  monthArrowText: { fontSize: 24, color: TINT },
  monthLabel: { fontSize: 17, fontWeight: '600', minWidth: 120, textAlign: 'center' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: { backgroundColor: TINT },
  filterChipText: { fontSize: 13, color: '#444' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingVertical: 8, paddingBottom: 120 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { alignItems: 'center', width: 60 },
  cardDate: { fontSize: 13, color: '#666', marginBottom: 4 },
  cardBadge: {
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardBadgeText: { fontSize: 11, color: TINT },
  cardCenter: { flex: 1, paddingHorizontal: 10 },
  cardMemo: { fontSize: 13, color: '#555', marginBottom: 2 },
  cardStar: { fontSize: 11, color: '#f5a623' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardAmount: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  deleteBtn: { fontSize: 18 },
  empty: { paddingTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 15, color: '#aaa' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  footerLabel: { fontSize: 15, color: '#666' },
  footerAmount: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: TINT,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});
