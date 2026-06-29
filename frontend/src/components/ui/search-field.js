import React, { useMemo } from 'react';
import { TextInput, View, StyleSheet } from 'react-native';
import { Search } from 'lucide-react-native';
import { radius, typography } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';

export function SearchField({ value, onChangeText, placeholder, testId }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

function createStyles(colors) {
  return StyleSheet.create({
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
}
