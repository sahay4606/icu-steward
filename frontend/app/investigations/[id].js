import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Edit2, FlaskConical, MessageSquare, Repeat, ShieldCheck, Trash2, ArrowUp, ArrowDown, Minus, Clock } from 'lucide-react-native';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { radius, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';
import { useData } from '../../src/contexts/DataContext';
import { formatDate, formatDateTime } from '../../src/lib/format';
import { BackButton } from '../../src/components/back-button';
import { confirm } from '../../src/lib/confirm';
import { useClock } from '../../src/hooks/use-clock';

const STATUS_ORDER = [
  'Ordered', 'Sample Collected', 'Sent', 'Received', 'Processing',
  'Preliminary', 'Final', 'Corrected', 'Reviewed', 'Acknowledged',
];

const STATUS_TONES = {
  Ordered: 'orange', 'Sample Collected': 'blue', Sent: 'blue',
  Received: 'orange', Processing: 'purple', Preliminary: 'purple',
  Final: 'green', Corrected: 'green', Reviewed: 'green',
  Acknowledged: 'green', Cancelled: 'gray', Rejected: 'red',
  'Critical Result': 'red',
};

const CATEGORIES = {
  'Hematology': ['CBC', 'Hb', 'Hematocrit', 'RBC', 'WBC', 'Differential Count', 'Platelets', 'ESR', 'Reticulocyte Count', 'Peripheral Smear'],
  'Biochemistry': ['Urea', 'Creatinine', 'BUN', 'eGFR', 'Sodium', 'Potassium', 'Chloride', 'Magnesium', 'Calcium', 'Ionized Calcium', 'Phosphate', 'AST', 'ALT', 'ALP', 'GGT', 'Bilirubin Total', 'Bilirubin Direct', 'Albumin', 'Total Protein', 'Lipase', 'Amylase', 'Lactate', 'Blood Glucose', 'HbA1c', 'Serum Osmolality'],
  'Coagulation': ['PT', 'INR', 'aPTT', 'Fibrinogen', 'D-Dimer', 'Anti-Xa'],
  'Blood Gas': ['ABG', 'VBG'],
  'Cardiac': ['Troponin I', 'Troponin T', 'CK', 'CK-MB', 'BNP', 'NT-proBNP'],
  'Infection Markers': ['CRP', 'Procalcitonin', 'Ferritin', 'IL-6'],
  'Endocrine': ['TSH', 'FT3', 'FT4', 'Cortisol', 'ACTH'],
  'Microbiology': ['Blood Culture', 'Urine Culture', 'Sputum Culture', 'ETA Culture', 'BAL Culture', 'Wound Culture', 'CSF Culture', 'Fungal Culture', 'AFB', 'GeneXpert', 'PCR', 'Viral Panel'],
  'Virology': ['HIV', 'HBV', 'HCV', 'COVID PCR', 'Influenza', 'RSV', 'Dengue', 'Malaria'],
  'Imaging': ['X-Ray Chest', 'CT Brain', 'CT Chest', 'CT Abdomen', 'MRI Brain', 'USG Abdomen', 'Echocardiography', 'PET CT'],
  'Cardiology': ['ECG', 'Holter', 'Echo', 'TEE', 'Stress Test'],
  'Neurology': ['EEG', 'EMG', 'Nerve Conduction'],
  'Respiratory': ['Spirometry', 'Bronchoscopy', 'Sleep Study'],
};

function CategoryBadge({ name, investigations }) {
  const colors = useThemeColors();
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontFamily: typography.bodyMedium, fontSize: 11, fontWeight: '700', color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6 }}>{name}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {investigations.slice(0, 6).map((inv) => (
          <Pill key={inv} label={inv} tone="blue" size="sm" />
        ))}
        {investigations.length > 6 ? <Pill label={`+${investigations.length - 6}`} tone="gray" size="sm" /> : null}
      </View>
    </View>
  );
}

function TrendIcon({ value, prevValue }) {
  const colors = useThemeColors();
  if (!prevValue || !value) return null;
  const diff = parseFloat(value) - parseFloat(prevValue);
  const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus;
  const color = diff > 0 ? '#dc2626' : diff < 0 ? '#16a34a' : colors.text.tertiary;
  return <Icon color={color} size={14} strokeWidth={2.5} />;
}

function guessCategory(name) {
  if (!name) return null;
  const n = name.toLowerCase();
  for (const [cat, items] of Object.entries(CATEGORIES)) {
    if (items.some((i) => n.includes(i.toLowerCase()))) return cat;
  }
  return null;
}

export default function InvestigationDetailScreen() {
  const { id } = useLocalSearchParams();
  const { investigations, getPatientById, updateInvestigation, deleteInvestigation, createTimelineEvent, mutating, currentUserId } = useData();
  const { timeString, dateString } = useClock();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const investigation = investigations.find((item) => item.id === id) || investigations[0] || null;
  const patient = investigation ? getPatientById(investigation.patientId) : null;
  const category = guessCategory(investigation?.name);

  const [showReminderInput, setShowReminderInput] = useState(false);
  const [reminderHours, setReminderHours] = useState('');

  const nextStatusIndex = investigation ? STATUS_ORDER.indexOf(investigation.status) + 1 : -1;
  const nextStatus = nextStatusIndex < STATUS_ORDER.length ? STATUS_ORDER[nextStatusIndex] : null;

  const markReviewed = useCallback(async () => {
    if (!investigation) return;
    try {
      await updateInvestigation(investigation.id, {
        status: 'Reviewed',
        completed_at: new Date().toISOString(),
        completed_by: currentUserId,
      });
      await createTimelineEvent({
        patient_id: investigation.patientId,
        type: 'investigation_reviewed',
        title: `Investigation reviewed: ${investigation.name}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Reviewed', `${investigation.name} marked as reviewed.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [investigation, updateInvestigation, createTimelineEvent, currentUserId]);

  const advanceStatus = useCallback(async () => {
    if (!investigation || !nextStatus) return;
    try {
      await updateInvestigation(investigation.id, { status: nextStatus });
      await createTimelineEvent({
        patient_id: investigation.patientId,
        type: 'investigation_updated',
        title: `Investigation status: ${investigation.name} → ${nextStatus}`,
        time: new Date().toISOString(),
      });
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [investigation, nextStatus, updateInvestigation, createTimelineEvent]);

  const setReminder = useCallback(async () => {
    if (!investigation) return;
    const hours = parseInt(reminderHours, 10);
    if (!hours || hours < 1) {
      Alert.alert('Invalid', 'Enter a valid number of hours (minimum 1).');
      return;
    }
    try {
      await updateInvestigation(investigation.id, { reminder_every_hours: hours });
      await createTimelineEvent({
        patient_id: investigation.patientId,
        type: 'reminder_updated',
        title: `Reminder set to every ${hours}h for: ${investigation.name}`,
        time: new Date().toISOString(),
      });
      setShowReminderInput(false);
      setReminderHours('');
      Alert.alert('Reminder set', `Repeats every ${hours} hours until reviewed.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [investigation, reminderHours, updateInvestigation, createTimelineEvent]);

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  function startEdit() {
    setEditDraft({
      name: investigation.name || '',
      labName: investigation.labName || '',
      priority: investigation.priority || '',
      value: investigation.value || '',
      referenceRange: investigation.referenceRange || '',
      unit: investigation.unit || '',
      category: investigation.category || category || '',
      reminderEveryHours: String(investigation.reminderEveryHours || ''),
    });
    setEditing(true);
  }

  const handleEditSave = useCallback(async () => {
    if (!investigation) return;
    try {
      await updateInvestigation(investigation.id, {
        name: editDraft.name,
        lab_name: editDraft.labName,
        priority: editDraft.priority,
        value: editDraft.value,
        reference_range: editDraft.referenceRange,
        unit: editDraft.unit,
        category: editDraft.category,
        reminder_every_hours: parseInt(editDraft.reminderEveryHours, 10) || null,
      });
      await createTimelineEvent({
        patient_id: investigation.patientId,
        type: 'investigation_updated',
        title: `Investigation updated: ${editDraft.name}`,
        time: new Date().toISOString(),
      });
      setEditing(false);
      Alert.alert('Updated', 'Investigation details saved.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [investigation, editDraft, updateInvestigation, createTimelineEvent]);

  const handleDelete = useCallback(async () => {
    if (!investigation) return;
    const ok = await confirm('Delete investigation', `Remove ${investigation.name} permanently?`);
    if (!ok) return;
    try {
      await deleteInvestigation(investigation.id);
      await createTimelineEvent({
        patient_id: investigation.patientId,
        type: 'investigation_deleted',
        title: `Investigation deleted: ${investigation.name}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Deleted', 'Investigation removed.');
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [investigation, deleteInvestigation, createTimelineEvent]);

  if (!investigation) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <BackButton colors={colors} fallback="/" label="Investigation" testID="investigation-back-notfound" />
        <Text style={{ padding: 16, color: colors.text.secondary }}>Investigation not found.</Text>
      </ScrollView>
    );
  }

  const isFlagged = investigation.value && investigation.referenceRange;
  const parsedValue = parseFloat(investigation.value);
  const parsedRef = investigation.referenceRange?.split('-').map(parseFloat).filter((n) => !isNaN(n));
  const flag = parsedRef?.length === 2 && !isNaN(parsedValue)
    ? parsedValue > parsedRef[1] ? 'High' : parsedValue < parsedRef[0] ? 'Low' : 'Normal'
    : null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Investigation" testID="investigation-back" />

      {/* Hero */}
      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <FlaskConical color={colors.brand.primary} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{investigation.name}</Text>
            <Text style={styles.meta}>{patient?.name} · {investigation.labName || category || 'Lab'}</Text>
          </View>
          <Pill label={investigation.status} tone={STATUS_TONES[investigation.status] || 'gray'} />
        </View>
        <View style={styles.clockBar}>
          <Clock color={colors.text.tertiary} size={12} strokeWidth={2} />
          <Text style={styles.clockText}>{timeString} · {dateString}</Text>
        </View>
        <View style={styles.grid}>
          <Field label="Priority" value={investigation.priority} />
          <Field label="Category" value={investigation.category || category || '—'} />
          <Field label="Ordered" value={formatDate(investigation.sentDate)} />
          <Field label="Expected" value={formatDate(investigation.expectedReportDate)} />
          <Field label="Linked cultures" value={investigation.linkedCulture || '—'} />
          <Field label="Custom alert" value={investigation.customAlertMessage || '—'} />
        </View>
      </Surface>

      {/* Result block */}
      {investigation.value ? (
        <Surface style={styles.panel}>
          <SectionHeader title="Result" subtitle={investigation.status === 'Final' || investigation.status === 'Reviewed' ? 'Final result' : 'Current result'} />
          <View style={{ height: 12 }}>
            <View style={styles.resultCard}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                  <Text style={styles.resultValue}>{investigation.value}</Text>
                  {investigation.unit ? <Text style={styles.resultUnit}>{investigation.unit}</Text> : null}
                  {flag ? (
                    <Pill
                      label={flag}
                      tone={flag === 'Normal' ? 'green' : flag === 'High' ? 'red' : 'orange'}
                      size="sm"
                    />
                  ) : null}
                </View>
                {investigation.referenceRange ? (
                  <Text style={styles.resultRef}>Ref range: {investigation.referenceRange}</Text>
                ) : null}
              </View>
            </View>
          </View>
        </Surface>
      ) : null}

      {/* Status progression */}
      <Surface style={styles.panel}>
        <SectionHeader title="Status progression" subtitle="Advance the investigation through its lifecycle." />
        <View style={{ height: 12 }} />
        <View style={styles.statusBar}>
          {STATUS_ORDER.slice(0, 7).map((s, i) => {
            const currentIndex = STATUS_ORDER.indexOf(investigation.status);
            const isActive = i <= currentIndex;
            const isNow = investigation.status === s;
            return (
              <View key={s} style={{ alignItems: 'center', width: 48 }}>
                <View style={[styles.statusDot, { backgroundColor: isNow ? colors.brand.primary : isActive ? colors.status.safe : colors.surfaceAlt, borderColor: isNow ? colors.brand.primary : colors.border }]}>
                  <Text style={{ fontFamily: typography.body, fontSize: 9, fontWeight: '700', color: isNow || isActive ? '#fff' : colors.text.tertiary }}>{i + 1}</Text>
                </View>
                <Text style={{ fontFamily: typography.body, fontSize: 8, color: isNow ? colors.brand.primary : colors.text.tertiary, textAlign: 'center', marginTop: 4 }}>{s === 'Sample Collected' ? 'Collected' : s === 'Preliminary' ? 'Prelim' : s}</Text>
              </View>
            );
          })}
        </View>
        {nextStatus ? (
          <TouchableOpacity activeOpacity={0.7} onPress={advanceStatus} disabled={mutating} style={[styles.advanceBtn, { opacity: mutating ? 0.5 : 1 }]} data-testid="inv-advance-status">
            <Text style={styles.advanceBtnText}>Advance to "{nextStatus}"</Text>
          </TouchableOpacity>
        ) : investigation.status === 'Reviewed' || investigation.status === 'Acknowledged' ? (
          <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary, fontStyle: 'italic', textAlign: 'center' }}>Final status reached</Text>
        ) : null}
      </Surface>

      {/* Category reference */}
      {category ? (
        <Surface style={styles.panel}>
          <SectionHeader title={category} subtitle="Common investigations in this category" />
          <View style={{ height: 12 }} />
          <CategoryBadge name={category} investigations={CATEGORIES[category] || []} />
        </Surface>
      ) : null}

      {/* Reminder */}
      <Surface style={styles.panel}>
        <SectionHeader title="Reminder cadence" subtitle={`${investigation.reminderEveryHours || '—'}h repeat until reviewed.`} />
        <View style={{ height: 12 }} />
        {showReminderInput ? (
          <View style={styles.reminderRow}>
            <TextInput style={styles.reminderInput} placeholder="Hours (e.g. 24)" placeholderTextColor={colors.text.tertiary} value={reminderHours} onChangeText={setReminderHours} keyboardType="numeric" autoFocus data-testid="reminder-hours-input" />
            <TouchableOpacity activeOpacity={0.7} onPress={setReminder} disabled={!reminderHours.trim()} data-testid="reminder-save" style={[styles.reminderSave, { opacity: reminderHours.trim() ? 1 : 0.5 }]}><Text style={styles.reminderSaveText}>Set</Text></TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => { setShowReminderInput(false); setReminderHours(''); }} data-testid="reminder-cancel"><Text style={styles.reminderCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowReminderInput(true)} data-testid="inv-change-reminder">
            <View style={styles.contextBox}>
              <MessageSquare color={colors.text.tertiary} size={18} strokeWidth={2} />
              <Text style={styles.contextText}>Automatic reminders repeat every {investigation.reminderEveryHours || '—'}h until reviewed. Tap to change.</Text>
            </View>
          </TouchableOpacity>
        )}
      </Surface>

      {/* Actions */}
      <Surface style={styles.panel}>
        <SectionHeader title="Actions" subtitle="Manage this investigation during rounds." />
        <View style={{ height: 12 }} />
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={markReviewed} disabled={mutating} data-testid="inv-action-review" style={{ flex: 1, opacity: mutating ? 0.5 : 1 }}>
            <Surface style={styles.actionCard}>
              <ShieldCheck color={colors.status.safe} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Mark reviewed</Text>
            </Surface>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => { setReminderHours(String(investigation.reminderEveryHours || '')); setShowReminderInput(true); }} data-testid="inv-action-repeat" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <Repeat color={colors.status.warning} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Repeat reminder</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Edit / Delete */}
      <Surface style={styles.panel}>
        <SectionHeader title="Management" subtitle="Edit details or delete this entry." />
        <View style={{ height: 12 }} />
        {editing ? (
          <View style={{ gap: 10 }}>
            <TextInput style={styles.editInput} value={editDraft.name} onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))} placeholder="Investigation name" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-name" />
            <TextInput style={styles.editInput} value={editDraft.category} onChangeText={(v) => setEditDraft((d) => ({ ...d, category: v }))} placeholder="Category" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-category" />
            <TextInput style={styles.editInput} value={editDraft.labName} onChangeText={(v) => setEditDraft((d) => ({ ...d, labName: v }))} placeholder="Lab name" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-lab" />
            <TextInput style={styles.editInput} value={editDraft.priority} onChangeText={(v) => setEditDraft((d) => ({ ...d, priority: v }))} placeholder="Priority" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-priority" />
            <TextInput style={styles.editInput} value={editDraft.value} onChangeText={(v) => setEditDraft((d) => ({ ...d, value: v }))} placeholder="Result value" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-value" />
            <TextInput style={styles.editInput} value={editDraft.referenceRange} onChangeText={(v) => setEditDraft((d) => ({ ...d, referenceRange: v }))} placeholder="Reference range (e.g. 4-11)" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-range" />
            <TextInput style={styles.editInput} value={editDraft.unit} onChangeText={(v) => setEditDraft((d) => ({ ...d, unit: v }))} placeholder="Unit (e.g. x10³/µL)" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-unit" />
            <TextInput style={styles.editInput} value={editDraft.reminderEveryHours} onChangeText={(v) => setEditDraft((d) => ({ ...d, reminderEveryHours: v }))} placeholder="Reminder hours" keyboardType="numeric" placeholderTextColor={colors.text.tertiary} data-testid="inv-edit-reminder" />
            <View style={styles.editActions}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditing(false)} data-testid="inv-edit-cancel"><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.tertiary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={handleEditSave} disabled={mutating} data-testid="inv-edit-save" style={{ opacity: mutating ? 0.5 : 1 }}><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.manageRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={startEdit} disabled={mutating} style={styles.manageBtn} data-testid="inv-edit-btn">
              <Edit2 color={colors.brand.primary} size={16} strokeWidth={2} />
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} disabled={mutating} style={[styles.manageBtn, { opacity: mutating ? 0.5 : 1 }]} data-testid="inv-delete-btn">
              <Trash2 color={colors.status.critical} size={16} strokeWidth={2} />
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.status.critical }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </Surface>
    </ScrollView>
  );
}

function createStyles(colors) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  backText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary },
  hero: { padding: 16, gap: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.brand.primarySoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: typography.heading, fontSize: 22, fontWeight: '800', color: colors.text.primary },
  meta: { marginTop: 4, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  clockBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  clockText: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { padding: 14 },
  resultCard: { flexDirection: 'row', padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  resultValue: { fontFamily: typography.heading, fontSize: 28, fontWeight: '800', color: colors.text.primary },
  resultUnit: { fontFamily: typography.body, fontSize: 14, color: colors.text.secondary },
  resultRef: { marginTop: 6, fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary },
  contextBox: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  contextText: { flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  statusBar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  statusDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  advanceBtn: { marginTop: 12, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.brand.primary, alignItems: 'center' },
  advanceBtnText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.surface },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionCard: { minHeight: 88, padding: 12, gap: 8, justifyContent: 'center' },
  actionTitle: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  editInput: { minHeight: 40, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  manageRow: { flexDirection: 'row', gap: 16 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reminderInput: { flex: 1, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13 },
  reminderSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.brand.primary },
  reminderSaveText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  reminderCancelText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.tertiary },
}); }
