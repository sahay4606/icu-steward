import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Animated, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { X, Pill, Search, AlertTriangle } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';

const AWARE_COLORS = {
  Access: '#2E7D32',
  Watch: '#E65100',
  Reserve: '#C62828',
};

const FILTER_ALL = 'All';
const FILTER_SELECTED = 'Selected';

function SkeletonRow({ colors }) {
  const opacity = useMemo(() => new Animated.Value(0.3), []);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);
  return (
    <Animated.View style={[stylesSkeleton.item, { opacity, backgroundColor: colors.surfaceAlt }]}>
      <View style={[stylesSkeleton.radio, { backgroundColor: colors.border }]} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={[stylesSkeleton.line, { width: '60%', backgroundColor: colors.border }]} />
        <View style={[stylesSkeleton.line, { width: '35%', backgroundColor: colors.border }]} />
      </View>
    </Animated.View>
  );
}

const stylesSkeleton = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  line: {
    height: 10,
    borderRadius: 4,
  },
});

export function DrugPickerModal({ visible, onClose, onSelect, selectedDrug }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filterMode, setFilterMode] = useState(FILTER_ALL);

  useEffect(() => {
    if (!visible) return;
    setSelectedId(null);
    setFilterMode(FILTER_ALL);
    setSearch('');
    setSelectedClass(null);
  }, [visible]);

  useEffect(() => {
    if (!selectedDrug || !drugs.length) return;
    const match = drugs.find(
      (d) => d.id === selectedDrug || d.genericName === selectedDrug
    );
    if (match) setSelectedId(match.id);
  }, [selectedDrug, drugs]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/antibiotic-master`)
      .then((r) => { if (!r.ok) throw new Error('Failed to load antibiotics'); return r.json(); })
      .then((data) => {
        setDrugs((data || []).map(normalizeKeys));
      })
      .catch((e) => {
        setError(e.message || 'Something went wrong');
        setDrugs([]);
      })
      .finally(() => setLoading(false));
  }, [visible]);

  const classes = useMemo(() => {
    const set = new Set();
    for (const d of drugs) {
      if (d.antibioticClass) set.add(d.antibioticClass);
    }
    return Array.from(set).sort();
  }, [drugs]);

  const filtered = useMemo(() => {
    if (!Array.isArray(drugs)) return [];
    let list = drugs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.genericName?.toLowerCase().includes(q) ||
        d.antibioticClass?.toLowerCase().includes(q)
      );
    }
    if (selectedClass) {
      list = list.filter((d) => d.antibioticClass === selectedClass);
    }
    if (filterMode === FILTER_SELECTED && selectedId) {
      list = list.filter((d) => d.id === selectedId);
    }
    return list;
  }, [drugs, search, selectedClass, filterMode, selectedId]);

  const grouped = useMemo(() => {
    const g = {};
    for (const d of filtered) {
      const cls = d.antibioticClass || 'Other';
      if (!g[cls]) g[cls] = [];
      g[cls].push(d);
    }
    return g;
  }, [filtered]);

  const filterChips = [
    FILTER_ALL,
    ...(selectedId ? [FILTER_SELECTED] : []),
    ...classes,
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select Antibiotic</Text>
              <Text style={styles.subtitle}>{drugs.length} drugs in master formulary</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="drug-picker-close">
              <X color={colors.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search by drug name or class..."
              placeholderTextColor={colors.text.tertiary}
              data-testid="drug-picker-search"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterChips.map((chip) => {
              const isActive = chip === FILTER_ALL
                ? !selectedClass && filterMode === FILTER_ALL
                : chip === FILTER_SELECTED
                  ? filterMode === FILTER_SELECTED
                  : chip === selectedClass;
              return (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (chip === FILTER_ALL) { setSelectedClass(null); setFilterMode(FILTER_ALL); }
                    else if (chip === FILTER_SELECTED) { setFilterMode(filterMode === FILTER_SELECTED ? FILTER_ALL : FILTER_SELECTED); }
                    else { setSelectedClass(selectedClass === chip ? null : chip); setFilterMode(FILTER_ALL); }
                  }}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {chip === FILTER_SELECTED ? `✓ Selected` : chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {error ? (
            <View style={styles.errorBox}>
              <AlertTriangle color="#F44336" size={16} strokeWidth={2} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : loading ? (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} colors={colors} />
              ))}
            </ScrollView>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {Object.entries(grouped).map(([cls, items]) => (
                <View key={cls}>
                  <Text style={styles.classHeader}>{cls}</Text>
                  {items.map((d) => {
                    const awareColor = AWARE_COLORS[d.awareCategory] || null;
                    const isPicked = d.id === selectedId;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedId(d.id);
                          onSelect?.({ drugId: d.id, drugName: d.genericName });
                          onClose();
                        }}
                        style={[styles.item, isPicked && styles.itemSelected]}
                        data-testid={`drug-picker-${d.genericName?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <View style={[styles.radio, isPicked && styles.radioSelected]}>
                          {isPicked ? <View style={styles.radioDot} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.itemName, isPicked && styles.itemNameSelected]}>{d.genericName}</Text>
                            {d.subclass ? <Text style={styles.itemMeta}>{d.subclass}</Text> : null}
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                            {awareColor ? (
                              <View style={[styles.awareBadge, { backgroundColor: awareColor + '20' }]}>
                                <Text style={[styles.awareText, { color: awareColor }]}>{d.awareCategory}</Text>
                              </View>
                            ) : null}
                            {d.restricted ? (
                              <View style={[styles.badge, { backgroundColor: '#F4433620' }]}>
                                <AlertTriangle color="#F44336" size={10} strokeWidth={2} />
                                <Text style={[styles.badgeText, { color: '#F44336' }]}>Restricted</Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.empty}>No drugs match "{search}"</Text>
              )}
            </ScrollView>
          )}
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
      maxHeight: '92%',
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
    filterScroll: {
      marginBottom: 24,
      maxHeight: 48,
      backgroundColor: colors.background,
    },
    filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 22,
      backgroundColor: colors.surfaceAlt,
      marginRight: 8,
      borderWidth: 2,
      borderColor: colors.border,
      minHeight: 42,
    },
    filterChipActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    filterChipText: {
      fontFamily: typography.bodyMedium,
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    filterChipTextActive: {
      color: colors.surface,
      fontWeight: '800',
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: '#F4433615',
    },
    errorText: {
      fontFamily: typography.body,
      fontSize: 13,
      color: '#F44336',
      flex: 1,
    },
    list: {
      gap: spacing.sm,
      marginTop: spacing.sm,
      flex: 1,
    },
    classHeader: {
      fontFamily: typography.bodyMedium,
      fontSize: 11,
      fontWeight: '700',
      color: colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginTop: spacing.sm,
      marginBottom: 4,
      paddingHorizontal: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginBottom: spacing.sm,
    },
    itemSelected: {
      borderColor: colors.brand.primary,
      backgroundColor: colors.brand.primarySoft,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.brand.primary,
    },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.brand.primary,
    },
    itemName: {
      fontFamily: typography.heading,
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    itemNameSelected: {
      fontWeight: '700',
      color: colors.brand.primary,
    },
    awareBadge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 6,
    },
    awareText: {
      fontFamily: typography.bodyMedium,
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 6,
    },
    badgeText: {
      fontFamily: typography.bodyMedium,
      fontSize: 9,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    itemMeta: {
      fontFamily: typography.body,
      fontSize: 11,
      color: colors.text.tertiary,
    },
    empty: {
      fontFamily: typography.body,
      fontSize: 13,
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });
}
