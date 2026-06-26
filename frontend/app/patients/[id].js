import { router, useLocalSearchParams } from 'expo-router';
import { FlaskConical, Pill as PillIcon, BadgeInfo, ArrowLeft } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { DailyChecklist } from '../../src/components/checklist';
import { Timeline } from '../../src/components/timeline';
import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { colors, radius, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';
import { daysBetween, formatDate } from '../../src/lib/format';

export default function PatientDetailScreen() {
  const { id } = useLocalSearchParams();
  const { patients, investigations, antibiotics, devices, timelineEvents, getPatientById, getInvestigationsByPatient, getAntibioticsByPatient, getDevicesByPatient, getTimelineByPatient } = useData();
  const patient = getPatientById(id) || patients[0] || null;
  const relatedInvestigations = patient ? getInvestigationsByPatient(patient.id) : [];
  const relatedAntibiotics = patient ? getAntibioticsByPatient(patient.id) : [];
  const relatedDevices = patient ? getDevicesByPatient(patient.id) : [];
  const relatedTimeline = patient ? getTimelineByPatient(patient.id) : [];

  if (!patient) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
          <Text style={styles.backText}>Patients</Text>
        </TouchableOpacity>
        <Text style={{ padding: 16, color: colors.text.secondary }}>Patient not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="patient-detail-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Patients</Text>
      </TouchableOpacity>

      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{patient.name}</Text>
            <Text style={styles.meta}>
              {patient.uhid} · Bed {patient.bed} · {patient.gender}, {patient.age}
            </Text>
          </View>
          <Pill
            label={patient.status}
            tone={patient.status === 'Requires attention' ? 'red' : patient.status === 'Under review' ? 'orange' : 'green'}
          />
        </View>
        <Text style={styles.diagnosis}>{patient.diagnosis}</Text>
        <View style={styles.heroGrid}>
          <Field label="Consultant" value={patient.consultant} />
          <Field label="Admission" value={formatDate(patient.admissionDate)} />
          <Field label="Expected discharge" value={formatDate(patient.expectedDischarge)} />
          <Field label="ICU day" value={`Day ${daysBetween(patient.admissionDate) + 1}`} />
        </View>
      </Surface>

      <View style={styles.quickRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/new?type=investigation')}
          data-testid="patient-add-investigation"
          style={{ flex: 1 }}
        >
          <Surface style={styles.quickCard}>
            <FlaskConical color={colors.brand.primary} size={18} strokeWidth={2} />
            <Text style={styles.quickTitle}>Add investigation</Text>
          </Surface>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/new?type=antibiotic')}
          data-testid="patient-add-antibiotic"
          style={{ flex: 1 }}
        >
          <Surface style={styles.quickCard}>
            <PillIcon color={colors.status.warning} size={18} strokeWidth={2} />
            <Text style={styles.quickTitle}>Add antibiotic</Text>
          </Surface>
        </TouchableOpacity>
      </View>

      <Surface style={styles.panel}>
        <SectionHeader title="Daily checklist" subtitle="Resets every day and captures basic ICU workflow." />
        <View style={{ height: 12 }} />
        <DailyChecklist checklist={patient.dailyChecklist} />
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Current antibiotics" subtitle="Stewardship actions and review windows." />
        <View style={{ height: 12 }} />
        {relatedAntibiotics.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/antibiotics/${item.id}`)}
            data-testid={`patient-antibiotic-${item.id}`}
          >
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.drugName}</Text>
                <Text style={styles.listMeta}>
                  {item.dose} · {item.route} · {item.frequency}
                </Text>
              </View>
              <Pill label={`Day ${item.day}`} tone="blue" />
            </View>
          </TouchableOpacity>
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Pending investigations" subtitle="Free text investigations remain searchable and expandable." />
        <View style={{ height: 12 }} />
        {relatedInvestigations.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/investigations/${item.id}`)}
            data-testid={`patient-investigation-${item.id}`}
          >
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <Text style={styles.listMeta}>{item.labName} · Due {formatDate(item.expectedReportDate)}</Text>
              </View>
              <Pill
                label={item.status}
                tone={item.status === 'Pending' ? 'orange' : item.status === 'Received' ? 'blue' : 'green'}
              />
            </View>
          </TouchableOpacity>
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Devices" subtitle="Insertion, necessity review, and removal dates." />
        <View style={{ height: 12 }} />
        {relatedDevices.map((item) => (
          <View key={item.id} style={styles.listItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{item.type}</Text>
              <Text style={styles.listMeta}>
                Inserted {formatDate(item.insertionDate)} · Review {formatDate(item.reviewReminder)}
              </Text>
            </View>
            <Pill label={item.status} tone="orange" />
          </View>
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Timeline" subtitle="GitHub-style activity feed for everything that happens." />
        <View style={{ height: 12 }} />
        <Timeline items={relatedTimeline} />
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Clinical note" subtitle="Single line summary for the ICU round." />
        <View style={{ height: 12 }} />
        <View style={styles.noteBox}>
          <BadgeInfo color={colors.brand.primary} size={18} strokeWidth={2} />
          <Text style={styles.noteText}>{patient.notes}</Text>
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
  name: {
    fontFamily: typography.heading,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
  },
  meta: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  diagnosis: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  panel: {
    padding: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    padding: 12,
    minHeight: 82,
    gap: 8,
    justifyContent: 'center',
  },
  quickTitle: {
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  listItem: {
    minHeight: 54,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listTitle: {
    fontFamily: typography.heading,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  listMeta: {
    marginTop: 3,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
