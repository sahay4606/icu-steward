import { router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { Alert, ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, CircleDot, Repeat2, StopCircle } from 'lucide-react-native';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { colors, radius, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';
import { formatDate } from '../../src/lib/format';

export default function AntibioticDetailScreen() {
  const { id } = useLocalSearchParams();
  const { antibiotics, investigations, getPatientById } = useData();
  const antibiotic = antibiotics.find((item) => item.id === id) || antibiotics[0] || null;
  const patient = antibiotic ? getPatientById(antibiotic.patientId) : null;
  const culture = antibiotic ? investigations.find((item) => item.id === antibiotic.cultureLinked) : null;

  const handleContinue = useCallback(() => {
    Alert.alert('Continue antibiotic', 'This action will be available in the next update. For now, document continuation in the EHR.');
  }, []);

  const handleStop = useCallback(() => {
    Alert.alert('Stop antibiotic', 'This action will be available in the next update. For now, document stoppage in the EHR.');
  }, []);

  if (!antibiotic) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
          <Text style={styles.backText}>Antibiotic</Text>
        </TouchableOpacity>
        <Text style={{ padding: 16, color: colors.text.secondary }}>Antibiotic not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="antibiotic-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Antibiotic</Text>
      </TouchableOpacity>

      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <CircleDot color={colors.status.warning} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{antibiotic.drugName}</Text>
            <Text style={styles.meta}>{patient?.name} · {antibiotic.indication}</Text>
          </View>
          <Pill label={antibiotic.action} tone={antibiotic.action === 'Stop' ? 'red' : antibiotic.action === 'Continue' ? 'green' : 'orange'} />
        </View>
        <View style={styles.grid}>
          <Field label="Dose" value={antibiotic.dose} />
          <Field label="Route" value={antibiotic.route} />
          <Field label="Frequency" value={antibiotic.frequency} />
          <Field label="Day" value={`Day ${antibiotic.day}`} />
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Stewardship review" subtitle="Automatic reminders continue until the antibiotic is closed." />
        <View style={{ height: 12 }} />
        <View style={styles.detailBox}>
          <Text style={styles.detailLabel}>Expected duration</Text>
          <Text style={styles.detailValue}>{antibiotic.expectedDuration}</Text>
          <Text style={styles.detailMeta}>Started {formatDate(antibiotic.startDate)} · Review {formatDate(antibiotic.reviewDate)}</Text>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Linked culture" subtitle="Tie antibiotic continuation to culture review." />
        <View style={{ height: 12 }} />
        <View style={styles.linkBox}>
          <Text style={styles.linkTitle}>{culture?.name || 'Not linked'}</Text>
          <Text style={styles.linkMeta}>{culture?.labName || 'No culture selected'} · {culture?.status || 'Unknown'}</Text>
          <Text style={styles.linkMeta}>This linkage is central to stewardship automation.</Text>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Actions" subtitle="Continue, escalate, de-escalate, or stop." />
        <View style={{ height: 12 }} />
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleContinue} data-testid="abx-action-continue" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <Repeat2 color={colors.status.safe} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Continue</Text>
            </Surface>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={handleStop} data-testid="abx-action-stop" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <StopCircle color={colors.status.critical} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Stop</Text>
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
    backgroundColor: '#FFF7ED',
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
  detailBox: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  detailLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailValue: {
    marginTop: 4,
    fontFamily: typography.heading,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  detailMeta: {
    marginTop: 6,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  linkBox: {
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  linkTitle: {
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  linkMeta: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
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
