import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, typography, shadow } from '../../theme';
import { Surface } from './surface';

const toneBg = { critical: colors.chip.red, warning: colors.chip.orange, safe: colors.chip.green, info: colors.chip.blue };

export function StatCard({ title, value, subtitle, tone = 'info', onPress, testId }) {
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

const styles = StyleSheet.create({
  wrapper: { width: '47%' },
  card: { padding: 14, gap: 6 },
  title: { fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  value: { fontFamily: typography.heading, fontSize: 24, fontWeight: '800' },
  subtitle: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
});
