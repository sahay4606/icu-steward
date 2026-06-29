import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { radius, shadow } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';

export function Surface({ children, style, ...props }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View {...props} style={[styles.surface, style]}>
      {children}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    surface: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: radius.md,
      ...shadow.low,
    },
  });
}
