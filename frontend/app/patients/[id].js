import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { FlaskConical, Pill as PillIcon, BadgeInfo, Trash2, Plus, X, Syringe, Clock } from 'lucide-react-native';

import { DailyChecklist } from '../../src/components/checklist';
import { Timeline } from '../../src/components/timeline';
import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { radius, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';
import { useData } from '../../src/contexts/DataContext';
import { daysBetween, formatDate, normalizeKeys } from '../../src/lib/format';
import { confirm } from '../../src/lib/confirm';
import { BackButton } from '../../src/components/back-button';
import { API_BASE_URL } from '../../src/lib/config';
import { useClock } from '../../src/hooks/use-clock';


export default function PatientDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const { patients, investigations, antibiotics, devices, timelineEvents, getPatientById, getInvestigationsByPatient, getAntibioticsByPatient, getDevicesByPatient, getTimelineByPatient, updatePatient, deletePatient, deleteDevice, updateDevice, createDevice, createTimelineEvent, mutating, currentUserId, refetchAll } = useData();
  const { timeString, dateString } = useClock();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const contextPatient = getPatientById(id) || patients[0] || null;
  const [localPatient, setLocalPatient] = useState(null);
  const patient = localPatient ?? contextPatient;
  const relatedInvestigations = patient ? getInvestigationsByPatient(patient.id) : [];
  const relatedAntibiotics = patient ? getAntibioticsByPatient(patient.id) : [];
  const relatedDevices = patient ? getDevicesByPatient(patient.id) : [];

  const timeline = useMemo(() => (id ? getTimelineByPatient(id) : []), [getTimelineByPatient, id, timelineEvents]);

  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [newDeviceType, setNewDeviceType] = useState('');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const handleChecklistToggle = useCallback(async (patientId, fullChecklist, key, value) => {
    if (!patientId || !fullChecklist) return;
    await updatePatient(patientId, { daily_checklist: fullChecklist });
    try {
      await createTimelineEvent({
        patient_id: patientId,
        type: key,
        title: value ? `Checked: ${key}` : `Unchecked: ${key}`,
        time: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Timeline event creation failed (checklist still saved):', e);
    }
  }, [updatePatient, createTimelineEvent]);

  const handleUpdateChecklist = useCallback(async (patientId, fullChecklist) => {
    await updatePatient(patientId, { daily_checklist: fullChecklist });
    await createTimelineEvent({
      patient_id: patientId,
      type: 'checklist_updated',
      title: 'Daily checklist updated',
      time: new Date().toISOString(),
    }).catch(() => {});
  }, [updatePatient, createTimelineEvent]);

  const handleDeletePatient = useCallback(async () => {
    if (!patient) return;
    const ok = await confirm('Delete patient', `Remove ${patient.name} and all associated data? This cannot be undone.`);
    if (!ok) return;
    try {
      await createTimelineEvent({
        patient_id: patient.id,
        type: 'patient_discharged',
        title: `Patient discharged: ${patient.name}`,
        time: new Date().toISOString(),
      }).catch(() => {});
      await deletePatient(patient.id);
      Alert.alert('Deleted', `${patient.name} has been removed.`);
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [patient, deletePatient, createTimelineEvent]);

  const handleSaveNote = useCallback(async () => {
    if (!patient || savingNote) return;
    setSavingNote(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteDraft }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setLocalPatient({ ...normalizeKeys(updated) });
      setNoteEditing(false);
      await createTimelineEvent({
        patient_id: patient.id,
        type: 'note',
        title: `Clinical note updated: ${noteDraft.slice(0, 60)}${noteDraft.length > 60 ? '...' : ''}`,
        time: new Date().toISOString(),
      }).catch(() => {});
      refetchAll();
      Alert.alert('Saved', 'Clinical note updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingNote(false);
    }
  }, [patient, noteDraft, savingNote, refetchAll, createTimelineEvent]);

  const handleAddDevice = useCallback(async () => {
    if (!patient || !newDeviceType.trim()) return;
    try {
      await createDevice({
        patient_id: patient.id,
        type: newDeviceType.trim(),
        insertion_date: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
      await createTimelineEvent({
        patient_id: patient.id,
        type: 'device_inserted',
        title: `Device inserted: ${newDeviceType.trim()}`,
        time: new Date().toISOString(),
      });
      setNewDeviceType('');
      setShowAddDevice(false);
      Alert.alert('Added', `${newDeviceType.trim()} has been added.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [patient, newDeviceType, createDevice, createTimelineEvent]);

  const handleRemoveDevice = useCallback(async (device) => {
    if (!patient) return;
    const ok = await confirm('Remove device', `Mark ${device.type} as removed?`);
    if (!ok) return;
    try {
      await updateDevice(device.id, {
        status: 'Removed',
        removal_date: new Date().toISOString().split('T')[0],
        removed_by: currentUserId,
      });
      await createTimelineEvent({
        patient_id: patient.id,
        type: 'device_removed',
        title: `Device removed: ${device.type}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Removed', `${device.type} marked as removed.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [patient, updateDevice, createTimelineEvent, currentUserId]);

  if (!patient) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <BackButton colors={colors} fallback="/" label="Patients" testID="patient-back-notfound" />
        <Text style={{ padding: 16, color: colors.text.secondary }}>Patient not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Patients" testID="patient-detail-back" />
      <View style={styles.clockBar}>
        <Clock color={colors.text.tertiary} size={13} strokeWidth={2} />
        <Text style={styles.clockText}>{timeString} · {dateString}</Text>
      </View>

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
          onPress={() => router.push(`/new?type=investigation&patientId=${patient.id}`)}
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
          onPress={() => router.push(`/new?type=antibiotic&patientId=${patient.id}`)}
          data-testid="patient-add-antibiotic"
          style={{ flex: 1 }}
        >
          <Surface style={styles.quickCard}>
            <PillIcon color={colors.status.warning} size={18} strokeWidth={2} />
            <Text style={styles.quickTitle}>Add antibiotic</Text>
          </Surface>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push(`/new?type=device&patientId=${patient.id}`)}
          data-testid="patient-add-device"
          style={{ flex: 1 }}
        >
          <Surface style={styles.quickCard}>
            <Syringe color={colors.status.info} size={18} strokeWidth={2} />
            <Text style={styles.quickTitle}>Add device</Text>
          </Surface>
        </TouchableOpacity>
      </View>

      <Surface style={styles.panel}>
        <SectionHeader title="Daily checklist" subtitle="Tap to toggle. Resets every day." />
        <View style={{ height: 12 }} />
        <DailyChecklist patientId={id} initialChecklist={patient?.dailyChecklist} onToggle={handleChecklistToggle} editable onUpdateChecklist={handleUpdateChecklist} />
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
        <SectionHeader
          title="Devices"
          subtitle="Insertion, necessity review, and removal dates."
          action={
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowAddDevice(true)}
              data-testid="patient-add-device"
              style={styles.addBtn}
            >
              <Plus color={colors.brand.primary} size={16} strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          }
        />
        <View style={{ height: 12 }} />
        {showAddDevice && (
          <View style={styles.addDeviceRow}>
            <TextInput
              style={styles.addDeviceInput}
              placeholder="Device type (e.g. Central Line)"
              placeholderTextColor={colors.text.tertiary}
              value={newDeviceType}
              onChangeText={setNewDeviceType}
              autoFocus
              data-testid="device-type-input"
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleAddDevice}
              disabled={!newDeviceType.trim() || mutating}
              data-testid="device-save-btn"
              style={[styles.addDeviceSave, { opacity: newDeviceType.trim() && !mutating ? 1 : 0.5 }]}
            >
              <Text style={styles.addDeviceSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setShowAddDevice(false); setNewDeviceType(''); }}
              data-testid="device-cancel-btn"
            >
              <X color={colors.text.tertiary} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
        {relatedDevices.map((item) => (
          <TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => router.push(`/devices/${item.id}`)} data-testid={`device-link-${item.id}`}>
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.type}</Text>
                <Text style={styles.listMeta}>
                  Inserted {formatDate(item.insertionDate)} · Review {formatDate(item.reviewReminder)}
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => handleRemoveDevice(item)} disabled={mutating} data-testid={`device-remove-${item.id}`} style={styles.removeBtn}>
                <Trash2 color={colors.status.critical} size={16} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Timeline" subtitle="GitHub-style activity feed for everything that happens." />
        <View style={{ height: 12 }} />
        <Timeline items={timeline} />
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader
          title="Clinical note"
          subtitle="Single line summary for the ICU round."
          action={
            !noteEditing ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => { setNoteDraft(patient.notes || ''); setNoteEditing(true); }}
                data-testid="patient-edit-note"
              >
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <View style={{ height: 12 }} />
        {noteEditing ? (
          <View style={styles.noteEditBox}>
            <TextInput
              style={styles.noteInput}
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="Enter clinical note..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              autoFocus
              data-testid="note-input"
            />
            <View style={styles.noteActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setNoteEditing(false)}
                data-testid="note-cancel"
              >
                <Text style={styles.noteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSaveNote}
                disabled={!noteDraft.trim() || savingNote}
                data-testid="note-save"
                style={{ opacity: noteDraft.trim() && !savingNote ? 1 : 0.5 }}
              >
                <Text style={styles.noteSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noteBox}>
            <BadgeInfo color={colors.brand.primary} size={18} strokeWidth={2} />
            <Text style={styles.noteText}>{patient.notes || 'No clinical note yet. Tap Edit to add one.'}</Text>
          </View>
        )}
      </Surface>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleDeletePatient}
        disabled={mutating}
        data-testid="patient-delete"
        style={[styles.deleteRow, { opacity: mutating ? 0.5 : 1 }]}
      >
        <Trash2 color={colors.status.critical} size={16} strokeWidth={2} />
        <Text style={styles.deleteText}>Delete patient</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function createStyles(colors) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
  backText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary },
  clockBar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clockText: { fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary },
  hero: { padding: 16, gap: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  name: { fontFamily: typography.heading, fontSize: 24, fontWeight: '800', color: colors.text.primary },
  meta: { marginTop: 4, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  diagnosis: { fontFamily: typography.body, fontSize: 13, color: colors.text.primary, lineHeight: 18 },
  heroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { padding: 14 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: { padding: 12, minHeight: 82, gap: 8, justifyContent: 'center' },
  quickTitle: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  listItem: { minHeight: 54, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTopWidth: 1, borderTopColor: colors.border },
  listTitle: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  listMeta: { marginTop: 3, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  noteBox: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'flex-start' },
  noteText: { flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  noteEditBox: { gap: 10 },
  noteInput: { minHeight: 80, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13, lineHeight: 18, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  noteCancelText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.tertiary },
  noteSaveText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary },
  editBtn: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary },
  addDeviceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  addDeviceInput: { flex: 1, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13 },
  addDeviceSave: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.brand.primary },
  addDeviceSaveText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.inverse },
  removeBtn: { padding: 8 },
  deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  deleteText: { fontFamily: typography.bodyMedium, fontSize: 14, fontWeight: '700', color: colors.status.critical },
}); }
