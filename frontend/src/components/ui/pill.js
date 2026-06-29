import { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { typography } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';

export function Pill({ label, tone = 'gray' }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.pill, styles[`pill_${tone}`]]}>
      <Text style={[styles.pillText, styles[`pillText_${tone}`]]}>{label}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  pill: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '600',
  },
  pill_gray: { backgroundColor: colors.chip.gray },
  pill_blue: { backgroundColor: colors.chip.blue },
  pill_green: { backgroundColor: colors.chip.green },
  pill_orange: { backgroundColor: colors.chip.orange },
  pill_red: { backgroundColor: colors.chip.red },
  pillText_gray: { color: colors.text.secondary },
  pillText_blue: { color: colors.brand.primary },
  pillText_green: { color: colors.status.safe },
  pillText_orange: { color: colors.status.warning },
  pillText_red: { color: colors.status.critical },
});
}
