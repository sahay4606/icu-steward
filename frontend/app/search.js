import { router } from 'expo-router';
import { ArrowLeft, SearchX, UserRound, FlaskConical, Pill, BedDouble } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { colors, typography } from '../src/theme';
import { Surface, SearchField, SectionHeader, ToggleChip, Pill as StatusPill } from '../src/components/ui';
import { useData } from '../src/contexts/DataContext';
import { formatDate } from '../src/lib/format';

function ResultCard({ icon: Icon, title, subtitle, value, tone, onPress, testId }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} data-testid={testId}>
      <Surface style={styles.resultCard}>
        <View style={styles.resultTop}>
          <View style={styles.iconWrap}>
            <Icon color={tone} size={18} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultTitle}>{title}</Text>
            <Text style={styles.resultSubtitle}>{subtitle}</Text>
          </View>
          {value ? <StatusPill label={value} tone="blue" /> : null}
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const { patients, investigations, antibiotics, users } = useData();
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('All');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (fields) => !q || fields.join(' ').toLowerCase().includes(q);

    const p = patients.filter((item) => matches([item.name, item.uhid, item.bed, item.consultant, item.diagnosis]));
    const inv = investigations.filter((item) => matches([item.name, item.patientName, item.labName]));
    const abx = antibiotics.filter((item) => matches([item.drugName, item.patientName, item.indication]));
    const docs = users.filter((item) => matches([item.name, item.role, item.unit]));
    return {
      patients: p,
      investigations: inv,
      antibiotics: abx,
      doctors: docs,
      hasAny: p.length > 0 || inv.length > 0 || abx.length > 0 || docs.length > 0,
    };
  }, [query, patients, investigations, antibiotics, users]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="search-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Search</Text>
      </TouchableOpacity>

      <SectionHeader title="Global search" subtitle="Find anything tied to a hospital_id in two taps." />
      <Surface style={styles.panel}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Patient, UHID, bed, investigation, drug, doctor" testId="global-search-input" />
        <View style={styles.filterRow}>
          {['All', 'Patients', 'Investigations', 'Antibiotics', 'Doctors'].map((item) => (
            <ToggleChip
              key={item}
              label={item}
              selected={scope === item}
              onPress={() => setScope(item)}
              testId={`search-scope-${item}`}
            />
          ))}
        </View>
      </Surface>

      {(scope === 'All' || scope === 'Patients') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patients</Text>
          {results.patients.map((patient) => (
            <ResultCard
              key={patient.id}
              icon={BedDouble}
              title={patient.name}
              subtitle={`${patient.uhid} · Bed ${patient.bed} · ${patient.consultant}`}
              value={patient.priority}
              tone={colors.brand.primary}
              onPress={() => router.push(`/patients/${patient.id}`)}
              testId={`search-patient-${patient.id}`}
            />
          ))}
        </View>
      )}

      {(scope === 'All' || scope === 'Investigations') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investigations</Text>
          {results.investigations.map((item) => (
            <ResultCard
              key={item.id}
              icon={FlaskConical}
              title={item.name}
              subtitle={`${item.patientName} · ${item.labName} · Due ${formatDate(item.expectedReportDate)}`}
              value={item.status}
              tone={colors.status.warning}
              onPress={() => router.push(`/investigations/${item.id}`)}
              testId={`search-investigation-${item.id}`}
            />
          ))}
        </View>
      )}

      {(scope === 'All' || scope === 'Antibiotics') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Antibiotics</Text>
          {results.antibiotics.map((item) => (
            <ResultCard
              key={item.id}
              icon={Pill}
              title={item.drugName}
              subtitle={`${item.patientName} · ${item.indication} · Day ${item.day}`}
              value={item.action}
              tone={colors.status.warning}
              onPress={() => router.push(`/antibiotics/${item.id}`)}
              testId={`search-antibiotic-${item.id}`}
            />
          ))}
        </View>
      )}

      {(scope === 'All' || scope === 'Doctors') && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doctors</Text>
          {results.doctors.map((item) => (
            <ResultCard
              key={item.id}
              icon={UserRound}
              title={item.name}
              subtitle={`${item.role} · ${item.unit}`}
              value={item.status}
              tone={colors.status.safe}
              onPress={() => router.push('/profile')}
              testId={`search-doctor-${item.id}`}
            />
          ))}
        </View>
      )}

      {query.trim() && !results.hasAny ? (
        <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <SearchX color={colors.text.tertiary} size={32} strokeWidth={1.5} />
          <Text style={{ fontFamily: typography.heading, fontSize: 16, fontWeight: '700', color: colors.text.primary }}>No results found</Text>
          <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>
            Try a different search term or check the spelling.
          </Text>
        </View>
      ) : null}
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
  panel: {
    padding: 14,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  resultCard: {
    padding: 14,
    marginBottom: 10,
  },
  resultTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  resultTitle: {
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  resultSubtitle: {
    marginTop: 3,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
});
