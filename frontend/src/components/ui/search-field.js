import { TextInput, View, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { colors, radius, typography } from '../../theme';

export function SearchField({ value, onChangeText, placeholder, testId }) {
  return (
    <View style={styles.searchWrap}>
      <Search color={colors.text.tertiary} size={18} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        style={styles.searchInput}
        data-testid={testId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.text.primary,
    fontFamily: typography.body,
    fontSize: 15,
  },
});
