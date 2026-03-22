import { useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { FrequentAmountItem } from '@/src/application/frequent-amount/get-frequent-amounts/get-frequent-amounts.query';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  frequentAmounts: FrequentAmountItem[];
  style?: ViewStyle;
}

export default function AmountInputWithSuggest({
  value,
  onChangeText,
  frequentAmounts,
  style,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [inputLayout, setInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<View>(null);

  const suggestions = frequentAmounts.filter((item) => {
    if (!value) return true;
    return String(item.amount).startsWith(value) || String(item.amount).includes(value);
  });

  const showSuggestions = focused && suggestions.length > 0 && value !== String(suggestions[0]?.amount);

  const handleBlur = () => {
    // タップ先が FlatList 項目の場合に先に onPress が走るよう遅延
    setTimeout(() => setFocused(false), 150);
  };

  const handleSelect = (amount: number) => {
    onChangeText(String(amount));
    setFocused(false);
  };

  return (
    <>
      <View
        ref={containerRef}
        style={[styles.wrapper, style]}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          setInputLayout({ x, y, width, height });
        }}>
        <Text style={styles.yen}>¥</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          placeholder="0"
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        />
      </View>

      {/* サジェストオーバーレイ */}
      {showSuggestions && (
        <Modal transparent animationType="none" visible>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setFocused(false)}
          />
          <View
            style={[
              styles.suggestContainer,
              {
                top: inputLayout.y + inputLayout.height + 4,
                left: inputLayout.x,
                width: inputLayout.width || 200,
              },
            ]}>
            <FlatList
              data={suggestions.slice(0, 4)}
              keyExtractor={(item) => String(item.amount)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestItem}
                  onPress={() => handleSelect(item.amount)}>
                  <Text style={styles.suggestAmount}>¥{item.amount.toLocaleString()}</Text>
                  <Text style={styles.suggestCount}>{item.count}回</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Modal>
      )}

      {/* 非フォーカス時: クイックボタン行 */}
      {!focused && frequentAmounts.length > 0 && (
        <View style={styles.quickRow}>
          {frequentAmounts.map((item) => (
            <TouchableOpacity
              key={item.amount}
              style={styles.quickChip}
              onPress={() => onChangeText(String(item.amount))}>
              <Text style={styles.quickChipText}>¥{item.amount.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const TINT = '#0a7ea4';

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yen: { fontSize: 20, fontWeight: '600', color: '#333' },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  suggestContainer: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  suggestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  suggestAmount: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  suggestCount: { fontSize: 12, color: '#888' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e8f4f8',
    borderWidth: 1,
    borderColor: '#b3d9eb',
  },
  quickChipText: { fontSize: 13, color: TINT, fontWeight: '600' },
});
