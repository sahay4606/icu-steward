import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ArrowLeft, Check, FilePlus2, FlaskConical, Pill, UserPlus, ClipboardList } from 'lucide-react-native';

import { colors, radius, typography } from '../src/theme';
import { Surface, SectionHeader, ToggleChip } from '../src/components/ui';
import { useData } from '../src/contexts/DataContext';

function FormField({ label, value, onChangeText, placeholder, multiline, keyboardType, testId }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && styles.textArea]}
        data-testid={testId}
      />
    </View>
  );
}

function ActionPills({ options, value, onChange, prefix }) {
  return (
    <View style={styles.chipRow}>
      {options.map((item) => (
        <ToggleChip
          key={item}
          label={item}
          selected={value === item}
          onPress={() => onChange(item)}
          testId={`${prefix}-${item}`}
        />
      ))}
    </View>
  );
}

export default function NewResourceScreen() {
  const { type = 'patient' } = useLocalSearchParams();
  const resourceType = Array.isArray(type) ? type[0] : type;
  const { patients, createPatient, createInvestigation, createAntibiotic, createTask } = useData();

  const initial = useMemo(() => {
    if (resourceType === 'investigation') {
      return {
        title: '',
        patient: patients[0]?.name || '',
        lab: 'Central Microbiology',
        priority: 'High',
        status: 'Pending',
        due: '',
      };
    }
    if (resourceType === 'antibiotic') {
      return {
        drug: 'Meropenem',
        dose: '1 g',
        route: 'IV',
        frequency: '8 hourly',
        patient: patients[0]?.name || '',
        action: 'Review due',
      };
    }
    if (resourceType === 'task') {
      return {
        title: '',
        patient: patients[0]?.name || '',
        assignedTo: '',
        due: '',
      };
    }
    return {
      uhid: '',
      name: '',
      age: '',
      gender: 'Male',
      bed: '',
      diagnosis: '',
      consultant: '',
      admission: '',
      expected: '',
    };
  }, [resourceType]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  const titleMap = {
    patient: 'Add Patient',
    investigation: 'Add Investigation',
    antibiotic: 'Add Antibiotic',
    task: 'Add Task',
  };

  const iconMap = {
    patient: UserPlus,
    investigation: FlaskConical,
    antibiotic: Pill,
    task: ClipboardList,
  };

  const Icon = iconMap[resourceType] || FilePlus2;

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const payload = form;
      if (resourceType === 'patient') await createPatient(payload);
      else if (resourceType === 'investigation') await createInvestigation(payload);
      else if (resourceType === 'antibiotic') await createAntibiotic(payload);
      else if (resourceType === 'task') await createTask(payload);
      Alert.alert('Saved', 'Created successfully. The new record is now searchable and actionable.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="new-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <Icon color={colors.brand.primary} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{titleMap[resourceType] || 'Create Resource'}</Text>
            <Text style={styles.subtitle}>
              Fast, free-text capture for ICU doctors. Every resource stays under hospital_id.
            </Text>
          </View>
        </View>
      </Surface>

      {resourceType === 'patient' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Patient details" subtitle="Minimal fields to get the roster live quickly." />
          <View style={{ height: 12 }} />
          <FormField label="UHID" value={form.uhid} onChangeText={(value) => setForm((p) => ({ ...p, uhid: value }))} placeholder="UHID-10421" testId="patient-uhid" />
          <FormField label="Name" value={form.name} onChangeText={(value) => setForm((p) => ({ ...p, name: value }))} placeholder="Patient name" testId="patient-name" />
          <View style={styles.splitRow}>
            <FormField label="Age" value={form.age} onChangeText={(value) => setForm((p) => ({ ...p, age: value }))} placeholder="62" keyboardType="numeric" testId="patient-age" />
            <FormField label="Bed" value={form.bed} onChangeText={(value) => setForm((p) => ({ ...p, bed: value }))} placeholder="ICU-03" testId="patient-bed" />
          </View>
          <ActionPills
            options={['Male', 'Female', 'Other']}
            value={form.gender}
            onChange={(value) => setForm((p) => ({ ...p, gender: value }))}
            prefix="patient-gender"
          />
          <FormField label="Diagnosis" value={form.diagnosis} onChangeText={(value) => setForm((p) => ({ ...p, diagnosis: value }))} placeholder="Severe pneumonia with septic shock" multiline testId="patient-diagnosis" />
          <FormField label="Consultant" value={form.consultant} onChangeText={(value) => setForm((p) => ({ ...p, consultant: value }))} placeholder="Dr. Arjun Nair" testId="patient-consultant" />
          <View style={styles.splitRow}>
            <FormField label="Admission date" value={form.admission} onChangeText={(value) => setForm((p) => ({ ...p, admission: value }))} placeholder="2026-06-24" testId="patient-admission" />
            <FormField label="Expected discharge" value={form.expected} onChangeText={(value) => setForm((p) => ({ ...p, expected: value }))} placeholder="2026-07-01" testId="patient-expected" />
          </View>
        </Surface>
      ) : null}

      {resourceType === 'investigation' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Investigation details" subtitle="No dropdown pressure. Doctors can type exactly what was ordered." />
          <View style={{ height: 12 }} />
          <FormField label="Investigation name" value={form.title} onChangeText={(value) => setForm((p) => ({ ...p, title: value }))} placeholder="Blood Culture / BioFire / CSF PCR" testId="investigation-title" />
          <FormField label="Patient" value={form.patient} onChangeText={(value) => setForm((p) => ({ ...p, patient: value }))} placeholder="Raghav Menon" testId="investigation-patient" />
          <FormField label="Lab name" value={form.lab} onChangeText={(value) => setForm((p) => ({ ...p, lab: value }))} placeholder="Central Microbiology" testId="investigation-lab" />
          <FormField label="Expected report date" value={form.due} onChangeText={(value) => setForm((p) => ({ ...p, due: value }))} placeholder="2026-06-26" testId="investigation-due" />
          <Text style={styles.choiceLabel}>Priority</Text>
          <ActionPills options={['Low', 'Medium', 'High']} value={form.priority} onChange={(value) => setForm((p) => ({ ...p, priority: value }))} prefix="investigation-priority" />
          <Text style={styles.choiceLabel}>Status</Text>
          <ActionPills options={['Pending', 'Received', 'Reviewed', 'Closed']} value={form.status} onChange={(value) => setForm((p) => ({ ...p, status: value }))} prefix="investigation-status" />
        </Surface>
      ) : null}

      {resourceType === 'antibiotic' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Antibiotic details" subtitle="Stewardship-friendly data entry with quick review metadata." />
          <View style={{ height: 12 }} />
          <FormField label="Drug name" value={form.drug} onChangeText={(value) => setForm((p) => ({ ...p, drug: value }))} placeholder="Meropenem" testId="antibiotic-drug" />
          <View style={styles.splitRow}>
            <FormField label="Dose" value={form.dose} onChangeText={(value) => setForm((p) => ({ ...p, dose: value }))} placeholder="1 g" testId="antibiotic-dose" />
            <FormField label="Route" value={form.route} onChangeText={(value) => setForm((p) => ({ ...p, route: value }))} placeholder="IV" testId="antibiotic-route" />
          </View>
          <FormField label="Frequency" value={form.frequency} onChangeText={(value) => setForm((p) => ({ ...p, frequency: value }))} placeholder="8 hourly" testId="antibiotic-frequency" />
          <FormField label="Patient" value={form.patient} onChangeText={(value) => setForm((p) => ({ ...p, patient: value }))} placeholder="Raghav Menon" testId="antibiotic-patient" />
          <ActionPills options={['Review due', 'Continue', 'Escalate', 'De-escalate', 'Stop']} value={form.action} onChange={(value) => setForm((p) => ({ ...p, action: value }))} prefix="antibiotic-action" />
        </Surface>
      ) : null}

      {resourceType === 'task' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Task details" subtitle="Small, actionable, assignable work items." />
          <View style={{ height: 12 }} />
          <FormField label="Task title" value={form.title} onChangeText={(value) => setForm((p) => ({ ...p, title: value }))} placeholder="Review culture / remove catheter" testId="task-title" />
          <FormField label="Patient" value={form.patient} onChangeText={(value) => setForm((p) => ({ ...p, patient: value }))} placeholder="Raghav Menon" testId="task-patient" />
          <FormField label="Assigned to" value={form.assignedTo} onChangeText={(value) => setForm((p) => ({ ...p, assignedTo: value }))} placeholder="Dr. Isha Khan" testId="task-assignee" />
          <FormField label="Due time" value={form.due} onChangeText={(value) => setForm((p) => ({ ...p, due: value }))} placeholder="2026-06-26 14:00" testId="task-due" />
        </Surface>
      ) : null}

      <TouchableOpacity activeOpacity={0.7} onPress={handleSave} disabled={saving} data-testid="new-save">
        <Surface style={styles.save}>
          {saving ? (
            <ActivityIndicator color={colors.surface} size="small" />
          ) : (
            <Check color={colors.surface} size={18} strokeWidth={2} />
          )}
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save draft'}</Text>
        </Surface>
      </TouchableOpacity>
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
  },
  heroTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  form: {
    padding: 14,
    gap: 12,
  },
  field: {
    gap: 6,
    flex: 1,
  },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    color: colors.text.primary,
    fontFamily: typography.body,
    fontSize: 14,
  },
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  choiceLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  save: {
    minHeight: 52,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  saveText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    fontWeight: '800',
    color: colors.surface,
  },
});
