import { useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import {
  getExpenseByIdUseCase,
  updateExpenseUseCase,
  deleteExpenseUseCase,
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
  toLocalDateString,
} from '@/src/presentation/constants';

export default function ExpenseEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<CategoryValue>('transportation');
  const [subcategory, setSubcategory] = useState<SubcategoryValue>('train');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [frequentAmounts, setFrequentAmounts] = useState<FrequentAmountItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const expense = await getExpenseByIdUseCase.execute({ id });
        setDate(expense.date);
        setCategory(expense.category as CategoryValue);
        setSubcategory(expense.subcategory as SubcategoryValue);
        setAmount(String(expense.amount));
        setMemo(expense.memo ?? '');
        setSatisfaction(expense.satisfaction ?? null);
      } catch {
        Alert.alert('エラー', '支出が見つかりません');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    const loadFrequent = async () => {
      const result = await getFrequentAmountsUseCase.execute({ windowDays: 90, limit: 5 });
      setFrequentAmounts(result);
    };
    load();
    loadFrequent();
  }, [id]);

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
      await updateExpenseUseCase.execute({
        id,
        date,
        amount: amountNum,
        category,
        subcategory,
        memo: memo.trim() || null,
        satisfaction: satisfaction ?? null,
      });
      router.back();
    } catch (e) {
      console.error('Update expense error:', e);
      Alert.alert('エラー', '更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('削除確認', 'この支出を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpenseUseCase.execute({ id });
            router.back();
          } catch {
            Alert.alert('エラー', '削除に失敗しました');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled">

        {/* 日付 */}
        <Text style={styles.label}>日付</Text>
        <TouchableOpacity
          style={[styles.input, styles.dateButton]}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateButtonText}>{date}</Text>
        </TouchableOpacity>
        {Platform.OS === 'android' && showDatePicker && (
          <DateTimePicker
            value={new Date(date + 'T00:00:00')}
            mode="date"
            display="default"
            onChange={(_, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(toLocalDateString(selected));
            }}
          />
        )}
        {Platform.OS === 'ios' && (
          <Modal transparent visible={showDatePicker} animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalDone}>完了</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={new Date(date + 'T00:00:00')}
                  mode="date"
                  display="spinner"
                  onChange={(_, selected) => {
                    if (selected) setDate(toLocalDateString(selected));
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

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
          <TouchableOpacity
            style={styles.doubleBtn}
            onPress={() => {
              const n = parseInt(amount, 10);
              if (!isNaN(n) && n >= 1) setAmount(String(n * 2));
            }}>
            <Text style={styles.doubleBtnText}>×2</Text>
          </TouchableOpacity>
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

        {/* 更新ボタン */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? '更新中...' : '更新する'}</Text>
        </TouchableOpacity>

        {/* 削除ボタン */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>削除する</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const TINT = '#0a7ea4';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 120 },
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
  dateButton: { justifyContent: 'center' },
  dateButtonText: { fontSize: 16, color: '#1a1a1a' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  modalDone: { fontSize: 16, color: '#0a7ea4', fontWeight: '600' },
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
  doubleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#b3d9eb',
  },
  doubleBtnText: { fontSize: 14, color: '#0a7ea4', fontWeight: '700' },
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
  deleteBtn: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  deleteBtnText: { fontSize: 17, fontWeight: '600', color: '#e53935' },
});
