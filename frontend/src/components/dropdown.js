import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useThemeColors } from '../contexts/ThemeContext';
import { radius, typography } from '../theme';

export function Dropdown({ options = [], value, onSelect, label, testId }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  function handleSelect(option) {
    onSelect(option);
    setOpen(false);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
        style={styles.trigger}
        data-testid={testId}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || 'Select...'}
        </Text>
        <ChevronDown color={colors.text.tertiary} size={18} strokeWidth={2} />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <ScrollView style={styles.list} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.6}
                onPress={() => handleSelect(opt)}
                style={[styles.item, value === opt && styles.itemSelected]}
              >
                <Text style={styles.itemText}>{opt}</Text>
                {value === opt && (
                  <Check color={colors.brand.primary} size={18} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  placeholder: { color: colors.text.tertiary },
  dropdown: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  list: { maxHeight: 220 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  itemSelected: { backgroundColor: colors.brand.primarySoft },
  itemText: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
});
}
