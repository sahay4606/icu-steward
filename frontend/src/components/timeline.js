import { View, Text, StyleSheet } from 'react-native';
import { CircleDot, GitCommitHorizontal } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../theme';
import { formatDateTime } from '../lib/format';
import { Pill } from './ui';

export function Timeline({ items = [] }) {
  return (
    <View style={styles.wrapper}>
      {items.map((item, index) => (
        <View key={item.id} style={styles.row}>
          <View style={styles.markerColumn}>
            {index === 0 ? (
              <GitCommitHorizontal color={colors.brand.primary} size={18} strokeWidth={2} />
            ) : (
              <CircleDot color={colors.brand.primary} size={14} strokeWidth={2} />
            )}
            {index < items.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <Pill label={item.type} tone={item.tone || 'blue'} />
            </View>
            <Text style={styles.time}>{formatDateTime(item.time)}</Text>
            {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  markerColumn: {
    width: 22,
    alignItems: 'center',
  },
  line: {
    width: 1,
    flex: 1,
    minHeight: 38,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  card: {
    flex: 1,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  time: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  note: {
    marginTop: 8,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
