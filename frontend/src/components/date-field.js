import { useMemo } from 'react';
import { Platform, Text, TextInput, View, StyleSheet } from 'react-native';
import { radius, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';

export function DateField({ label, value, onChangeText, placeholder, testId, mode = 'date' }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const inputType = mode === 'datetime' ? 'datetime-local' : 'date';
  const fallbackPlaceholder = placeholder || (mode === 'datetime' ? '2026-06-26 14:00' : '2026-06-26');

  if (Platform.OS === 'web') {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <input
          type={inputType}
          value={value || ''}
          onChange={(e) => onChangeText(e.target.value)}
          data-testid={testId}
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: 12,
            backgroundColor: colors.surface,
            color: colors.text.primary,
            fontFamily: typography.body,
            fontSize: 14,
            width: '100%',
            boxSizing: 'border-box',
            outline: 'none',
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={fallbackPlaceholder}
        placeholderTextColor={colors.text.tertiary}
        style={styles.input}
        data-testid={testId}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  field: {
    gap: 6,
    flex: 1,
  },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    color: colors.text.primary,
    fontFamily: typography.body,
    fontSize: 14,
  },
});
}
