import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography, radius } from '../../theme';

export function SectionHeader({ title, subtitle, actionLabel, onAction, actionTestId }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onAction}
          style={styles.sectionAction}
          data-testid={actionTestId}
        >
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  sectionSubtitle: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  sectionAction: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionActionText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.brand.primary,
    fontWeight: '600',
  },
});
