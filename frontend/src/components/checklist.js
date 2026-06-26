import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';

import { colors, radius, spacing, typography } from '../theme';

const items = [
  { key: 'ventilatorReviewed', label: 'Ventilator reviewed' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'dvtProphylaxis', label: 'DVT prophylaxis' },
  { key: 'stressUlcerProphylaxis', label: 'Stress ulcer prophylaxis' },
  { key: 'sedationReviewed', label: 'Sedation reviewed' },
  { key: 'cultureReviewed', label: 'Culture reviewed' },
  { key: 'antibioticReviewed', label: 'Antibiotic reviewed' },
  { key: 'deviceNecessityReviewed', label: 'Device necessity reviewed' },
];

export function DailyChecklist({ checklist = {} }) {
  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const checked = Boolean(checklist[item.key]);
        const Icon = checked ? CheckCircle2 : Circle;
        return (
          <View key={item.key} style={styles.item}>
            <Icon color={checked ? colors.status.safe : colors.text.tertiary} size={18} strokeWidth={2} />
            <Text style={[styles.label, checked && styles.labelChecked]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  label: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  labelChecked: {
    color: colors.text.primary,
    fontWeight: '700',
  },
});
