import React, { useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { radius, typography, shadow } from '../../theme';
import { useThemeColors } from '../../contexts/ThemeContext';
import { Surface } from './surface';

export function StatCard({ title, value, subtitle, tone = 'info', onPress, testId }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} data-testid={testId} style={styles.wrapper}>
      <Surface style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: tone !== 'info' ? colors.status[tone] : colors.text.primary }]}>{value}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Surface>
    </TouchableOpacity>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    wrapper: { width: '47%' },
    card: { padding: 14, gap: 6 },
    title: { fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
    value: { fontFamily: typography.heading, fontSize: 24, fontWeight: '800' },
    subtitle: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
  });
}
