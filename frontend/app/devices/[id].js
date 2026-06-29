import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Syringe, Clock, Edit2, Trash2, FlaskConical, Pill as PillIcon, ExternalLink, Repeat, ShieldAlert } from 'lucide-react-native';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { Dropdown } from '../../src/components/dropdown';
import { radius, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';
import { useData } from '../../src/contexts/DataContext';
import { formatDate, daysBetween } from '../../src/lib/format';
import { confirm } from '../../src/lib/confirm';
import { BackButton } from '../../src/components/back-button';
import { useClock } from '../../src/hooks/use-clock';

const DEVICE_CATEGORIES = [
  'Airway', 'Ventilator', 'Vascular Access', 'Drains', 'Urinary', 'Feeding',
  'Renal', 'Monitoring', 'Cardiac', 'Respiratory Support', 'Other',
];

const BODY_SITES = [
  'Right IJV', 'Left IJV', 'Right Femoral', 'Left Femoral', 'Right Subclavian',
  'Left Subclavian', 'Right Radial', 'Left Radial', 'Right Chest', 'Left Chest',
  'Abdomen', 'Pelvis', 'Neck', 'Arm', 'Leg', 'Foot', 'Spine', 'Brain',
];

const SIDE_OPTIONS = ['Right', 'Left', 'Bilateral', 'Midline'];

const SITE_ASSESSMENT = [
  'Clean', 'Dry', 'Intact', 'Redness', 'Tenderness', 'Swelling',
  'Leakage', 'Bleeding', 'Pus', 'Dislodged',
];

const STATUS_TONES = {
  Planned: 'blue', Ordered: 'blue', Inserted: 'green', Active: 'green',
  'Needs Review': 'orange', 'Suspected Infection': 'red', Blocked: 'red',
  Malfunction: 'red', Removed: 'gray', Replaced: 'gray', Expired: 'gray',
};

export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams();
  const { api, devices, getPatientById, updateDevice, createTimelineEvent, deleteDevice, mutating, currentUserId } = useData();
  const { timeString, dateString } = useClock();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const device = devices.find((item) => item.id === id) || null;
  const patient = device ? getPatientById(device.patientId) : null;
  const daysInSitu = device?.insertionDate ? daysBetween(device.insertionDate) + 1 : 0;

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});

  function startEdit() {
    setEditDraft({
      type: device.type || '',
      bodySite: device.bodySite || '',
      side: device.side || '',
      indication: device.indication || '',
      insertionDate: device.insertionDate || '',
      reviewReminder: device.reviewReminder || '',
      notes: device.notes || '',
    });
    setEditing(true);
  }

  const handleEditSave = useCallback(async () => {
    if (!device) return;
    try {
      await updateDevice(device.id, {
        type: editDraft.type,
        body_site: editDraft.bodySite,
        side: editDraft.side,
        indication: editDraft.indication,
        insertion_date: editDraft.insertionDate,
        review_reminder: editDraft.reviewReminder,
        notes: editDraft.notes,
      });
      await createTimelineEvent({
        patient_id: device.patientId,
        type: 'device_updated',
        title: `Device updated: ${device.type}`,
        time: new Date().toISOString(),
      });
      setEditing(false);
      Alert.alert('Updated', 'Device details saved.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [device, editDraft, updateDevice, createTimelineEvent]);

  const handleRemove = useCallback(async () => {
    if (!device) return;
    const ok = await confirm('Remove device', `Mark ${device.type} as removed?`);
    if (!ok) return;
    try {
      await updateDevice(device.id, {
        status: 'Removed',
        removal_date: new Date().toISOString().split('T')[0],
        removed_by: currentUserId,
      });
      await createTimelineEvent({
        patient_id: device.patientId,
        type: 'device_removed',
        title: `Device removed: ${device.type}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Removed', `${device.type} marked as removed.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [device, updateDevice, createTimelineEvent, currentUserId]);

  const handleDelete = useCallback(async () => {
    if (!device) return;
    const ok = await confirm('Delete device', `Remove ${device.type} permanently?`);
    if (!ok) return;
    try {
      await createTimelineEvent({
        patient_id: device.patientId,
        type: 'device_deleted',
        title: `Device deleted: ${device.type}`,
        time: new Date().toISOString(),
      }).catch(() => {});
      await deleteDevice(device.id);
      Alert.alert('Deleted', 'Device removed.');
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [device, deleteDevice, createTimelineEvent]);

  if (!device) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <BackButton colors={colors} fallback="/" label="Device" testID="device-back-notfound" />
        <Text style={{ padding: 16, color: colors.text.secondary }}>Device not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Device" testID="device-back" />

      {/* Hero */}
      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <Syringe color={colors.status.info} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{device.type || 'Device'}</Text>
            <Text style={styles.meta}>{patient?.name}{device.bodySite ? ` · ${device.bodySite}` : ''}</Text>
          </View>
          <Pill label={device.status || 'Active'} tone={STATUS_TONES[device.status] || 'green'} />
        </View>
        <View style={styles.clockBar}>
          <Clock color={colors.text.tertiary} size={12} strokeWidth={2} />
          <Text style={styles.clockText}>{timeString} · {dateString}</Text>
        </View>
      </Surface>

      {/* Status info */}
      <Surface style={styles.panel}>
        <SectionHeader title="Device status" subtitle={device.status === 'Removed' ? `Removed ${formatDate(device.removalDate)}` : `Active for ${daysInSitu} day(s)`} />
        <View style={{ height: 12 }} />
        <View style={styles.grid}>
          <Field label="Inserted" value={formatDate(device.insertionDate)} />
          <Field label="Review" value={formatDate(device.reviewReminder)} />
          <Field label="Side" value={device.side || '—'} />
          <Field label="Body site" value={device.bodySite || '—'} />
          <Field label="Linked cultures" value={device.linkedCulture || '—'} />
          <Field label="Custom alert" value={device.customAlertMessage || '—'} />
        </View>
        {device.indication ? <Field label="Indication" value={device.indication} /> : null}
        {device.notes ? <Field label="Notes" value={device.notes} /> : null}
      </Surface>

      {/* Site assessment */}
      <Surface style={styles.panel}>
        <SectionHeader title="Site assessment" subtitle="Daily review of insertion site condition." />
        <View style={{ height: 12 }} />
        <View style={styles.assessmentRow}>
          {SITE_ASSESSMENT.map((item) => (
            <TouchableOpacity
              key={item}
              activeOpacity={0.7}
              onPress={async () => {
                try {
                  await updateDevice(device.id, { site_assessment: item });
                  await createTimelineEvent({
                    patient_id: device.patientId,
                    type: 'device_site_assessed',
                    title: `Device site: ${device.type} — ${item}`,
                    time: new Date().toISOString(),
                  }).catch(() => {});
                  Alert.alert('Recorded', `Site marked as: ${item}`);
                } catch (e) {
                  Alert.alert('Error', e.message);
                }
              }}
              disabled={mutating}
              style={[styles.assessChip, { opacity: mutating ? 0.5 : 1 }]}
              data-testid={`device-assess-${item.toLowerCase()}`}
            >
              <Text style={styles.assessChipText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {device.siteAssessment ? (
          <View style={{ marginTop: 8, padding: 10, borderRadius: radius.md, backgroundColor: colors.surfaceAlt }}>
            <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.text.secondary }}>
              Last assessment: {device.siteAssessment}
            </Text>
          </View>
        ) : null}
      </Surface>

      {/* Linked info */}
      <Surface style={styles.panel}>
        <SectionHeader title="Clinical links" subtitle="Cultures and antibiotics linked to this device." />
        <View style={{ height: 12 }} />
        <TouchableOpacity activeOpacity={0.7} style={styles.linkRow} data-testid="device-link-culture">
          <FlaskConical color={colors.brand.primary} size={16} strokeWidth={2} />
          <Text style={{ flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text.primary }}>
            {device.linkedCulture || 'No linked culture'}
          </Text>
          <ExternalLink color={colors.text.tertiary} size={14} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.linkRow} data-testid="device-link-antibiotic">
          <PillIcon color={colors.status.warning} size={16} strokeWidth={2} />
          <Text style={{ flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text.primary }}>
            {device.linkedAntibiotic || 'No linked antibiotic'}
          </Text>
          <ExternalLink color={colors.text.tertiary} size={14} strokeWidth={2} />
        </TouchableOpacity>
      </Surface>

      {/* Actions */}
      <Surface style={styles.panel}>
        <SectionHeader title="Actions" subtitle="Remove, replace, or review this device." />
        <View style={{ height: 12 }} />
        <View style={styles.actionRow}>
          <TouchableOpacity activeOpacity={0.7} onPress={handleRemove} disabled={mutating || device.status === 'Removed'} data-testid="device-remove" style={{ flex: 1, opacity: mutating || device.status === 'Removed' ? 0.5 : 1 }}>
            <Surface style={styles.actionCard}>
              <ShieldAlert color={colors.status.critical} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Remove</Text>
            </Surface>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/new?type=device&patientId=${device.patientId}`)} data-testid="device-replace" style={{ flex: 1 }}>
            <Surface style={styles.actionCard}>
              <Repeat color={colors.status.info} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Replace</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Edit / Delete */}
      <Surface style={styles.panel}>
        <SectionHeader title="Management" subtitle="Edit details or delete this device." />
        <View style={{ height: 12 }} />
        {editing ? (
          <View style={{ gap: 10 }}>
            <TextInput style={styles.editInput} value={editDraft.type} onChangeText={(v) => setEditDraft((d) => ({ ...d, type: v }))} placeholder="Device type" placeholderTextColor={colors.text.tertiary} data-testid="device-edit-type" />
            <Dropdown options={BODY_SITES} value={editDraft.bodySite} onSelect={(v) => setEditDraft((d) => ({ ...d, bodySite: v }))} testId="device-edit-site" />
            <Dropdown options={SIDE_OPTIONS} value={editDraft.side} onSelect={(v) => setEditDraft((d) => ({ ...d, side: v }))} testId="device-edit-side" />
            <TextInput style={styles.editInput} value={editDraft.indication} onChangeText={(v) => setEditDraft((d) => ({ ...d, indication: v }))} placeholder="Indication" placeholderTextColor={colors.text.tertiary} data-testid="device-edit-indication" />
            <TextInput style={styles.editInput} value={editDraft.insertionDate} onChangeText={(v) => setEditDraft((d) => ({ ...d, insertionDate: v }))} placeholder="Insertion date (YYYY-MM-DD)" placeholderTextColor={colors.text.tertiary} data-testid="device-edit-date" />
            <TextInput style={styles.editInput} value={editDraft.reviewReminder} onChangeText={(v) => setEditDraft((d) => ({ ...d, reviewReminder: v }))} placeholder="Review reminder (YYYY-MM-DD)" placeholderTextColor={colors.text.tertiary} data-testid="device-edit-review" />
            <TextInput style={styles.editInput} value={editDraft.notes} onChangeText={(v) => setEditDraft((d) => ({ ...d, notes: v }))} placeholder="Notes" placeholderTextColor={colors.text.tertiary} data-testid="device-edit-notes" />
            <View style={styles.editActions}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditing(false)} data-testid="device-edit-cancel"><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.tertiary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={handleEditSave} disabled={mutating} data-testid="device-edit-save" style={{ opacity: mutating ? 0.5 : 1 }}><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.manageRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={startEdit} disabled={mutating} style={styles.manageBtn} data-testid="device-edit-btn">
              <Edit2 color={colors.brand.primary} size={16} strokeWidth={2} />
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} disabled={mutating} style={[styles.manageBtn, { opacity: mutating ? 0.5 : 1 }]} data-testid="device-delete-btn">
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
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: typography.heading, fontSize: 22, fontWeight: '800', color: colors.text.primary },
  meta: { marginTop: 4, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  clockBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  clockText: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { padding: 14 },
  assessmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  assessChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  assessChipText: { fontFamily: typography.body, fontSize: 11, fontWeight: '600', color: colors.text.secondary },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: 8 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionCard: { minHeight: 88, padding: 12, gap: 8, justifyContent: 'center' },
  actionTitle: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  editInput: { minHeight: 40, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  manageRow: { flexDirection: 'row', gap: 16 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
}); }
