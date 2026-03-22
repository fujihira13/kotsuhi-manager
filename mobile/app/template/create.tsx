import { useState } from 'react';
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
import { useRouter } from 'expo-router';

import { createTemplateUseCase } from '@/src/infrastructure/di/container';
import { CategoryValue } from '@/src/domain/shared/value-objects/category.vo';
import { SubcategoryValue } from '@/src/domain/shared/value-objects/subcategory.vo';
import {
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  TRANSPORTATION_SUBCATEGORIES,
  ENTERTAINMENT_SUBCATEGORIES,
} from '@/src/presentation/constants';

export default function TemplateCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryValue>('transportation');
  const [subcategory, setSubcategory] = useState<SubcategoryValue>('train');
  const [amount, setAmount] = useState('');
  const [memoTemplate, setMemoTemplate] = useState('');
  const [saving, setSaving] = useState(false);

  const subcategories =
    category === 'transportation' ? TRANSPORTATION_SUBCATEGORIES : ENTERTAINMENT_SUBCATEGORIES;

  const handleCategoryChange = (cat: CategoryValue) => {
    setCategory(cat);
    setSubcategory(cat === 'transportation' ? 'train' : 'meal');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('入力エラー', 'テンプレート名を入力してください');
      return;
    }
    const amountNum = amount ? parseInt(amount, 10) : null;
    if (amount && (isNaN(amountNum!) || amountNum! < 1)) {
      Alert.alert('入力エラー', '金額は1以上の整数で入力してください');
      return;
    }
    setSaving(true);
    try {
      await createTemplateUseCase.execute({
        name: name.trim(),
        category,
        subcategory,
        amount: amountNum,
        memoTemplate: memoTemplate.trim() || null,
      });
      router.back();
    } catch {
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

        <Text style={styles.label}>テンプレート名</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="例: 電車（新橋→渋谷）"
          returnKeyType="next"
        />

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

        <Text style={styles.label}>金額（任意・未設定なら登録時に入力）</Text>
        <View style={styles.amountRow}>
          <Text style={styles.yen}>¥</Text>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="number-pad"
            placeholder="未設定"
          />
        </View>

        <Text style={styles.label}>メモテンプレート（任意）</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          value={memoTemplate}
          onChangeText={setMemoTemplate}
          placeholder="登録時に自動入力されるメモ"
          multiline
        />

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
  memoInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
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
