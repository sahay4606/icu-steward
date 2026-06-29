import { useMemo, useState, useEffect } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Syringe, Search } from 'lucide-react-native';
import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';

export function DevicePickerModal({ visible, onClose, onSelect, selectedName }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setSelectedId(null);
    setSearch('');
    setSelectedCategory(null);
  }, [visible]);

  useEffect(() => {
    if (!selectedName || !items.length) return;
    const match = items.find((d) => d.deviceName === selectedName);
    if (match) setSelectedId(match.id);
  }, [selectedName, items]);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/device-master`)
      .then((r) => { if (!r.ok) throw new Error('Failed to load devices'); return r.json(); })
      .then((data) => setItems((data || []).map(normalizeKeys)))
      .catch((e) => { setError(e.message); setItems([]); })
      .finally(() => setLoading(false));
  }, [visible]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const d of items) { if (d.deviceCategory) set.add(d.deviceCategory); }
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.deviceName?.toLowerCase().includes(q) || d.deviceCategory?.toLowerCase().includes(q));
    }
    if (selectedCategory) list = list.filter((d) => d.deviceCategory === selectedCategory);
    return list;
  }, [items, search, selectedCategory]);

  const grouped = useMemo(() => {
    const g = {};
    for (const d of filtered) {
      const cat = d.deviceCategory || 'Other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(d);
    }
    return g;
  }, [filtered]);

  const showCustom = search.trim().length > 0 && !items.some((d) => d.deviceName?.toLowerCase() === search.trim().toLowerCase());

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Select Device</Text>
              <Text style={styles.subtitle}>{items.length} devices in master list</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} data-testid="device-picker-close">
              <X color={colors.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search or type custom device..."
              placeholderTextColor={colors.text.tertiary}
              data-testid="device-picker-search"
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedCategory(null)}
              style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>All</Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : loading ? (
            <ActivityIndicator color={colors.brand.primary} style={{ marginTop: 24 }} />
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {showCustom ? (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect?.({ deviceName: search.trim(), category: '', isCustom: true });
                    onClose();
                  }}
                  style={[styles.item, styles.itemCustom]}
                  data-testid="device-picker-custom"
                >
                  <Syringe color={colors.status.warning} size={16} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>Custom: "{search.trim()}"</Text>
                    <Text style={styles.itemMeta}>Not in master list — will be saved as free-text</Text>
                  </View>
                </TouchableOpacity>
              ) : null}
              {Object.entries(grouped).map(([cat, catItems]) => (
                <View key={cat}>
                  <Text style={styles.classHeader}>{cat}</Text>
                  {catItems.map((d) => {
                    const isPicked = d.id === selectedId;
                    return (
                      <TouchableOpacity
                        key={d.id}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedId(d.id);
                          onSelect?.({ deviceName: d.deviceName, category: d.deviceCategory, isCustom: false });
                          onClose();
                        }}
                        style={[styles.item, isPicked && styles.itemSelected]}
                        data-testid={`device-picker-${d.deviceName?.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <View style={[styles.radio, isPicked && styles.radioSelected]}>
                          {isPicked ? <View style={styles.radioDot} /> : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.itemName, isPicked && styles.itemNameSelected]}>{d.deviceName}</Text>
                          {d.defaultReviewDays ? <Text style={styles.itemMeta}>Default review: {d.defaultReviewDays} days</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              {filtered.length === 0 && !showCustom && (
                <Text style={styles.empty}>No devices match "{search}"</Text>
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
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modal: { maxHeight: '92%', backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.sm },
    title: { fontFamily: typography.heading, fontSize: 20, fontWeight: '800', color: colors.text.primary },
    subtitle: { fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, marginTop: 2 },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, minHeight: 40, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, marginBottom: spacing.sm },
    searchInput: { flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.text.primary },
    filterScroll: { marginBottom: 12, maxHeight: 48 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, backgroundColor: colors.surfaceAlt, marginRight: 8, borderWidth: 2, borderColor: colors.border, minHeight: 42 },
    filterChipActive: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
    filterChipText: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: colors.text.secondary },
    filterChipTextActive: { color: colors.surface, fontWeight: '800' },
    errorText: { fontFamily: typography.body, fontSize: 13, color: '#F44336', padding: spacing.sm },
    list: { gap: spacing.sm, marginTop: spacing.sm, flex: 1 },
    classHeader: { fontFamily: typography.bodyMedium, fontSize: 11, fontWeight: '700', color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.sm, marginBottom: 4, paddingHorizontal: 4 },
    item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.sm },
    itemSelected: { borderColor: colors.brand.primary, backgroundColor: colors.brand.primarySoft },
    itemCustom: { borderColor: colors.status.warning, borderStyle: 'dashed' },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
    radioSelected: { borderColor: colors.brand.primary },
    radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.brand.primary },
    itemName: { fontFamily: typography.heading, fontSize: 14, fontWeight: '600', color: colors.text.primary },
    itemNameSelected: { fontWeight: '700', color: colors.brand.primary },
    itemMeta: { fontFamily: typography.body, fontSize: 11, color: colors.text.tertiary, marginTop: 2 },
    empty: { fontFamily: typography.body, fontSize: 13, color: colors.text.tertiary, textAlign: 'center', paddingVertical: 24 },
  });
}
