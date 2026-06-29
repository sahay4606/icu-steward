import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { X, FlaskConical, Search, Check, Plus } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';

const FILTER_ALL = 'All';
const FILTER_SELECTED = 'Selected';

export function CulturePicker({ visible, onClose, selected, onSelect }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [cultures, setCultures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [filterMode, setFilterMode] = useState(FILTER_ALL);
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLocalSelected(selected || []);
    setFilterMode(FILTER_ALL);
    setSearch('');
    setSelectedCategory(null);
  }, [visible, selected]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE_URL}/api/culture-master`).then((r) => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
      fetch(`${API_BASE_URL}/api/culture-master/categories`).then((r) => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
    ]).then(([data, catData]) => {
      setCultures((data || []).map(normalizeKeys));
      setCategories((catData || []));
    }).catch(() => {
      setCultures([]);
      setCategories([]);
    }).finally(() => setLoading(false));
  }, [visible]);

  const filtered = useMemo(() => {
    if (!Array.isArray(cultures)) return [];
    let list = cultures;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        c.cultureName?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      list = list.filter((c) => c.category === selectedCategory);
    }
    if (filterMode === FILTER_SELECTED) {
      const selectedIds = new Set(localSelected.map((s) => s.id));
      list = list.filter((c) => selectedIds.has(c.id));
    }
    return list;
  }, [cultures, search, selectedCategory, localSelected, filterMode]);

  const sorted = useMemo(() => {
    const selectedIds = new Set(localSelected.map((s) => s.id));
    const top = [];
    const rest = [];
    for (const c of filtered) {
      if (selectedIds.has(c.id)) top.push(c);
      else rest.push(c);
    }
    return [...top, ...rest];
  }, [filtered, localSelected]);

  const grouped = useMemo(() => {
    const g = {};
    for (const c of sorted) {
      const cat = c.category || 'Other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(c);
    }
    return g;
  }, [sorted]);

  const toggle = (culture) => {
    setLocalSelected((prev) => {
      const exists = prev.find((s) => s.id === culture.id);
      if (exists) return prev.filter((s) => s.id !== culture.id);
      return [...prev, { id: culture.id, cultureName: culture.cultureName }];
    });
  };

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    setLocalSelected((prev) => [...prev, { id: `custom-${Date.now()}`, cultureName: name }]);
    setCustomName('');
  };

  const isSelected = (id) => localSelected.some((s) => s.id === id);

  const handleDone = () => {
    onSelect?.(localSelected);
    onClose?.();
  };

  const filterChips = [
    FILTER_ALL,
    ...(localSelected.length > 0 ? [FILTER_SELECTED] : []),
    ...categories.map((c) => c.categoryName),
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select Cultures</Text>
              <Text style={styles.subtitle}>{localSelected.length} selected · {cultures.length} in master list</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="culture-picker-close">
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
              data-testid="culture-picker-search"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filterChips.map((chip) => {
              const isActive = chip === FILTER_ALL
                ? !selectedCategory && filterMode === FILTER_ALL
                : chip === FILTER_SELECTED
                  ? filterMode === FILTER_SELECTED
                  : chip === selectedCategory;
              return (
                <TouchableOpacity
                  key={chip}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (chip === FILTER_ALL) { setSelectedCategory(null); setFilterMode(FILTER_ALL); }
                    else if (chip === FILTER_SELECTED) { setFilterMode(filterMode === FILTER_SELECTED ? FILTER_ALL : FILTER_SELECTED); }
                    else { setSelectedCategory(selectedCategory === chip ? null : chip); setFilterMode(FILTER_ALL); }
                  }}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {chip === FILTER_SELECTED ? `✓ Selected (${localSelected.length})` : chip}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator style={{ padding: 40 }} color={colors.brand.primary} />
          ) : (
            <> 
              <View style={styles.customRow}>
                <TextInput
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder="Type custom culture & add..."
                  placeholderTextColor={colors.text.tertiary}
                  style={[styles.input, { flex: 1, minHeight: 36, fontSize: 12 }]}
                  data-testid="culture-picker-custom"
                  onSubmitEditing={addCustom}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={addCustom}
                  disabled={!customName.trim()}
                  style={[styles.addBtn, !customName.trim() && { opacity: 0.4 }]}
                >
                  <Plus color={colors.surface} size={14} strokeWidth={2} />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {Object.entries(grouped).map(([cat, items]) => (
                  <View key={cat}>
                    <Text style={styles.categoryHeader}>{cat}</Text>
                    {items.map((c) => (
                      <TouchableOpacity
                        key={c.id}
                        activeOpacity={0.7}
                        onPress={() => toggle(c)}
                        style={[styles.item, isSelected(c.id) && styles.itemSelected]}
                        data-testid={`culture-picker-${c.cultureName?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <View style={[styles.checkbox, isSelected(c.id) && styles.checkboxSelected]}>
                          {isSelected(c.id) ? <Check color={colors.surface} size={12} strokeWidth={3} /> : null}
                        </View>
                        <FlaskConical color={isSelected(c.id) ? colors.brand.primary : colors.text.tertiary} size={14} strokeWidth={2} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemName, isSelected(c.id) && styles.itemNameSelected]}>{c.cultureName}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
                {filtered.length === 0 && (
                  <Text style={styles.empty}>No cultures match "{search}"</Text>
                )}
              </ScrollView>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDone}
            style={styles.doneBtn}
            data-testid="culture-picker-done"
          >
            <Check color={colors.surface} size={18} strokeWidth={2} />
            <Text style={styles.doneText}>Done ({localSelected.length} selected)</Text>
          </TouchableOpacity>
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
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: colors.surfaceAlt,
      marginRight: 6,
      borderWidth: 1.5,
      borderColor: colors.border,
      minHeight: 34,
    },
    filterChipActive: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    filterChipText: {
      fontFamily: typography.bodyMedium,
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    filterChipTextActive: {
      color: colors.surface,
      fontWeight: '700',
    },
    customRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 10,
      backgroundColor: colors.surface,
      color: colors.text.primary,
      fontFamily: typography.body,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: colors.brand.primary,
    },
    addBtnText: {
      fontFamily: typography.bodyMedium,
      fontSize: 12,
      fontWeight: '700',
      color: colors.surface,
    },
    list: {
      gap: spacing.sm,
      marginTop: spacing.sm,
      flex: 1,
    },
    categoryHeader: {
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
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.brand.primary,
      borderColor: colors.brand.primary,
    },
    itemName: {
      fontFamily: typography.body,
      fontSize: 14,
      color: colors.text.primary,
    },
    itemNameSelected: {
      fontWeight: '700',
      color: colors.brand.primary,
    },
    empty: {
      fontFamily: typography.body,
      fontSize: 13,
      color: colors.text.tertiary,
      textAlign: 'center',
      paddingVertical: 24,
    },
    doneBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: 48,
      backgroundColor: colors.brand.primary,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    doneText: {
      fontFamily: typography.bodyMedium,
      fontSize: 15,
      fontWeight: '800',
      color: colors.surface,
    },
  });
}
