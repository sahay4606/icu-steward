import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { ArrowLeft, FlaskConical, Plus, Trash2, X } from 'lucide-react-native';

import { Field, Pill, SectionHeader, Surface } from '../../src/components/ui';
import { radius, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';
import { useData } from '../../src/contexts/DataContext';
import { formatDate } from '../../src/lib/format';
import { BackButton } from '../../src/components/back-button';

const STATUS_COLORS = {
  Ordered: 'orange',
  'Sample Collected': 'blue',
  'Sent to Lab': 'blue',
  Received: 'orange',
  Processing: 'orange',
  'Gram Stain Available': 'purple',
  'Preliminary Growth': 'purple',
  'Final Growth': 'green',
  'Sensitivity Pending': 'orange',
  'Sensitivity Complete': 'green',
  'No Growth': 'gray',
  Contaminated: 'red',
  Cancelled: 'red',
  'Rejected Sample': 'red',
};

const ORGANISMS = [
  'MRSA', 'MSSA', 'Coagulase-negative Staphylococcus', 'Streptococcus pneumoniae',
  'Enterococcus faecalis', 'Enterococcus faecium', 'VRE', 'Listeria',
  'E. coli', 'Klebsiella pneumoniae', 'Klebsiella oxytoca', 'Pseudomonas aeruginosa',
  'Acinetobacter baumannii', 'Proteus mirabilis', 'Citrobacter', 'Enterobacter',
  'Morganella', 'Providencia', 'Serratia', 'Salmonella', 'Shigella',
  'Bacteroides', 'Clostridium', 'Peptostreptococcus',
  'Candida albicans', 'Candida tropicalis', 'Candida glabrata', 'Candida auris',
  'Aspergillus', 'Cryptococcus',
  'Mycobacterium tuberculosis', 'Non-tuberculous mycobacteria',
];

const GRAm_STAIN_OPTIONS = [
  'Gram Positive Cocci', 'Gram Positive Bacilli', 'Gram Negative Rods', 'Gram Negative Cocci',
  'Budding Yeast', 'Hyphae Seen', 'Mixed Flora', 'No Organism Seen',
  'WBC Present', 'Pus Cells', 'Epithelial Cells',
];

const CULTURE_TYPES = [
  'Blood Culture', 'Urine Culture', 'Sputum Culture', 'Endotracheal Aspirate',
  'Bronchoalveolar Lavage', 'Tracheal Aspirate', 'CSF Culture', 'Pleural Fluid',
  'Ascitic Fluid', 'Peritoneal Fluid', 'Synovial Fluid', 'Bone Culture',
  'Tissue Culture', 'Wound Swab', 'Pus Culture', 'Drain Fluid',
  'Catheter Tip', 'Central Line Blood Culture', 'Peripheral Blood Culture',
  'Bile Culture', 'Stool Culture', 'Eye Swab', 'Ear Swab', 'Throat Swab',
  'Nasal Swab', 'Vaginal Swab', 'Cervical Swab', 'Fungal Culture',
  'Mycobacterial Culture', 'Anaerobic Culture', 'Other',
];

const SUSCEPTIBILITY_OPTIONS = ['Sensitive', 'Intermediate', 'Resistant', 'Not Tested'];

const ANTIBIOTICS_LIST = [
  'Amikacin', 'Amoxicillin', 'Amoxicillin-Clavulanate', 'Ampicillin', 'Ampicillin-Sulbactam',
  'Azithromycin', 'Aztreonam', 'Cefazolin', 'Cefepime', 'Cefixime',
  'Cefoperazone-Sulbactam', 'Cefotaxime', 'Ceftazidime', 'Ceftazidime-Avibactam',
  'Ceftriaxone', 'Cefuroxime', 'Cephalexin', 'Chloramphenicol', 'Ciprofloxacin',
  'Clarithromycin', 'Clindamycin', 'Colistin', 'Cotrimoxazole', 'Daptomycin',
  'Doxycycline', 'Ertapenem', 'Erythromycin', 'Fosfomycin', 'Gentamicin',
  'Imipenem-Cilastatin', 'Levofloxacin', 'Linezolid', 'Meropenem', 'Metronidazole',
  'Minocycline', 'Moxifloxacin', 'Mupirocin', 'Nitrofurantoin', 'Norfloxacin',
  'Ofloxacin', 'Oxacillin', 'Penicillin G', 'Piperacillin-Tazobactam',
  'Polymyxin B', 'Rifampicin', 'Rifaximin', 'Teicoplanin', 'Tigecycline',
  'Tobramycin', 'Vancomycin',
];

function Chip({ label, selected, onPress, color }) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.full,
        backgroundColor: selected ? (color || colors.brand.primary) : colors.surfaceAlt,
        borderWidth: 1,
        borderColor: selected ? 'transparent' : colors.border,
      }}
      data-testid={`chip-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <Text style={{
        fontFamily: typography.body,
        fontSize: 11,
        fontWeight: selected ? '700' : '500',
        color: selected ? '#fff' : colors.text.secondary,
      }}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CultureDetailScreen() {
  const { id } = useLocalSearchParams();
  const { api, cultures, patients, getCultureFull, updateCulture, createTimelineEvent, currentUserId, currentUserName } = useData();
  const [culture, setCulture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const localCulture = cultures.find((c) => c.id === id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCultureFull(id)
      .then(setCulture)
      .catch(() => setCulture(localCulture ? { ...localCulture, organisms: [] } : null))
      .finally(() => setLoading(false));
  }, [id]);

  const patient = patients.find((p) => p.id === (culture?.patientId || localCulture?.patientId));

  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    if (culture) {
      setEditFields({
        cultureType: culture.cultureType || '',
        specimenSource: culture.specimenSource || '',
        anatomicalSource: culture.anatomicalSource || '',
        collectionMethod: culture.collectionMethod || '',
        gramStain: culture.gramStain || '',
        growthResult: culture.growthResult || '',
        colonyCount: culture.colonyCount || '',
        status: culture.status || 'Ordered',
        remarks: culture.remarks || '',
        laboratory: culture.laboratory || '',
        specimenNumber: culture.specimenNumber || '',
        reportDatetime: culture.reportDatetime || '',
      });
    }
  }, [culture, editMode]);

  const handleEditSave = async () => {
    setSaving(true);
    try {
      await updateCulture(id, editFields);
      await createTimelineEvent({
        patient_id: culture.patientId,
        type: 'culture_updated',
        title: `Culture updated: ${culture.cultureType}`,
        time: new Date().toISOString(),
      }).catch(() => {});
      setEditMode(false);
      const fresh = await getCultureFull(id);
      setCulture(fresh);
      Alert.alert('Saved', 'Culture updated.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const [newOrganism, setNewOrganism] = useState('');
  const [showOrganismPicker, setShowOrganismPicker] = useState(false);

  const handleAddOrganism = async () => {
    if (!newOrganism.trim() || saving) return;
    setSaving(true);
    try {
      await api.post(`/api/cultures/${id}/organisms`, { organism_name: newOrganism });
      const fresh = await getCultureFull(id);
      setCulture(fresh);
      setNewOrganism('');
      setShowOrganismPicker(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSensitivity = async (organismId, antibiotic, susceptibility = 'Not Tested') => {
    setSaving(true);
    try {
      await api.post(`/api/cultures/organisms/${organismId}/sensitivities`, { antibiotic, susceptibility });
      const fresh = await getCultureFull(id);
      setCulture(fresh);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  if (!culture && !localCulture) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <BackButton colors={colors} fallback="/" label="Culture" testID="culture-back-notfound" />
        <Text style={{ padding: 16, color: colors.text.secondary }}>Culture not found.</Text>
      </ScrollView>
    );
  }

  const c = culture || localCulture;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <BackButton colors={colors} fallback="/" label="Culture" testID="culture-back" />

      {/* Hero */}
      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.iconWrap}>
            <FlaskConical color={STATUS_COLORS[c.status] === 'green' ? '#16a34a' : colors.brand.primary} size={22} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{c.cultureType || 'Culture'}</Text>
            <Text style={styles.meta}>{patient?.name} · {c.status}</Text>
          </View>
          <Pill label={c.status} tone={STATUS_COLORS[c.status] || 'orange'} />
        </View>
        <View style={styles.grid}>
          <Field label="Specimen" value={c.specimenNumber || '—'} />
          <Field label="Collected" value={c.collectionDatetime ? formatDate(c.collectionDatetime) : '—'} />
          <Field label="Reported" value={c.reportDatetime ? formatDate(c.reportDatetime) : '—'} />
          <Field label="Lab" value={c.laboratory || '—'} />
        </View>
      </Surface>

      {/* Gram stain & Growth */}
      <Surface style={styles.panel}>
        <SectionHeader title="Microbiology" subtitle="Gram stain, growth result, colony count." />
        <View style={{ height: 10 }} />
        <View style={styles.twoCol}>
          <Field label="Gram stain" value={c.gramStain || 'Not done'} />
          <Field label="Growth" value={c.growthResult || 'Pending'} />
        </View>
        {c.colonyCount ? <Field label="Colony count" value={c.colonyCount} /> : null}
      </Surface>

      {/* Editing top-level fields */}
      {editMode ? (
        <Surface style={styles.panel}>
          <SectionHeader title="Edit culture" action={<TouchableOpacity onPress={() => setEditMode(false)}><X color={colors.text.secondary} size={18} /></TouchableOpacity>} />
          <View style={{ height: 10, gap: 10 }}>
            {[
              ['cultureType', 'Culture type'],
              ['specimenSource', 'Specimen source'],
              ['anatomicalSource', 'Anatomical source'],
              ['collectionMethod', 'Collection method'],
              ['gramStain', 'Gram stain'],
              ['growthResult', 'Growth result'],
              ['colonyCount', 'Colony count'],
              ['status', 'Status'],
              ['laboratory', 'Laboratory'],
              ['specimenNumber', 'Specimen number'],
              ['remarks', 'Remarks'],
            ].map(([key, label]) => (
              <TextInput
                key={key}
                style={styles.editInput}
                value={editFields[key] || ''}
                onChangeText={(v) => setEditFields((p) => ({ ...p, [key]: v }))}
                placeholder={label}
                placeholderTextColor={colors.text.tertiary}
                data-testid={`culture-edit-${key}`}
              />
            ))}
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={handleEditSave} disabled={saving} style={styles.saveBtn} data-testid="culture-edit-save">
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save changes'}</Text>
          </TouchableOpacity>
        </Surface>
      ) : (
        <Surface style={styles.panel}>
          <SectionHeader title="Culture details" action={<TouchableOpacity onPress={() => setEditMode(true)}><Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>Edit</Text></TouchableOpacity>} />
          <View style={{ height: 10 }}>
            <Field label="Source" value={c.specimenSource || '—'} />
            <Field label="Anatomical site" value={c.anatomicalSource || '—'} />
            <Field label="Collection method" value={c.collectionMethod || '—'} />
            <Field label="Report date" value={c.reportDatetime ? formatDate(c.reportDatetime) : '—'} />
            <Field label="Lab" value={c.laboratory || '—'} />
            <Field label="Specimen #" value={c.specimenNumber || '—'} />
            {c.remarks ? <Field label="Remarks" value={c.remarks} /> : null}
          </View>
        </Surface>
      )}

      {/* Organisms */}
      <Surface style={styles.panel}>
        <SectionHeader
          title="Organisms isolated"
          subtitle={c.organisms?.length ? `${c.organisms.length} organism(s) found` : 'No organisms recorded yet'}
        />
        <View style={{ height: 10 }} />
        {(c.organisms || []).map((org, oi) => (
          <View key={org.id || oi} style={styles.orgBlock}>
            <View style={styles.orgHeader}>
              <Text style={styles.orgName}>{org.organismName}</Text>
              {org.colonyCount ? <Pill label={org.colonyCount} tone="blue" /> : null}
              {org.resistanceMarker ? <Pill label={org.resistanceMarker} tone="red" /> : null}
            </View>

            {/* Sensitivity table */}
            {(org.sensitivities || []).length > 0 && (
              <View style={styles.sensitivityTable}>
                <View style={styles.sensRow}>
                  <Text style={[styles.sensCell, styles.sensHeader, { flex: 2 }]}>Antibiotic</Text>
                  <Text style={[styles.sensCell, styles.sensHeader, { flex: 1 }]}>MIC</Text>
                  <Text style={[styles.sensCell, styles.sensHeader, { flex: 1.5 }]}>Result</Text>
                </View>
                {org.sensitivities.map((sens, si) => (
                  <View key={sens.id || si} style={[styles.sensRow, { backgroundColor: si % 2 === 0 ? 'transparent' : colors.surfaceAlt }]}>
                    <Text style={[styles.sensCell, { flex: 2 }]}>{sens.antibiotic}</Text>
                    <Text style={[styles.sensCell, { flex: 1 }]}>{sens.mic || '—'}</Text>
                    <Text style={[styles.sensCell, { flex: 1.5, color: sens.susceptibility === 'Sensitive' ? '#16a34a' : sens.susceptibility === 'Resistant' ? '#dc2626' : colors.text.secondary }]}>
                      {sens.susceptibility}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Add sensitivity inline */}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.sectionLabel}>Add sensitivity</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    Alert.alert('Add antibiotic', '', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Custom',
                        onPress: () => {
                          Alert.prompt?.('Antibiotic', 'Enter antibiotic name', (value) => {
                            if (value) handleAddSensitivity(org.id, value);
                          });
                        },
                      },
                      ...ANTIBIOTICS_LIST.slice(0, 20).map((ab) => ({
                        text: ab,
                        onPress: () => handleAddSensitivity(org.id, ab),
                      })),
                      { text: 'More...', onPress: () => { /* could show full list */ } },
                    ]);
                  }}
                  style={styles.addSensBtn}
                  data-testid={`add-sens-${org.id}`}
                >
                  <Plus color={colors.brand.primary} size={14} />
                  <Text style={styles.addSensText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* Add organism */}
        <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          <Text style={styles.sectionLabel}>Add organism</Text>
          {showOrganismPicker ? (
            <View style={{ marginTop: 6 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                {ORGANISMS.slice(0, 15).map((org) => (
                  <TouchableOpacity
                    key={org}
                    activeOpacity={0.7}
                    onPress={() => { setNewOrganism(org); setShowOrganismPicker(false); }}
                    style={{ marginRight: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.brand.primarySoft }}
                  >
                    <Text style={{ fontFamily: typography.body, fontSize: 12, color: colors.brand.primary }}>{org}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TextInput
                style={styles.editInput}
                value={newOrganism}
                onChangeText={setNewOrganism}
                placeholder="Or type custom organism"
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity activeOpacity={0.7} onPress={handleAddOrganism} disabled={saving || !newOrganism.trim()} style={[styles.saveBtn, { marginTop: 6 }]}>
                <Text style={styles.saveBtnText}>Add organism</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowOrganismPicker(true)} style={{ marginTop: 6 }} data-testid="culture-add-organism">
              <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>+ Add organism</Text>
            </TouchableOpacity>
          )}
        </View>
      </Surface>
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: { padding: 16, gap: 16 },
    back: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44 },
    backText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.primary },
    hero: { padding: 16, gap: 10 },
    heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    iconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
    name: { fontFamily: typography.heading, fontSize: 22, fontWeight: '800', color: colors.text.primary },
    meta: { marginTop: 4, fontFamily: typography.body, fontSize: 12, color: colors.text.secondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    panel: { padding: 14 },
    twoCol: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    orgBlock: {
      padding: 12,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    orgHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    orgName: { fontFamily: typography.heading, fontSize: 15, fontWeight: '800', color: colors.text.primary, flex: 1 },
    sensitivityTable: {
      borderRadius: radius.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sensRow: {
      flexDirection: 'row',
      paddingVertical: 6,
      paddingHorizontal: 8,
    },
    sensCell: {
      fontFamily: typography.body,
      fontSize: 11,
      color: colors.text.primary,
    },
    sensHeader: {
      fontWeight: '700',
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionLabel: {
      fontFamily: typography.bodyMedium,
      fontSize: 12,
      fontWeight: '700',
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    addSensBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.brand.primary,
      borderStyle: 'dashed',
    },
    addSensText: {
      fontFamily: typography.bodyMedium,
      fontSize: 12,
      fontWeight: '600',
      color: colors.brand.primary,
    },
    editInput: {
      minHeight: 40,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      color: colors.text.primary,
      fontFamily: typography.body,
      fontSize: 13,
    },
    saveBtn: {
      minHeight: 40,
      borderRadius: radius.md,
      backgroundColor: colors.brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    saveBtnText: {
      fontFamily: typography.bodyMedium,
      fontSize: 13,
      fontWeight: '700',
      color: colors.surface,
    },
  });
}
