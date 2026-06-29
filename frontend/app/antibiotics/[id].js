import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { CircleDot, Edit2, ExternalLink, FlaskConical, Link2, Pill as PillIcon, Plus, Repeat2, StopCircle, Trash2, Unlink, X } from 'lucide-react-native';
import { CultureReferenceModal } from '../../src/components/culture-reference-modal';
import { CultureLinkModal } from '../../src/components/culture-link-modal';
import { DrugPickerModal } from '../../src/components/drug-picker-modal';
import { RoutePicker } from '../../src/components/route-picker';
import { CulturePicker } from '../../src/components/culture-picker';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { radius, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';
import { useData } from '../../src/contexts/DataContext';
import { formatDate } from '../../src/lib/format';
import { confirm } from '../../src/lib/confirm';
import { BackButton } from '../../src/components/back-button';

export default function AntibioticDetailScreen() {
  const { id } = useLocalSearchParams();
  const { api, antibiotics, getPatientById, updateAntibiotic, deleteAntibiotic, createTimelineEvent, mutating, currentUserId, unlinkCulture } = useData();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const antibiotic = antibiotics.find((item) => item.id === id) || antibiotics[0] || null;
  const patient = antibiotic ? getPatientById(antibiotic.patientId) : null;

  const [linkedCultures, setLinkedCultures] = useState([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [showCultureLinkModal, setShowCultureLinkModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoadingLinks(true);
    api.getLinkedCultures(id)
      .then(setLinkedCultures)
      .catch(() => setLinkedCultures([]))
      .finally(() => setLoadingLinks(false));
  }, [id]);

  const handleContinue = useCallback(async () => {
    if (!antibiotic) return;
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 3);
    try {
      await updateAntibiotic(antibiotic.id, {
        action: 'Continue',
        day: (antibiotic.day || 1) + 1,
        review_date: nextReview.toISOString(),
        status: 'Active',
      });
      await createTimelineEvent({
        patient_id: antibiotic.patientId,
        type: 'antibiotic_continued',
        title: `Antibiotic continued: ${antibiotic.drugName}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Continued', `${antibiotic.drugName} marked as continued. Next review: ${formatDate(nextReview)}.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [antibiotic, updateAntibiotic, createTimelineEvent]);

  const handleStop = useCallback(async () => {
    if (!antibiotic) return;
    const ok = await confirm('Stop antibiotic', `Stop ${antibiotic.drugName}?`);
    if (!ok) return;
    try {
      await updateAntibiotic(antibiotic.id, {
        action: 'Stop',
        status: 'Stopped',
        stopped_at: new Date().toISOString(),
        stopped_by: currentUserId,
      });
      await createTimelineEvent({
        patient_id: antibiotic.patientId,
        type: 'antibiotic_stopped',
        title: `Antibiotic stopped: ${antibiotic.drugName}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Stopped', `${antibiotic.drugName} stopped and removed from active list.`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [antibiotic, updateAntibiotic, createTimelineEvent, currentUserId]);

  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState({});
  const [showCultureRef, setShowCultureRef] = useState(false);
  const [showDrugRef, setShowDrugRef] = useState(false);
  const [showDrugPicker, setShowDrugPicker] = useState(false);
  const [showRoutePicker, setShowRoutePicker] = useState(false);
  const [showCulturePicker, setShowCulturePicker] = useState(false);

  function startEdit() {
    setEditDraft({
      drugName: antibiotic.drugName || '',
      dose: antibiotic.dose || '',
      route: antibiotic.route || '',
      frequency: antibiotic.frequency || '',
      indication: antibiotic.indication || '',
      expectedDuration: antibiotic.expectedDuration || '',
      linkedCulture: antibiotic.linkedCulture || '',
    });
    setEditing(true);
  }

  const handleEditSave = useCallback(async () => {
    if (!antibiotic) return;
    try {
      await updateAntibiotic(antibiotic.id, {
        drug_name: editDraft.drugName,
        dose: editDraft.dose,
        route: editDraft.route,
        frequency: editDraft.frequency,
        indication: editDraft.indication,
        expected_duration: editDraft.expectedDuration,
        linked_culture: editDraft.linkedCulture,
      });
      await createTimelineEvent({
        patient_id: antibiotic.patientId,
        type: 'antibiotic_updated',
        title: `Antibiotic updated: ${editDraft.drugName}`,
        time: new Date().toISOString(),
      });
      setEditing(false);
      Alert.alert('Updated', 'Antibiotic details saved.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [antibiotic, editDraft, updateAntibiotic, createTimelineEvent]);

  const handleDelete = useCallback(async () => {
    if (!antibiotic) return;
    const ok = await confirm('Delete antibiotic', `Remove ${antibiotic.drugName} permanently?`);
    if (!ok) return;
    try {
      await deleteAntibiotic(antibiotic.id);
      await createTimelineEvent({
        patient_id: antibiotic.patientId,
        type: 'antibiotic_deleted',
        title: `Antibiotic deleted: ${antibiotic.drugName}`,
        time: new Date().toISOString(),
      });
      Alert.alert('Deleted', 'Antibiotic removed.');
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }, [antibiotic, createTimelineEvent]);

  const handleUnlink = async (linkId) => {
    const ok = await confirm('Unlink culture', 'Remove this culture link?');
    if (!ok) return;
    try {
      await unlinkCulture(linkId);
      setLinkedCultures((prev) => prev.filter((l) => l.id !== linkId));
      await createTimelineEvent({
        patient_id: antibiotic.patientId,
        type: 'antibiotic_culture_unlinked',
        title: `Culture unlinked from ${antibiotic.drugName}`,
        time: new Date().toISOString(),
      }).catch(() => {});
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const totalSensitive = useMemo(() => {
    let count = 0;
    for (const link of linkedCultures) {
      for (const org of link.culture?.organisms || []) {
        for (const sens of org.sensitivities || []) {
          if (sens.susceptibility === 'Sensitive') count++;
        }
      }
    }
    return count;
  }, [linkedCultures]);

  if (!antibiotic) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <BackButton colors={colors} fallback="/" label="Antibiotic" testID="antibiotic-back-notfound" />
        <Text style={{ padding: 16, color: colors.text.secondary }}>Antibiotic not found.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Antibiotic" testID="antibiotic-back" />

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
          {antibiotic.linkedCulture ? <Field label="Cultures" value={antibiotic.linkedCulture} /> : null}
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

      {/* ── Linked Cultures ── */}
      <Surface style={styles.panel}>
        <SectionHeader
          title={`Linked Cultures (${linkedCultures.length})`}
          subtitle="Microbiology evidence supporting this antibiotic"
          action={
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCultureLinkModal(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }} data-testid="abx-add-culture-link">
              <Plus color={colors.brand.primary} size={14} strokeWidth={2} />
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '700', color: colors.brand.primary }}>Link</Text>
            </TouchableOpacity>
          }
        />
        <View style={{ height: 12 }} />

        {loadingLinks ? (
          <ActivityIndicator color={colors.brand.primary} />
        ) : linkedCultures.length === 0 && !antibiotic.linkedCulture ? (
          <TouchableOpacity activeOpacity={0.7} onPress={() => setShowCultureLinkModal(true)} style={styles.emptyLink}>
            <Link2 color={colors.text.tertiary} size={20} strokeWidth={2} />
            <Text style={styles.emptyLinkText}>No cultures linked. Tap to link a microbiology culture.</Text>
          </TouchableOpacity>
        ) : linkedCultures.length === 0 && antibiotic.linkedCulture ? (
          <View style={styles.emptyLink}>
            <FlaskConical color={colors.text.tertiary} size={20} strokeWidth={2} />
            <Text style={styles.emptyLinkText}>Cultures: {antibiotic.linkedCulture}</Text>
          </View>
        ) : (
          linkedCultures.map((link) => {
            const culture = link.culture;
            if (!culture) return null;
            const topOrg = culture.organisms?.[0];
            return (
              <View key={link.id} style={styles.linkedCultureCard}>
                {/* Header */}
                <View style={styles.lcHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <FlaskConical color={colors.brand.primary} size={16} strokeWidth={2} />
                    <Text style={styles.lcType}>{culture.cultureType}</Text>
                    <Pill label={culture.status || 'Ordered'} tone={culture.status === 'Final Growth' || culture.status === 'Sensitivity Complete' ? 'green' : culture.status === 'No Growth' ? 'gray' : 'orange'} />
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/cultures/${culture.id}`)}
                      data-testid={`abx-view-culture-${culture.id}`}
                    >
                      <ExternalLink color={colors.brand.primary} size={16} strokeWidth={2} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleUnlink(link.id)}
                      data-testid={`abx-unlink-culture-${culture.id}`}
                    >
                      <Unlink color={colors.status.critical} size={16} strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Meta */}
                <View style={styles.lcMeta}>
                  <Text style={styles.lcMetaText}>
                    {culture.specimenNumber ? `#${culture.specimenNumber} · ` : ''}
                    Collected {culture.collectionDatetime ? formatDate(culture.collectionDatetime) : '—'}
                  </Text>
                  <Text style={styles.lcReason}>Reason: {link.linkReason || 'Empirical Therapy'}</Text>
                </View>

                {/* Organisms & Sensitivity */}
                {(culture.organisms || []).length > 0 ? (
                  <View style={styles.lcOrgSection}>
                    {culture.organisms.map((org, oi) => (
                      <View key={org.id || oi} style={styles.lcOrg}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.lcOrgName}>{org.organismName}</Text>
                          {org.resistanceMarker ? <Pill label={org.resistanceMarker} tone="red" size="sm" /> : null}
                        </View>
                        {(org.sensitivities || []).length > 0 ? (
                          <View style={styles.sensTable}>
                            {org.sensitivities.filter((s) => s.susceptibility === 'Sensitive' || s.susceptibility === 'Resistant').slice(0, 5).map((s, si) => (
                              <View key={s.id || si} style={styles.sensRow}>
                                <Text style={styles.sensAbx}>{s.antibiotic}</Text>
                                <Text style={[styles.sensResult, { color: s.susceptibility === 'Sensitive' ? '#16a34a' : s.susceptibility === 'Resistant' ? '#dc2626' : colors.text.secondary }]}>
                                  {s.susceptibility === 'Sensitive' ? 'S' : s.susceptibility === 'Resistant' ? 'R' : s.susceptibility === 'Intermediate' ? 'I' : s.mic || ''}
                                </Text>
                              </View>
                            ))}
                            {(org.sensitivities || []).length > 5 ? (
                              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/cultures/${culture.id}`)}>
                                <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.brand.primary, marginTop: 4 }}>
                                  +{org.sensitivities.length - 5} more
                                </Text>
                              </TouchableOpacity>
                            ) : null}
                          </View>
                        ) : (
                          <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary, fontStyle: 'italic', marginTop: 4 }}>
                            Sensitivity pending
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary, fontStyle: 'italic', marginTop: 6 }}>
                    No organisms recorded
                  </Text>
                )}
              </View>
            );
          })
        )}

        {totalSensitive > 0 ? (
          <View style={styles.matchBanner}>
            <Text style={styles.matchText}>
              {totalSensitive} sensitivity match(es) — {antibiotic.drugName} shows susceptibility in linked cultures
            </Text>
          </View>
        ) : null}
      </Surface>

      <CultureLinkModal
        visible={showCultureLinkModal}
        onClose={() => setShowCultureLinkModal(false)}
        antibioticId={id}
        patientId={antibiotic?.patientId}
        onLinked={() => {
          api.getLinkedCultures(id).then(setLinkedCultures).catch(() => {});
        }}
      />
      <CultureReferenceModal visible={showCultureRef} onClose={() => setShowCultureRef(false)} />
      <CultureReferenceModal visible={showDrugRef} onClose={() => setShowDrugRef(false)} mode="antibiotic" onSelect={(value) => { setEditDraft((d) => ({ ...d, drugName: value })); setShowDrugRef(false); }} />
      <DrugPickerModal visible={showDrugPicker} onClose={() => setShowDrugPicker(false)} selectedDrug={editDraft.drugName} onSelect={({ drugName }) => { setEditDraft((d) => ({ ...d, drugName })); setShowDrugPicker(false); }} />
      <RoutePicker
        visible={showRoutePicker}
        onClose={() => setShowRoutePicker(false)}
        selected={editDraft.route ? editDraft.route.split(', ').map((name) => ({ routeName: name })) : []}
        onSelect={(list) => { setEditDraft((d) => ({ ...d, route: list.map((r) => r.routeName).join(', ') })); setShowRoutePicker(false); }}
      />
      <CulturePicker
        visible={showCulturePicker}
        onClose={() => setShowCulturePicker(false)}
        selected={editDraft.linkedCulture ? editDraft.linkedCulture.split(', ').map((name) => ({ cultureName: name })) : []}
        onSelect={(list) => { setEditDraft((d) => ({ ...d, linkedCulture: list.map((c) => c.cultureName).join(', ') })); setShowCulturePicker(false); }}
      />

      <Surface style={styles.panel}>
        <SectionHeader title="Actions" subtitle="Continue, escalate, de-escalate, or stop." />
        <View style={{ height: 12 }} />
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleContinue}
            disabled={mutating}
            data-testid="abx-action-continue"
            style={{ flex: 1, opacity: mutating ? 0.5 : 1 }}
          >
            <Surface style={styles.actionCard}>
              <Repeat2 color={colors.status.safe} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Continue</Text>
            </Surface>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleStop}
            disabled={mutating}
            data-testid="abx-action-stop"
            style={{ flex: 1, opacity: mutating ? 0.5 : 1 }}
          >
            <Surface style={styles.actionCard}>
              <StopCircle color={colors.status.critical} size={18} strokeWidth={2} />
              <Text style={styles.actionTitle}>Stop</Text>
            </Surface>
          </TouchableOpacity>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <SectionHeader title="Management" subtitle="Edit details or delete this entry." />
        <View style={{ height: 12 }} />
        {editing ? (
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[styles.editInput, { flex: 1 }]} value={editDraft.drugName} onChangeText={(v) => setEditDraft((d) => ({ ...d, drugName: v }))} placeholder="Drug name" placeholderTextColor={colors.text.tertiary} data-testid="abx-edit-drug" />
              <TouchableOpacity activeOpacity={0.7} onPress={() => setShowDrugPicker(true)} style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }} data-testid="abx-edit-drug-picker"><PillIcon color={colors.status.safe} size={16} strokeWidth={2} /></TouchableOpacity>
            </View>
            <TextInput style={styles.editInput} value={editDraft.dose} onChangeText={(v) => setEditDraft((d) => ({ ...d, dose: v }))} placeholder="Dose" placeholderTextColor={colors.text.tertiary} data-testid="abx-edit-dose" />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowRoutePicker(true)}
              style={styles.editInput}
              data-testid="abx-edit-route"
            >
              <Text style={{ fontFamily: typography.body, fontSize: 13, color: editDraft.route ? colors.text.primary : colors.text.tertiary }}>
                {editDraft.route || 'Select route(s)...'}
              </Text>
            </TouchableOpacity>
            <TextInput style={styles.editInput} value={editDraft.frequency} onChangeText={(v) => setEditDraft((d) => ({ ...d, frequency: v }))} placeholder="Frequency" placeholderTextColor={colors.text.tertiary} data-testid="abx-edit-frequency" />
            <TextInput style={styles.editInput} value={editDraft.indication} onChangeText={(v) => setEditDraft((d) => ({ ...d, indication: v }))} placeholder="Indication" placeholderTextColor={colors.text.tertiary} data-testid="abx-edit-indication" />
            <TextInput style={styles.editInput} value={editDraft.expectedDuration} onChangeText={(v) => setEditDraft((d) => ({ ...d, expectedDuration: v }))} placeholder="Expected duration" placeholderTextColor={colors.text.tertiary} data-testid="abx-edit-duration" />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowCulturePicker(true)}
              style={styles.editInput}
              data-testid="abx-edit-culture"
            >
              <Text style={{ fontFamily: typography.body, fontSize: 13, color: editDraft.linkedCulture ? colors.text.primary : colors.text.tertiary }}>
                {editDraft.linkedCulture || 'Select cultures...'}
              </Text>
            </TouchableOpacity>
            <View style={styles.editActions}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setEditing(false)} data-testid="abx-edit-cancel"><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.tertiary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7} onPress={handleEditSave} disabled={mutating} data-testid="abx-edit-save" style={{ opacity: mutating ? 0.5 : 1 }}><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Save</Text></TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.manageRow}>
            <TouchableOpacity activeOpacity={0.7} onPress={startEdit} disabled={mutating} style={styles.manageBtn} data-testid="abx-edit-btn">
              <Edit2 color={colors.brand.primary} size={16} strokeWidth={2} />
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} disabled={mutating} style={[styles.manageBtn, { opacity: mutating ? 0.5 : 1 }]} data-testid="abx-delete-btn">
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
  iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  name: { fontFamily: typography.heading, fontSize: 22, fontWeight: '800', color: colors.text.primary },
  meta: { marginTop: 4, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  panel: { padding: 14 },
  detailBox: { padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  detailLabel: { fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.8 },
  detailValue: { marginTop: 4, fontFamily: typography.heading, fontSize: 18, fontWeight: '800', color: colors.text.primary },
  detailMeta: { marginTop: 6, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, lineHeight: 18 },
  // Linked cultures
  emptyLink: { alignItems: 'center', padding: 24, gap: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  emptyLinkText: { fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary, textAlign: 'center' },
  linkedCultureCard: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  lcHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lcType: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary, flex: 1 },
  lcMeta: { marginTop: 4 },
  lcMetaText: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary },
  lcReason: { fontFamily: typography.body, fontSize: 11, color: colors.text.secondary, marginTop: 2 },
  lcOrgSection: { marginTop: 8, gap: 6 },
  lcOrg: {
    padding: 8,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  lcOrgName: { fontFamily: typography.heading, fontSize: 13, fontWeight: '700', color: colors.text.primary },
  sensTable: { marginTop: 4, gap: 2 },
  sensRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  sensAbx: { fontFamily: typography.body, fontSize: 11, color: colors.text.primary },
  sensResult: { fontFamily: typography.bodyMedium, fontSize: 11, fontWeight: '700' },
  matchBanner: {
    marginTop: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: '#F0FDF4',
  },
  matchText: { fontFamily: typography.body, fontSize: 12, color: '#16a34a', textAlign: 'center' },
  // Actions
  actionRow: { flexDirection: 'row', gap: 10 },
  actionCard: { minHeight: 88, padding: 12, gap: 8, justifyContent: 'center' },
  actionTitle: { fontFamily: typography.heading, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  // Edit
  editInput: { minHeight: 40, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, color: colors.text.primary, fontFamily: typography.body, fontSize: 13 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  manageRow: { flexDirection: 'row', gap: 16 },
  manageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
}); }
