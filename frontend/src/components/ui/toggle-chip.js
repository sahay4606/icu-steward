import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../../theme';

export function ToggleChip({ label, selected, onPress, testId }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      data-testid={testId}
      style={[styles.toggleChip, selected && styles.toggleChipSelected]}
    >
      <Text style={[styles.toggleChipText, selected && styles.toggleChipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleChip: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleChipSelected: {
    backgroundColor: colors.brand.primary,
    borderColor: colors.brand.primary,
  },
  toggleChipText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  toggleChipTextSelected: {
    color: colors.text.inverse,
  },
});
