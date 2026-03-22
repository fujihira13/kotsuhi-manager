import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  createExpenseUseCase,
  getLastInputUseCase,
  getFrequentAmountsUseCase,
} from '@/src/infrastructure/di/container';
import { FrequentAmountItem } from '@/src/application/frequent-amount/get-frequent-amounts/get-frequent-amounts.query';
import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo';
import { SubcategoryValue } from '@/src/domain/shared/value-objects/subcategory.vo';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  TRANSPORTATION_SUBCATEGORIES,
  ENTERTAINMENT_SUBCATEGORIES,
  todayString,
} from '@/src/presentation/constants';

export default function ExpenseCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    subcategory?: string;
    memo?: string;
  }>();

  const [date, setDate] = useState(todayString());
  const [category, setCategory] = useState<CategoryValue>('transportation');
  const [subcategory, setSubcategory] = useState<SubcategoryValue>('train');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [frequentAmounts, setFrequentAmounts] = useState<FrequentAmountItem[]>([]);

  useEffect(() => {
    const loadLastInput = async () => {
      const cat = params.category as CategoryValue | undefined;
      const sub = params.subcategory as SubcategoryValue | undefined;
      if (cat) {
        setCategory(cat);
        setSubcategory(sub ?? 'train');
        setMemo(params.memo ?? '');
        return;
      }
      const last = await getLastInputUseCase.execute();
      if (last.category) setCategory(last.category);
      if (last.subcategory) setSubcategory(last.subcategory);
      if (last.memo) setMemo(last.memo);
    };
    const loadFrequentAmounts = async () => {
      const result = await getFrequentAmountsUseCase.execute({ windowDays: 90, limit: 5 });
      setFrequentAmounts(result);
    };
    loadLastInput();
    loadFrequentAmounts();
  }, []);

  const subcategories =
    category === 'transportation' ? TRANSPORTATION_SUBCATEGORIES : ENTERTAINMENT_SUBCATEGORIES;

  const handleCategoryChange = (cat: CategoryValue) => {
    setCategory(cat);
    setSubcategory(cat === 'transportation' ? 'train' : 'meal');
  };

  const handleSave = async () => {
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('入力エラー', '日付は YYYY-MM-DD 形式で入力してください');
      return;
    }
    const amountNum = parseInt(amount, 10);
    if (!amount || isNaN(amountNum) || amountNum < 1) {
      Alert.alert('入力エラー', '金額を正しく入力してください（1以上の整数）');
      return;
    }
    setSaving(true);
    try {
      await createExpenseUseCase.execute({
        date,
        amount: amountNum,
        category,
        subcategory,
        memo: memo.trim() || null,
        satisfaction: satisfaction ?? null,
      });
      router.back();
    } catch (e) {
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* 日付 */}
        <Text style={styles.label}>日付</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
          <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayString())}>
            <Text style={styles.todayBtnText}>今日</Text>
          </TouchableOpacity>
        </View>

        {/* カテゴリ */}
        <Text style={styles.label}>カテゴリ</Text>
        <View style={styles.chipRow}>
          {(['transportation', 'entertainment'] as CategoryValue[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => handleCategoryChange(cat)}>
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* サブカテゴリ */}
        <Text style={styles.label}>サブカテゴリ</Text>
        <View style={styles.chipRow}>
          {subcategories.map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[styles.chip, subcategory === sub && styles.chipActive]}
              onPress={() => setSubcategory(sub)}>
              <Text style={[styles.chipText, subcategory === sub && styles.chipTextActive]}>
                {SUBCATEGORY_LABELS[sub]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 金額 */}
        <Text style={styles.label}>金額</Text>
        <View style={styles.amountRow}>
          <Text style={styles.yen}>¥</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="0"
          />
        </View>
        {frequentAmounts.length > 0 && (
          <View style={styles.frequentRow}>
            {frequentAmounts.map((item) => (
              <TouchableOpacity
                key={item.amount}
                style={styles.frequentChip}
                onPress={() => setAmount(String(item.amount))}>
                <Text style={styles.frequentChipText}>¥{item.amount.toLocaleString()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* メモ */}
        <Text style={styles.label}>メモ（任意）</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          value={memo}
          onChangeText={setMemo}
          placeholder="メモを入力"
          multiline
        />

        {/* 満足度 */}
        <Text style={styles.label}>満足度（任意）</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setSatisfaction(satisfaction === n ? null : n)}>
              <Text style={satisfaction && satisfaction >= n ? styles.starOn : styles.starOff}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 登録ボタン */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? '登録中...' : '登録する'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TINT = '#0a7ea4';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 13, fontWeight: '600', color: '#666', marginTop: 20, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  dateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  todayBtn: {
    backgroundColor: '#e8f4f8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  todayBtnText: { fontSize: 14, color: TINT, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  chipActive: { backgroundColor: TINT },
  chipText: { fontSize: 14, color: '#444' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yen: { fontSize: 20, fontWeight: '600', color: '#333' },
  frequentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  frequentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#b3d9eb',
  },
  frequentChipText: { fontSize: 13, color: '#0a7ea4', fontWeight: '600' },
  memoInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  stars: { flexDirection: 'row', gap: 8 },
  starOn: { fontSize: 32, color: '#f5a623' },
  starOff: { fontSize: 32, color: '#ddd' },
  saveBtn: {
    marginTop: 32,
    backgroundColor: TINT,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
