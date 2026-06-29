import { useMemo, useState } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { X, FlaskConical, Pill, Search } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';

const TABS = ['Cultures', 'Antibiotics'];

const cultures = [
  { type: 'Blood Culture', source: 'Peripheral vein / Central line', organisms: 'Staph. aureus, E. coli, Klebsiella, Pseudomonas' },
  { type: 'Urine Culture', source: 'Midstream urine / Foley catheter', organisms: 'E. coli, Enterococcus, Proteus, Klebsiella' },
  { type: 'Sputum Culture', source: 'Expectorated sputum', organisms: 'Pseudomonas, Klebsiella, Acinetobacter' },
  { type: 'ETA Culture', source: 'ET tube secretions', organisms: 'Pseudomonas, Acinetobacter, MRSA' },
  { type: 'BAL Culture', source: 'Bronchoscopy sample', organisms: 'ICU pneumonia pathogens' },
  { type: 'Tracheal Aspirate', source: 'Tracheostomy/ET tube', organisms: 'Respiratory pathogens' },
  { type: 'Wound Swab Culture', source: 'Surgical/traumatic wound', organisms: 'Staphylococcus, Streptococcus' },
  { type: 'Pus Culture', source: 'Abscess or collection', organisms: 'Mixed aerobic/anaerobic' },
  { type: 'Tissue Culture', source: 'Surgical tissue specimen', organisms: 'Deep tissue pathogens' },
  { type: 'Bone Culture', source: 'Bone biopsy', organisms: 'Osteomyelitis organisms' },
  { type: 'Joint Fluid Culture', source: 'Synovial fluid', organisms: 'Staph. aureus' },
  { type: 'CSF Culture', source: 'Cerebrospinal fluid', organisms: 'Neisseria, Strep. pneumoniae' },
  { type: 'Pleural Fluid Culture', source: 'Pleural aspirate', organisms: 'Empyema pathogens' },
  { type: 'Ascitic Fluid Culture', source: 'Peritoneal fluid', organisms: 'SBP organisms' },
  { type: 'Peritoneal Fluid Culture', source: 'Intra-abdominal collection', organisms: 'Mixed gut flora' },
  { type: 'Bile Culture', source: 'ERCP/Drain sample', organisms: 'Enteric Gram-negative bacteria' },
  { type: 'Catheter Tip Culture', source: 'Central venous catheter', organisms: 'Coagulase-negative staph, MRSA' },
  { type: 'Line Blood Culture', source: 'Central line blood', organisms: 'Line-associated BSI organisms' },
  { type: 'Drain Fluid Culture', source: 'Surgical drain', organisms: 'Post-operative pathogens' },
  { type: 'Stool Culture', source: 'Stool', organisms: 'Salmonella, Shigella, Campylobacter' },
  { type: 'Fungal Culture', source: 'Various specimens', organisms: 'Candida, Aspergillus' },
  { type: 'TB Culture', source: 'Sputum/tissue', organisms: 'Mycobacterium tuberculosis' },
  { type: 'Anaerobic Culture', source: 'Deep tissue/abscess', organisms: 'Bacteroides, Clostridium' },
];

const antibiotics = [
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

export function CultureReferenceModal({ visible, onClose, onSelect, mode = 'culture' }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tab, setTab] = useState(mode === 'antibiotic' ? 'Antibiotics' : 'Cultures');
  const [search, setSearch] = useState('');

  const filteredCultures = cultures.filter(
    (c) => !search || c.type.toLowerCase().includes(search.toLowerCase()) || c.organisms.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAntibiotics = antibiotics.filter(
    (a) => !search || a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Linked Culture</Text>
              <Text style={styles.subtitle}>Browse & select from reference lists</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="culture-ref-close">
              <X color={colors.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabRow}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t}
                activeOpacity={0.7}
                onPress={() => { setTab(t); setSearch(''); }}
                style={[styles.tab, tab === t && styles.tabActive]}
                data-testid={`culture-ref-tab-${t.toLowerCase()}`}
              >
                {t === 'Cultures' ? <FlaskConical color={tab === t ? colors.brand.primary : colors.text.tertiary} size={14} strokeWidth={2} /> : null}
                {t === 'Antibiotics' ? <Pill color={tab === t ? colors.brand.primary : colors.text.tertiary} size={14} strokeWidth={2} /> : null}
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${tab.toLowerCase()}...`}
              placeholderTextColor={colors.text.tertiary}
              data-testid="culture-ref-search"
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {tab === 'Cultures' ? (
              filteredCultures.length === 0 ? (
                <Text style={styles.empty}>No cultures match "{search}"</Text>
              ) : (
                filteredCultures.map((c) => (
                  <TouchableOpacity
                    key={c.type}
                    activeOpacity={0.7}
                    onPress={() => { onSelect?.(c.type); onClose(); }}
                    style={styles.item}
                    data-testid={`culture-ref-${c.type.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <FlaskConical color={colors.brand.primary} size={16} strokeWidth={2} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemType}>{c.type}</Text>
                      <Text style={styles.itemSource}>{c.source}</Text>
                      <Text style={styles.itemOrg}>{c.organisms}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : null}

            {tab === 'Antibiotics' ? (
              filteredAntibiotics.length === 0 ? (
                <Text style={styles.empty}>No antibiotics match "{search}"</Text>
              ) : (
                filteredAntibiotics.map((a) => (
                  <TouchableOpacity
                    key={a}
                    activeOpacity={0.7}
                    onPress={() => { onSelect?.(a); onClose(); }}
                    style={styles.item}
                    data-testid={`abx-ref-${a.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    <Pill color={colors.status.safe} size={16} strokeWidth={2} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemType}>{a}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      maxHeight: '85%',
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      marginBottom: spacing.sm,
    },
    title: {
      fontFamily: typography.heading,
      fontSize: 20,
      fontWeight: '800',
      color: colors.text.primary,
    },
    subtitle: {
      fontFamily: typography.body,
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 2,
    },
    closeBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: spacing.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
    },
    tabActive: {
      backgroundColor: colors.brand.primarySoft,
    },
    tabLabel: {
      fontFamily: typography.bodyMedium,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.tertiary,
    },
    tabLabelActive: {
      color: colors.brand.primary,
      fontWeight: '700',
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      minHeight: 40,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      marginBottom: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontFamily: typography.body,
      fontSize: 13,
      color: colors.text.primary,
    },
    list: {
      gap: spacing.sm,
    },
    empty: {
      fontFamily: typography.body,
      fontSize: 13,
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: 24,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
    },
    itemType: {
      fontFamily: typography.heading,
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.primary,
    },
    itemSource: {
      fontFamily: typography.body,
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    itemOrg: {
      fontFamily: typography.body,
      fontSize: 11,
      color: colors.text.tertiary,
      fontStyle: 'italic',
      marginTop: 2,
    },
  });
}
