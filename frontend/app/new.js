import { useLocalSearchParams, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { useClock } from '../src/hooks/use-clock';
import { CulturePicker } from '../src/components/culture-picker';
import { DrugPickerModal } from '../src/components/drug-picker-modal';
import { InvestigationPickerModal } from '../src/components/investigation-picker-modal';
import { DevicePickerModal } from '../src/components/device-picker-modal';
import { RoutePicker } from '../src/components/route-picker';
import { PatientSelector } from '../src/components/patient-selector';
import { UserSelector } from '../src/components/user-selector';
import { DateField } from '../src/components/date-field';
import { Check, FilePlus2, FlaskConical, Pill, UserPlus, ClipboardList, Syringe } from 'lucide-react-native';

import { radius, typography } from '../src/theme';
import { useThemeColors } from '../src/contexts/ThemeContext';
import { Surface, SectionHeader, ToggleChip } from '../src/components/ui';
import { useData } from '../src/contexts/DataContext';
import { BackButton } from '../src/components/back-button';
import { Dropdown } from '../src/components/dropdown';
function FormField({ label, value, onChangeText, placeholder, multiline, keyboardType, testId, styles, colors }) {
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

function ActionPills({ options, value, onChange, prefix, styles }) {
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
  const { type = 'patient', patientId: urlPatientId } = useLocalSearchParams();
  const resourceType = Array.isArray(type) ? type[0] : type;
  const { patients, users, api, createPatient, createInvestigation, createAntibiotic, createTask, createDevice, createTimelineEvent } = useData();
  const { timeString, dateString } = useClock();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const initial = useMemo(() => {
    const linkedPatient = urlPatientId ? patients.find((p) => p.id === urlPatientId) : null;
    const linkedName = linkedPatient?.name || '';
    if (resourceType === 'investigation') {
      return {
        title: '',
        patient: linkedName,
        patientId: urlPatientId || null,
        lab: 'Central Microbiology',
        priority: 'High',
        status: 'Pending',
        due: '',
        reminderAt: '',
        customAlertMessage: '',
      };
    }
    if (resourceType === 'antibiotic') {
      return {
        drug: '',
        dose: '',
        route: [],
        frequencyHours: '',
        frequencyMinutes: '',
        customAlertAt: '',
        patient: linkedName,
        patientId: urlPatientId || null,
        action: 'Review due',
        reminderAt: '',
        selectedCultures: [],
      };
    }
    if (resourceType === 'device') {
      return {
        type: '',
        patient: linkedName,
        patientId: urlPatientId || null,
        insertionDate: '',
        reviewReminder: '',
        reminderAt: '',
        customAlertMessage: '',
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
      status: 'Stable',
      bed: '',
      diagnosis: '',
      consultant: '',
      admission: '',
      expected: '',
    };
  }, [resourceType]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [showCulturePicker, setShowCulturePicker] = useState(false);
  const [showDrugPicker, setShowDrugPicker] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const [showInvPicker, setShowInvPicker] = useState(false);
  const [showDevicePicker, setShowDevicePicker] = useState(false);
  const [selectedCultures, setSelectedCultures] = useState([]);

  const titleMap = {
    patient: 'Add Patient',
    investigation: 'Add Investigation',
    antibiotic: 'Add Antibiotic',
    device: 'Add Device',
    task: 'Add Task',
  };

  const iconMap = {
    patient: UserPlus,
    investigation: FlaskConical,
    antibiotic: Pill,
    device: Syringe,
    task: ClipboardList,
  };

  const Icon = iconMap[resourceType] || FilePlus2;

  const FIELD_MAP = {
    patient: { admission: 'admission_date', expected: 'expected_discharge' },
    investigation: { title: 'name', patient: 'patient_name', lab: 'lab_name', due: 'expected_report_date' },
    antibiotic: { drug: 'drug_name', patient: 'patient_name', frequencyHours: 'frequency_hours', frequencyMinutes: 'frequency_minutes', customAlertAt: 'custom_alert_at' },
    device: { patient: 'patient_name', insertionDate: 'insertion_date', reviewReminder: 'review_reminder' },
    task: { patient: 'patient_name', assignedTo: 'assigned_to', due: 'due_time' },
  };

  function mapFields(type, raw) {
    let mapped = { ...raw };
    const mapping = FIELD_MAP[type] || {};
    for (const [key, col] of Object.entries(mapping)) {
      if (key in mapped) {
        mapped[col] = mapped[key];
        if (key !== col) delete mapped[key];
      }
    }
    if (mapped.age) mapped.age = parseInt(mapped.age, 10) || null;
    if (raw.patientId) {
      mapped.patient_id = raw.patientId;
    } else if ((type === 'investigation' || type === 'antibiotic' || type === 'device' || type === 'task') && raw.patient) {
      const match = patients.find((p) => p.name === raw.patient);
      if (match) mapped.patient_id = match.id;
    }
    if (Array.isArray(mapped.route)) {
      mapped.route = mapped.route.map((r) => r.routeName).join(', ');
    }
    if (type === 'antibiotic') {
      const h = parseInt(mapped.frequency_hours, 10) || 0;
      const m = parseInt(mapped.frequency_minutes, 10) || 0;
      mapped.frequency = h > 0 || m > 0 ? `${h}h ${m}m` : '';
      if (Array.isArray(mapped.selectedCultures) && mapped.selectedCultures.length) {
        mapped.linked_culture = mapped.selectedCultures.map((sc) => sc.cultureName || sc.cultureType).join(', ');
      }
    }
    if (type === 'investigation' || type === 'device') {
      if (Array.isArray(mapped.selectedCultures) && mapped.selectedCultures.length) {
        mapped.linked_culture = mapped.selectedCultures.map((sc) => sc.cultureName || sc.cultureType).join(', ');
      }
      if (mapped.customAlertMessage) {
        mapped.custom_alert_message = mapped.customAlertMessage;
      }
      if (mapped.reminderAt) {
        mapped.reminder_at = mapped.reminderAt;
      }
    }
    delete mapped.patientId;
    delete mapped.selectedCultures;
    delete mapped.reminderAt;
    delete mapped.customAlertMessage;
    return mapped;
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const payload = mapFields(resourceType, { ...form, selectedCultures });
      let created;
      if (resourceType === 'patient') {
        created = await createPatient(payload);
        const pid = created?.id;
        if (pid) {
          await createTimelineEvent({
            patient_id: pid,
            type: 'patient_admitted',
            title: `Patient admitted: ${form.name || ''}`,
            time: new Date().toISOString(),
          }).catch(() => {});
        }
      } else if (resourceType === 'investigation') {
        created = await createInvestigation(payload);
        const pid = form.patientId || created?.patient_id;
        if (pid) {
          await createTimelineEvent({
            patient_id: pid,
            type: 'investigation_sent',
            title: `Investigation sent: ${form.title}`,
            time: new Date().toISOString(),
          }).catch(() => {});
        }
        if (form.patientId) {
          router.replace(`/patients/${form.patientId}`);
          return;
        }
      } else if (resourceType === 'antibiotic') {
        created = await createAntibiotic(payload);
        const pid = form.patientId || created?.patient_id;
        if (pid) {
          await createTimelineEvent({
            patient_id: pid,
            type: 'antibiotic_started',
            title: `Antibiotic started: ${form.drug}`,
            time: new Date().toISOString(),
          }).catch(() => {});
        }
        if (form.patientId) {
          router.replace(`/patients/${form.patientId}`);
          return;
        }
      } else if (resourceType === 'device') {
        created = await createDevice(payload);
        const pid = form.patientId || created?.patient_id;
        if (pid) {
          await createTimelineEvent({
            patient_id: pid,
            type: 'device_inserted',
            title: `Device inserted: ${form.type}`,
            time: new Date().toISOString(),
          }).catch(() => {});
        }
        if (form.patientId) {
          router.replace(`/patients/${form.patientId}`);
          return;
        }
      } else if (resourceType === 'task') {
        await createTask(payload);
        if (form.patientId) {
          await createTimelineEvent({
            patient_id: form.patientId,
            type: 'task_created',
            title: `Task created: ${form.title}`,
            time: new Date().toISOString(),
          }).catch(() => {});
        }
      }
      Alert.alert('Saved', 'Created successfully.', [
        { text: 'OK', onPress: () => { if (typeof window !== 'undefined' && window.history.length <= 1) router.replace('/'); else router.back(); } },
      ]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Back" testID="new-back" />

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
            <View style={styles.clockBar}>
              <Clock color={colors.text.tertiary} size={12} strokeWidth={2} />
              <Text style={styles.clockText}>{timeString} · {dateString}</Text>
            </View>
          </View>
        </View>
      </Surface>

      {resourceType === 'patient' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Patient details" subtitle="Minimal fields to get the roster live quickly." />
          <View style={{ height: 12 }} />
          <FormField styles={styles} colors={colors} label="UHID" value={form.uhid} onChangeText={(value) => setForm((p) => ({ ...p, uhid: value }))} placeholder="UHID-10421" testId="patient-uhid" />
          <FormField styles={styles} colors={colors} label="Name" value={form.name} onChangeText={(value) => setForm((p) => ({ ...p, name: value }))} placeholder="Patient name" testId="patient-name" />
          <View style={styles.splitRow}>
            <FormField styles={styles} colors={colors} label="Age" value={form.age} onChangeText={(value) => setForm((p) => ({ ...p, age: value }))} placeholder="62" keyboardType="numeric" testId="patient-age" />
            <FormField styles={styles} colors={colors} label="Bed" value={form.bed} onChangeText={(value) => setForm((p) => ({ ...p, bed: value }))} placeholder="ICU-03" testId="patient-bed" />
          </View>
          <ActionPills styles={styles}
            options={['Male', 'Female', 'Other']}
            value={form.gender}
            onChange={(value) => setForm((p) => ({ ...p, gender: value }))}
            prefix="patient-gender"
          />
          <Dropdown
            label="STATUS"
            options={['Stable', 'Under review', 'Requires attention']}
            value={form.status}
            onSelect={(value) => setForm((p) => ({ ...p, status: value }))}
            testId="patient-status"
          />
          <FormField styles={styles} colors={colors} label="Diagnosis" value={form.diagnosis} onChangeText={(value) => setForm((p) => ({ ...p, diagnosis: value }))} placeholder="Severe pneumonia with septic shock" multiline testId="patient-diagnosis" />
          <UserSelector
            users={users}
            selectedName={form.consultant}
            onSelect={(name) => setForm((p) => ({ ...p, consultant: name }))}
            testId="patient-consultant"
            label="CONSULTANT"
          />
          <View style={styles.splitRow}>
            <DateField label="Admission date" value={form.admission} onChangeText={(value) => setForm((p) => ({ ...p, admission: value }))} testId="patient-admission" />
            <DateField label="Expected discharge" value={form.expected} onChangeText={(value) => setForm((p) => ({ ...p, expected: value }))} testId="patient-expected" />
          </View>
        </Surface>
      ) : null}

      {resourceType === 'investigation' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Investigation details" subtitle="Select from master list or type a custom investigation." />
          <View style={{ height: 12 }} />
          <View style={styles.field}>
            <Text style={styles.label}>Investigation name</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={form.title}
                onChangeText={(value) => setForm((p) => ({ ...p, title: value }))}
                placeholder="Blood Culture / BioFire / CSF PCR"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { flex: 1 }]}
                data-testid="investigation-title"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowInvPicker(true)}
                style={[styles.iconWrap, { width: 48, height: 48 }]}
                data-testid="investigation-picker-btn"
              >
                <FlaskConical color={colors.brand.primary} size={18} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          <PatientSelector
            patients={patients}
            selectedName={form.patient}
            onSelect={(id, name) => setForm((p) => ({ ...p, patient: name, patientId: id }))}
            testId="investigation-patient"
          />
          <FormField styles={styles} colors={colors} label="Lab name" value={form.lab} onChangeText={(value) => setForm((p) => ({ ...p, lab: value }))} placeholder="Central Microbiology" testId="investigation-lab" />
          <DateField label="Expected report date" value={form.due} onChangeText={(value) => setForm((p) => ({ ...p, due: value }))} testId="investigation-due" />
          <Text style={styles.choiceLabel}>Priority</Text>
          <ActionPills styles={styles} options={['Low', 'Medium', 'High']} value={form.priority} onChange={(value) => setForm((p) => ({ ...p, priority: value }))} prefix="investigation-priority" />
          <Text style={styles.choiceLabel}>Status</Text>
          <ActionPills styles={styles} options={['Pending', 'Received', 'Reviewed', 'Closed']} value={form.status} onChange={(value) => setForm((p) => ({ ...p, status: value }))} prefix="investigation-status" />
          <View style={styles.field}>
            <Text style={styles.label}>Cultures ({selectedCultures.length} selected)</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCulturePicker(true)}
              style={styles.cultureSelector}
              data-testid="investigation-culture-selector"
            >
              <Text style={selectedCultures.length ? styles.routeSelectorText : styles.routeSelectorPlaceholder}>
                {selectedCultures.length ? selectedCultures.map((sc) => sc.cultureName || sc.cultureType).join(', ') : 'Tap to link cultures...'}
              </Text>
            </TouchableOpacity>
          </View>
          <FormField styles={styles} colors={colors} label="Custom alert message" value={form.customAlertMessage} onChangeText={(value) => setForm((p) => ({ ...p, customAlertMessage: value }))} placeholder="e.g. Urgent: check CSF results" testId="investigation-custom-alert" />
          <DateField label="Reminder date & time" value={form.reminderAt} onChangeText={(value) => setForm((p) => ({ ...p, reminderAt: value }))} mode="datetime" testId="investigation-reminder" />
        </Surface>
      ) : null}

      {resourceType === 'antibiotic' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Antibiotic details" subtitle="Choose from master formulary, link relevant cultures." />
          <View style={{ height: 12 }} />

          <View style={styles.field}>
            <Text style={styles.label}>Drug name</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={form.drug}
                onChangeText={(value) => { setForm((p) => ({ ...p, drug: value })); }}
                placeholder="Meropenem / Vancomycin ..."
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { flex: 1 }]}
                data-testid="antibiotic-drug"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDrugPicker(true)}
                style={[styles.iconWrap, { width: 48, height: 48 }]}
                data-testid="antibiotic-drug-picker"
              >
                <Pill color={colors.status.safe} size={18} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
            <View style={styles.splitRow}>
              <FormField styles={styles} colors={colors} label="Dose" value={form.dose} onChangeText={(value) => setForm((p) => ({ ...p, dose: value }))} placeholder="1 g" testId="antibiotic-dose" />
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Route</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setShowRoutePicker(true)}
                  style={styles.routeSelector}
                  data-testid="antibiotic-route"
                >
                  <Text style={form.route.length ? styles.routeSelectorText : styles.routeSelectorPlaceholder}>
                    {form.route.length ? form.route.map((r) => r.routeName).join(', ') : 'Select route(s)...'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          <View style={styles.splitRow}>
            <FormField styles={styles} colors={colors} label="Hours" value={form.frequencyHours} onChangeText={(value) => setForm((p) => ({ ...p, frequencyHours: value }))} placeholder="8" keyboardType="numeric" testId="antibiotic-freq-hours" />
            <FormField styles={styles} colors={colors} label="Minutes" value={form.frequencyMinutes} onChangeText={(value) => setForm((p) => ({ ...p, frequencyMinutes: value }))} placeholder="0" keyboardType="numeric" testId="antibiotic-freq-minutes" />
          </View>
          <DateField label="Custom alert" value={form.customAlertAt} onChangeText={(value) => setForm((p) => ({ ...p, customAlertAt: value }))} mode="datetime" testId="antibiotic-custom-alert" />

          <PatientSelector
            patients={patients}
            selectedName={form.patient}
            onSelect={(id, name) => { setForm((p) => ({ ...p, patient: name, patientId: id })); setSelectedCultures([]); }}
            testId="antibiotic-patient"
          />

          <View style={styles.field}>
            <Text style={styles.label}>Cultures ({selectedCultures.length} selected)</Text>
            <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary, marginBottom: 4 }}>
              Multi-select from master culture list
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCulturePicker(true)}
              style={styles.cultureSelector}
              data-testid="culture-selector"
            >
              <Text style={selectedCultures.length ? styles.routeSelectorText : styles.routeSelectorPlaceholder}>
                {selectedCultures.length ? selectedCultures.map((sc) => sc.cultureName || sc.cultureType).join(', ') : 'Tap to select cultures...'}
              </Text>
            </TouchableOpacity>
          </View>

          <ActionPills styles={styles} options={['Review due', 'Continue', 'Escalate', 'De-escalate', 'Stop']} value={form.action} onChange={(value) => setForm((p) => ({ ...p, action: value }))} prefix="antibiotic-action" />
        </Surface>
      ) : null}

      {resourceType === 'device' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Device details" subtitle="Select from master list or type a custom device." />
          <View style={{ height: 12 }} />
          <View style={styles.field}>
            <Text style={styles.label}>Device type</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                value={form.type}
                onChangeText={(value) => setForm((p) => ({ ...p, type: value }))}
                placeholder="Central Line / Foley's Catheter"
                placeholderTextColor={colors.text.tertiary}
                style={[styles.input, { flex: 1 }]}
                data-testid="device-type"
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDevicePicker(true)}
                style={[styles.iconWrap, { width: 48, height: 48 }]}
                data-testid="device-picker-btn"
              >
                <Syringe color={colors.status.info} size={18} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
          <PatientSelector
            patients={patients}
            selectedName={form.patient}
            onSelect={(id, name) => setForm((p) => ({ ...p, patient: name, patientId: id }))}
            testId="device-patient"
          />
          <View style={styles.splitRow}>
            <DateField label="Insertion date" value={form.insertionDate} onChangeText={(value) => setForm((p) => ({ ...p, insertionDate: value }))} testId="device-insertion" />
            <DateField label="Review reminder" value={form.reviewReminder} onChangeText={(value) => setForm((p) => ({ ...p, reviewReminder: value }))} testId="device-review" />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Cultures ({selectedCultures.length} selected)</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCulturePicker(true)}
              style={styles.cultureSelector}
              data-testid="device-culture-selector"
            >
              <Text style={selectedCultures.length ? styles.routeSelectorText : styles.routeSelectorPlaceholder}>
                {selectedCultures.length ? selectedCultures.map((sc) => sc.cultureName || sc.cultureType).join(', ') : 'Tap to link cultures...'}
              </Text>
            </TouchableOpacity>
          </View>
          <FormField styles={styles} colors={colors} label="Custom alert message" value={form.customAlertMessage} onChangeText={(value) => setForm((p) => ({ ...p, customAlertMessage: value }))} placeholder="e.g. Line review overdue" testId="device-custom-alert" />
          <DateField label="Reminder date & time" value={form.reminderAt} onChangeText={(value) => setForm((p) => ({ ...p, reminderAt: value }))} mode="datetime" testId="device-reminder" />
        </Surface>
      ) : null}

      {resourceType === 'task' ? (
        <Surface style={styles.form}>
          <SectionHeader title="Task details" subtitle="Small, actionable, assignable work items." />
          <View style={{ height: 12 }} />
          <FormField styles={styles} colors={colors} label="Task title" value={form.title} onChangeText={(value) => setForm((p) => ({ ...p, title: value }))} placeholder="Review culture / remove catheter" testId="task-title" />
          <PatientSelector
            patients={patients}
            selectedName={form.patient}
            onSelect={(id, name) => setForm((p) => ({ ...p, patient: name, patientId: id }))}
            testId="task-patient"
          />
          <UserSelector
            users={users}
            selectedName={form.assignedTo}
            onSelect={(name) => setForm((p) => ({ ...p, assignedTo: name }))}
            testId="task-assignee"
            label="ASSIGNED TO"
          />
          <DateField label="Due time" value={form.due} onChangeText={(value) => setForm((p) => ({ ...p, due: value }))} mode="datetime" testId="task-due" />
          <DateField label="Reminder date & time" value={form.reminderAt} onChangeText={(value) => setForm((p) => ({ ...p, reminderAt: value }))} mode="datetime" testId="task-reminder" />
        </Surface>
      ) : null}

      <DrugPickerModal visible={showDrugPicker} onClose={() => setShowDrugPicker(false)} selectedDrug={form.drug} onSelect={({ drugName }) => { setForm((p) => ({ ...p, drug: drugName })); setShowDrugPicker(false); }} />
      <RoutePicker visible={showRoutePicker} onClose={() => setShowRoutePicker(false)} selected={form.route} onSelect={(list) => { setForm((p) => ({ ...p, route: list })); setShowRoutePicker(false); }} />
      <CulturePicker visible={showCulturePicker} onClose={() => setShowCulturePicker(false)} selected={selectedCultures} onSelect={(list) => { setSelectedCultures(list); }} />
      <InvestigationPickerModal visible={showInvPicker} onClose={() => setShowInvPicker(false)} selectedName={form.title} onSelect={({ investigationName }) => { setForm((p) => ({ ...p, title: investigationName })); setShowInvPicker(false); }} />
      <DevicePickerModal visible={showDevicePicker} onClose={() => setShowDevicePicker(false)} selectedName={form.type} onSelect={({ deviceName }) => { setForm((p) => ({ ...p, type: deviceName })); setShowDevicePicker(false); }} />

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

function createStyles(colors) { return StyleSheet.create({
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
  clockBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  clockText: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
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
  routeSelector: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  routeSelectorText: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  routeSelectorPlaceholder: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  cultureSelector: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    justifyContent: 'center',
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
}); }
