import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, FlaskConical, MessageSquare, Repeat, ShieldCheck } from 'lucide-react-native';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { colors, radius, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';
import { formatDate } from '../../src/lib/format';

export default function InvestigationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { investigations, getPatientById } = useData();
  const investigation = investigations.find((item) => item.id === id) || investigations[0] || null;
  const patient = investigation ? getPatientById(investigation.patientId) : null;

  const markReviewed = useCallback(() => {
    Alert.alert('Mark as reviewed', 'This will be available in the next update. The investigation record can be updated from the EHR.');
  }, []);

  const repeatReminder = useCallback(() => {
    Alert.alert('Repeat reminder', 'A new reminder for this investigation will be available in the next update.');
  }, []);

  if (!investigation) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
          <Text style={styles.backText}>Investigation</Text>
        </TouchableOpacity>
        <Text style={{ padding: 16, color: colors.text.secondary }}>Investigation not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="investigation-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Investigation</Text>
      </TouchableOpacity>

      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <FlaskConical color={colors.brand.primary} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{investigation.name}</Text>
            <Text style={styles.meta}>{patient?.name} · {investigation.labName}</Text>
          </View>
          <Pill
            label={investigation.status}
            tone={
              investigation.status === 'Pending'
                ? 'orange'
                : investigation.status === 'Received'
                  ? 'blue'
                  : investigation.status === 'Reviewed'
                    ? 'green'
                    : 'gray'
            }
          />
        </View>
        <View style={styles.grid}>
          <Field label="Priority" value={investigation.priority} />
          <Field label="Sent" value={formatDate(investigation.sentDate)} />
          <Field label="Expected report" value={formatDate(investigation.expectedReportDate)} />
          <Field label="Reminder cadence" value={`${investigation.reminderEveryHours}h`} />
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Reminder info" subtitle="Repeat reminders every {investigation.reminderEveryHours}h until closed." />
        <View style={{ height: 12 }} />
        <View style={styles.contextBox}>
          <MessageSquare color={colors.text.tertiary} size={18} strokeWidth={2} />
          <Text style={styles.contextText}>
            Automatic reminders repeat every {investigation.reminderEveryHours}h until this investigation is marked as reviewed.
          </Text>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Actions" subtitle="Manage this investigation during rounds." />
        <View style={{ height: 12 }} />
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={markReviewed} data-testid="inv-action-review" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <ShieldCheck color={colors.status.safe} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Mark reviewed</Text>
            </Surface>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={repeatReminder} data-testid="inv-action-repeat" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <Repeat color={colors.status.warning} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Repeat reminder</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  backText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  hero: {
    padding: 16,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  meta: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  panel: {
    padding: 14,
  },
  contextBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  contextText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    minHeight: 88,
    padding: 12,
    gap: 8,
    justifyContent: 'center',
  },
  actionTitle: {
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
