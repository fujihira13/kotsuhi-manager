import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  listTemplatesUseCase,
  deleteTemplateUseCase,
  createExpenseUseCase,
  reorderTemplatesUseCase,
} from '@/src/infrastructure/di/container';
import { TemplateListItem } from '@/src/application/template/list-templates/list-templates.query';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  formatAmount,
  todayString,
} from '@/src/presentation/constants';

export default function TemplatesScreen() {
  const router = useRouter();
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);

  const load = useCallback(async () => {
    const result = await listTemplatesUseCase.execute();
    setTemplates(result);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const handleUseTemplate = async (template: TemplateListItem) => {
    if (template.amount) {
      // 金額が設定済み → 今日の日付で即登録
      Alert.alert(
        'テンプレートから登録',
        `${template.name}\n${formatAmount(template.amount)}\n\n今日の日付で登録しますか？`,
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: '登録する',
            onPress: async () => {
              await createExpenseUseCase.execute({
                date: todayString(),
                amount: template.amount!,
                category: template.category,
                subcategory: template.subcategory,
                memo: template.memoTemplate ?? null,
              });
              router.push('/');
            },
          },
        ],
      );
    } else {
      // 金額未設定 → 登録フォームに遷移
      router.push({
        pathname: '/expense/create',
        params: {
          category: template.category,
          subcategory: template.subcategory,
          memo: template.memoTemplate ?? '',
        },
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newTemplates = [...templates];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTemplates[index], newTemplates[targetIndex]] = [newTemplates[targetIndex], newTemplates[index]];
    setTemplates(newTemplates);
    await reorderTemplatesUseCase.execute({ orderedIds: newTemplates.map((t) => t.id) });
  };

  const handleDelete = (template: TemplateListItem) => {
    Alert.alert('削除確認', `「${template.name}」を削除しますか？`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          await deleteTemplateUseCase.execute({ id: template.id });
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>テンプレート</Text>
        <TouchableOpacity onPress={() => router.push('/template/create')}>
          <Text style={styles.headerAdd}>＋ 追加</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>テンプレートがありません</Text>
            <Text style={styles.emptyHint}>よく使う支出を登録しておくと便利です</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable style={styles.card} onPress={() => handleUseTemplate(item)}>
            {/* 並び替えボタン */}
            <View style={styles.sortBtns}>
              <TouchableOpacity
                style={[styles.sortBtn, index === 0 && styles.sortBtnDisabled]}
                onPress={() => handleMove(index, 'up')}
                disabled={index === 0}>
                <Text style={styles.sortBtnText}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortBtn, index === templates.length - 1 && styles.sortBtnDisabled]}
                onPress={() => handleMove(index, 'down')}
                disabled={index === templates.length - 1}>
                <Text style={styles.sortBtnText}>▼</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardLeft}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}</Text>
                </View>
                <View style={[styles.badge, styles.badgeSub]}>
                  <Text style={styles.badgeText}>{SUBCATEGORY_LABELS[item.subcategory as keyof typeof SUBCATEGORY_LABELS]}</Text>
                </View>
              </View>
              {item.memoTemplate ? (
                <Text style={styles.cardMemo} numberOfLines={1}>{item.memoTemplate}</Text>
              ) : null}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmount}>
                {item.amount ? formatAmount(item.amount) : '金額未設定'}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => router.push(`/template/${item.id}`)}>
                  <Text style={styles.actionEdit}>編集</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
                  <Text style={styles.actionDelete}>削除</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const TINT = '#0a7ea4';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerAdd: { fontSize: 15, color: TINT, fontWeight: '600' },
  list: { padding: 12, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
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
  cardLeft: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  badge: { backgroundColor: '#e8f4f8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeSub: { backgroundColor: '#f0f0f0' },
  badgeText: { fontSize: 11, color: '#555' },
  cardMemo: { fontSize: 12, color: '#888', marginTop: 2 },
  sortBtns: { justifyContent: 'center', gap: 2, marginRight: 8 },
  sortBtn: { padding: 4 },
  sortBtnDisabled: { opacity: 0.2 },
  sortBtnText: { fontSize: 11, color: '#888' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  cardAmount: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  actionEdit: { fontSize: 13, color: TINT },
  actionDelete: { fontSize: 13, color: '#e53935' },
  empty: { paddingTop: 60, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 15, color: '#aaa' },
  emptyHint: { fontSize: 13, color: '#ccc' },
});
