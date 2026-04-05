import { useEffect, useState } from 'react';
import {
  Alert,
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
  createExpenseUseCase,
  getLastInputUseCase,
  getFrequentAmountsUseCase,
} from '@/src/infrastructure/di/container';
import { FrequentAmountItem } from '@/src/application/frequent-amount/get-frequent-amounts/get-frequent-amounts.query';
import AmountInputWithSuggest from '@/src/presentation/components/AmountInputWithSuggest';
import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo';
import { SubcategoryValue } from '@/src/domain/shared/value-objects/subcategory.vo';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  TRANSPORTATION_SUBCATEGORIES,
  ENTERTAINMENT_SUBCATEGORIES,
  TRIP_TYPE_LABELS,
  TripTypeValue,
  todayString,
  toLocalDateString,
  formatDateLong,
} from '@/src/presentation/constants';

export default function ExpenseCreateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    category?: string;
    subcategory?: string;
    memo?: string;
  }>();

  const [date, setDate] = useState(todayString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState<CategoryValue>('transportation');
  const [subcategory, setSubcategory] = useState<SubcategoryValue>('train');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [frequentAmounts, setFrequentAmounts] = useState<FrequentAmountItem[]>([]);
  const [tripType, setTripType] = useState<TripTypeValue>('one-way');

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
    if (cat !== 'transportation') setTripType('one-way');
  };

  const handleUsePrevMemo = async () => {
    const last = await getLastInputUseCase.execute();
    if (last.memo) {
      setMemo(last.memo);
    } else {
      Alert.alert('前回メモなし', '前回入力したメモがありません');
    }
  };

  const handleUseLastInput = async () => {
    const last = await getLastInputUseCase.execute();
    if (!last.category) {
      Alert.alert('前回データなし', '前回の入力記録がありません');
      return;
    }
    setCategory(last.category);
    setSubcategory(last.subcategory ?? 'train');
    setMemo(last.memo ?? '');
    if (last.amount) setAmount(String(last.amount));
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
      console.error('Save expense error:', e);
      Alert.alert('エラー', '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

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
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.input, styles.dateButton, { flex: 1 }]}
            onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{formatDateLong(date)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.todayBtn} onPress={() => setDate(todayString())}>
            <Text style={styles.todayBtnText}>今日</Text>
          </TouchableOpacity>
        </View>
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

        {/* 前回と同じ内容を使用 */}
        <TouchableOpacity style={styles.lastInputBtn} onPress={handleUseLastInput}>
          <Text style={styles.lastInputBtnText}>↩ 前回と同じ内容を使用</Text>
        </TouchableOpacity>

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

        {/* 片道/往復（交通費のみ） */}
        {category === 'transportation' && (
          <>
            <Text style={styles.label}>片道 / 往復</Text>
            <View style={styles.chipRow}>
              {(['one-way', 'round-trip'] as TripTypeValue[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, tripType === t && styles.chipActive]}
                  onPress={() => {
                    if (t === 'round-trip' && tripType === 'one-way') {
                      const n = parseInt(amount, 10);
                      if (!isNaN(n) && n >= 1) setAmount(String(n * 2));
                    }
                    setTripType(t);
                  }}>
                  <Text style={[styles.chipText, tripType === t && styles.chipTextActive]}>
                    {TRIP_TYPE_LABELS[t]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* 金額 */}
        <Text style={styles.label}>金額</Text>
        <AmountInputWithSuggest
          value={amount}
          onChangeText={setAmount}
          frequentAmounts={frequentAmounts}
        />

        {/* メモ */}
        <View style={styles.memoLabelRow}>
          <Text style={styles.label}>メモ（任意）</Text>
          <TouchableOpacity onPress={handleUsePrevMemo}>
            <Text style={styles.memoQuoteBtn}>前回を引用</Text>
          </TouchableOpacity>
        </View>
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
  dateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
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
  memoLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  memoQuoteBtn: { fontSize: 12, color: TINT, fontWeight: '600' },
  lastInputBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#f0f7fb',
    borderWidth: 1,
    borderColor: '#b3d9eb',
    alignSelf: 'flex-start',
  },
  lastInputBtnText: { fontSize: 13, color: TINT, fontWeight: '600' },
});
