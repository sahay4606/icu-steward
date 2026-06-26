import { router } from 'expo-router';
import { BedDouble, Filter, Search, UserPlus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { Surface, SectionHeader, SearchField, ToggleChip, Pill } from '../../src/components/ui';
import { colors, typography } from '../../src/theme';
import { filters, getPatientRiskScore } from '../../src/data/mock';
import { useData } from '../../src/contexts/DataContext';
import { formatDate, daysBetween } from '../../src/lib/format';

function PatientCard({ patient }) {
  const risk = getPatientRiskScore(patient);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/patients/${patient.id}`)}
      data-testid={`patient-card-${patient.id}`}
    >
      <Surface style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{patient.name}</Text>
            <Text style={styles.meta}>
              {patient.uhid} · Bed {patient.bed}
            </Text>
          </View>
          <Pill
            label={patient.priority}
            tone={patient.priority === 'High' ? 'red' : patient.priority === 'Medium' ? 'orange' : 'blue'}
          />
        </View>
        <Text style={styles.diagnosis}>{patient.diagnosis}</Text>
        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Consultant</Text>
            <Text style={styles.metricValue}>{patient.consultant}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Days</Text>
            <Text style={styles.metricValue}>{daysBetween(patient.admissionDate) + 1}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Risk</Text>
            <Text style={styles.metricValue}>{risk}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Discharge</Text>
            <Text style={styles.metricValue}>{formatDate(patient.expectedDischarge)}</Text>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

export default function PatientsScreen() {
  const { patients, hospitalId, error } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Bed');

  const visible = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return patients
      .filter((patient) => {
        const statusMatch = status === 'All' || patient.status === status;
        const textMatch =
          !lower ||
          [patient.name, patient.uhid, patient.bed, patient.consultant, patient.diagnosis]
            .join(' ')
            .toLowerCase()
            .includes(lower);
        return statusMatch && textMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'Bed') return a.bed.localeCompare(b.bed);
        if (sortBy === 'Recent') return new Date(b.admissionDate) - new Date(a.admissionDate);
        if (sortBy === 'Risk') return getPatientRiskScore(b) - getPatientRiskScore(a);
        return a.name.localeCompare(b.name);
      });
  }, [patients, query, status, sortBy]);

  if (error && patients.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load patients</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Patients"
        subtitle="Roster, search, filter, and scan in a single view."
        actionLabel="Add"
        onAction={() => router.push('/new?type=patient')}
        actionTestId="patients-add-action"
      />

      <Surface style={styles.panel}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search patient, UHID, bed, doctor, diagnosis"
          testId="patients-search"
        />
        <View style={styles.filterRow}>
          {filters.patientStatus.map((item) => (
            <ToggleChip
              key={item}
              label={item}
              selected={status === item}
              onPress={() => setStatus(item)}
              testId={`patients-filter-${item}`}
            />
          ))}
        </View>
        <View style={styles.filterRow}>
          {['Bed', 'Recent', 'Risk', 'Name'].map((item) => (
            <ToggleChip
              key={item}
              label={`Sort: ${item}`}
              selected={sortBy === item}
              onPress={() => setSortBy(item)}
              testId={`patients-sort-${item}`}
            />
          ))}
        </View>
      </Surface>

      <View style={styles.summaryRow}>
        <Surface style={styles.summaryCard}>
          <BedDouble color={colors.brand.primary} size={18} strokeWidth={2} />
          <Text style={styles.summaryValue}>{patients.length}</Text>
          <Text style={styles.summaryLabel}>On roster</Text>
        </Surface>
        <Surface style={styles.summaryCard}>
          <Filter color={colors.status.warning} size={18} strokeWidth={2} />
          <Text style={styles.summaryValue}>{visible.length}</Text>
          <Text style={styles.summaryLabel}>Visible now</Text>
        </Surface>
        <Surface style={styles.summaryCard}>
          <UserPlus color={colors.status.safe} size={18} strokeWidth={2} />
          <Text style={styles.summaryValue}>{patients.filter((item) => item.status !== 'Stable').length}</Text>
          <Text style={styles.summaryLabel}>Needs review</Text>
        </Surface>
      </View>

      <View style={styles.list}>
        {visible.map((patient) => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
        {visible.length === 0 ? (
          <Surface style={styles.empty}>
            <Search color={colors.text.tertiary} size={20} strokeWidth={2} />
            <Text style={styles.emptyTitle}>No patients found</Text>
            <Text style={styles.emptyBody}>Adjust search or filters. Every patient stays under one hospital tenant.</Text>
          </Surface>
        ) : null}
      </View>
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
  panel: {
    padding: 14,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    gap: 4,
    minHeight: 92,
  },
  summaryValue: {
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  summaryLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  name: {
    fontFamily: typography.heading,
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
  },
  meta: {
    marginTop: 3,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
  },
  metricLabel: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricValue: {
    marginTop: 4,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '700',
  },
  empty: {
    padding: 18,
    alignItems: 'flex-start',
    gap: 8,
  },
  emptyTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
});
