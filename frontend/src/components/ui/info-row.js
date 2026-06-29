import { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { typography } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';

export function InfoRow({ label, value, valueTone = 'primary' }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, styles[`value_${valueTone}`]]}>{value}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  infoLabel: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  infoValue: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.text.primary,
  },
  value_primary: { color: colors.text.primary },
  value_info: { color: colors.status.info },
  value_safe: { color: colors.status.safe },
  value_warning: { color: colors.status.warning },
  value_critical: { color: colors.status.critical },
});
}
