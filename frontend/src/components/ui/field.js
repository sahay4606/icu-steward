import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { typography } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';

export function Field({ label, value }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '—'}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 8 },
    label: { fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, flex: 1 },
    value: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary, textAlign: 'right', flex: 1.5 },
  });
}
