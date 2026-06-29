import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { FlaskConical, Link2, Plus, Search, X } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

const LINK_REASONS = [
  'Empirical Therapy', 'Culture Directed', 'Escalation', 'De-escalation',
  'Switch to Oral', 'Stop Antibiotic', 'No Infection', 'Contaminant', 'Duplicate Therapy',
];

export function CultureLinkModal({ visible, onClose, antibioticId, patientId, onLinked }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { cultures, linkCulture } = useData();
  const [search, setSearch] = useState('');
  const [linking, setLinking] = useState(false);

  const patientCultures = (cultures || []).filter(
    (c) => c.patientId === patientId
  );

  const filtered = patientCultures.filter(
    (c) => !search || c.cultureType?.toLowerCase().includes(search.toLowerCase())
  );

  const handleLink = async (cultureId) => {
    if (linking) return;
    setLinking(true);
    try {
      Alert.alert('Link reason', 'Why is this culture linked?', [
        { text: 'Cancel', style: 'cancel', onPress: () => setLinking(false) },
        ...LINK_REASONS.map((reason) => ({
          text: reason,
          onPress: async () => {
            try {
              await linkCulture(antibioticId, cultureId, reason);
              onLinked?.();
              onClose();
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setLinking(false);
            }
          },
        })),
      ]);
    } catch (e) {
      setLinking(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Link Culture</Text>
              <Text style={styles.subtitle}>Select a culture to link to this antibiotic</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="culture-link-close">
              <X color={colors.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search cultures..."
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {filtered.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ fontFamily: typography.body, fontSize: 13, color: colors.text.tertiary, textAlign: 'center' }}>
                  {search ? 'No cultures match your search' : 'No cultures for this patient yet'}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    router.push(`/new?type=culture&patientId=${patientId}`);
                  }}
                  style={{ marginTop: 12 }}
                >
                  <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.brand.primary }}>+ Add culture</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filtered.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  activeOpacity={0.7}
                  onPress={() => handleLink(c.id)}
                  disabled={linking}
                  style={[styles.item, { opacity: linking ? 0.5 : 1 }]}
                  data-testid={`culture-link-${c.id}`}
                >
                  <FlaskConical color={colors.brand.primary} size={16} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemType}>{c.cultureType}</Text>
                    <Text style={styles.itemSource}>{c.specimenNumber || ''} · {c.status || 'Ordered'}</Text>
                    {c.growthResult ? <Text style={styles.itemOrg}>{c.growthResult}</Text> : null}
                  </View>
                  <Link2 color={colors.text.tertiary} size={16} strokeWidth={2} />
                </TouchableOpacity>
              ))
            )}
            {linking && <ActivityIndicator style={{ padding: 16 }} color={colors.brand.primary} />}
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
