import {
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
  return (
    <>
      <View style={[styles.wrapper, style]}>
        <Text style={styles.yen}>¥</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType="number-pad"
          placeholder="0"
        />
      </View>

      {/* クイックボタン行 */}
      {frequentAmounts.length > 0 && (
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
