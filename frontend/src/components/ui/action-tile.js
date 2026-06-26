import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { Surface } from './surface';

export function ActionTile({ title, subtitle, icon: Icon, onPress, testId }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} data-testid={testId} style={styles.wrapper}>
      <Surface style={styles.card}>
        {Icon && <Icon color={colors.brand.primary} size={22} strokeWidth={2} />}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '47%' },
  card: { padding: 14, gap: 8, minHeight: 120 },
  title: { fontFamily: typography.heading, fontSize: 15, fontWeight: '800', color: colors.text.primary },
  subtitle: { fontFamily: typography.body, fontSize: 12, color: colors.text.secondary, lineHeight: 17 },
});
