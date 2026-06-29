import { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { X, Search, Check, Syringe } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';

const FILTER_ALL = 'All';
const FILTER_SELECTED = 'Selected';

export function RoutePicker({ visible, onClose, selected, onSelect }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [localSelected, setLocalSelected] = useState([]);
  const [filterMode, setFilterMode] = useState(FILTER_ALL);

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
      fetch(`${API_BASE_URL}/api/route-master`).then((r) => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
      fetch(`${API_BASE_URL}/api/route-master/categories`).then((r) => { if (!r.ok) throw new Error('Failed'); return r.json(); }),
    ]).then(([data, catData]) => {
      setRoutes((data || []).map(normalizeKeys));
      setCategories((catData || []));
    }).catch(() => {
      setRoutes([]);
      setCategories([]);
    }).finally(() => setLoading(false));
  }, [visible]);

  const filtered = useMemo(() => {
    if (!Array.isArray(routes)) return [];
    let list = routes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.routeName?.toLowerCase().includes(q) ||
        r.routeCode?.toLowerCase().includes(q) ||
        r.routeCategory?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) {
      list = list.filter((r) => r.routeCategory === selectedCategory);
    }
    if (filterMode === FILTER_SELECTED) {
      const selectedIds = new Set(localSelected.map((s) => s.id));
      list = list.filter((r) => selectedIds.has(r.id));
    }
    return list;
  }, [routes, search, selectedCategory, localSelected, filterMode]);

  const grouped = useMemo(() => {
    const g = {};
    for (const r of filtered) {
      const cat = r.routeCategory || 'Other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(r);
    }
    return g;
  }, [filtered]);

  const toggle = (route) => {
    setLocalSelected((prev) => {
      const exists = prev.find((s) => s.id === route.id);
      if (exists) return prev.filter((s) => s.id !== route.id);
      return [...prev, { id: route.id, routeName: route.routeName, routeCode: route.routeCode }];
    });
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
              <Text style={styles.title}>Select Route</Text>
              <Text style={styles.subtitle}>{localSelected.length} selected · {routes.length} routes available</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="route-picker-close">
              <X color={colors.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search routes..."
              placeholderTextColor={colors.text.tertiary}
              data-testid="route-picker-search"
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
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {Object.entries(grouped).map(([cat, items]) => (
                <View key={cat}>
                  <Text style={styles.categoryHeader}>{cat}</Text>
                  {items.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      activeOpacity={0.7}
                      onPress={() => toggle(r)}
                      style={[styles.item, isSelected(r.id) && styles.itemSelected]}
                      data-testid={`route-picker-${r.routeName?.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <View style={[styles.checkbox, isSelected(r.id) && styles.checkboxSelected]}>
                        {isSelected(r.id) ? <Check color={colors.surface} size={12} strokeWidth={3} /> : null}
                      </View>
                      <Syringe color={isSelected(r.id) ? colors.brand.primary : colors.text.tertiary} size={14} strokeWidth={2} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.itemName, isSelected(r.id) && styles.itemNameSelected]}>{r.routeName}</Text>
                        {r.routeCode ? <Text style={styles.itemMeta}>{r.routeCode}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
              {filtered.length === 0 && (
                <Text style={styles.empty}>No routes match "{search}"</Text>
              )}
            </ScrollView>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleDone}
            style={styles.doneBtn}
            data-testid="route-picker-done"
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
    itemMeta: {
      fontFamily: typography.body,
      fontSize: 11,
      color: colors.text.tertiary,
      marginTop: 2,
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
