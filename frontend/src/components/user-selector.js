import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Search, Check, ChevronDown } from 'lucide-react-native';
import { useThemeColors } from '../contexts/ThemeContext';
import { radius, typography } from '../theme';

export function UserSelector({ users = [], selectedName, onSelect, testId, label = 'ASSIGNED TO' }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q) ||
        u.unit?.toLowerCase().includes(q),
    );
  }, [users, query]);

  function handleSelect(user) {
    onSelect(user.name);
    setOpen(false);
    setQuery('');
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setOpen(!open)}
        style={styles.trigger}
        data-testid={testId}
      >
        <Text style={[styles.triggerText, !selectedName && styles.placeholder]}>
          {selectedName || 'Select user'}
        </Text>
        <ChevronDown color={colors.text.tertiary} size={18} strokeWidth={2} />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          <View style={styles.searchRow}>
            <Search color={colors.text.tertiary} size={16} strokeWidth={2} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or role..."
              placeholderTextColor={colors.text.tertiary}
              style={styles.searchInput}
              autoFocus
            />
          </View>
          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <Text style={styles.empty}>No matching users</Text>
            ) : (
              filtered.map((u) => (
                <TouchableOpacity
                  key={u.id}
                  activeOpacity={0.6}
                  onPress={() => handleSelect(u)}
                  style={[styles.item, selectedName === u.name && styles.itemSelected]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{u.name}</Text>
                    <Text style={styles.itemMeta}>
                      {u.role} · {u.unit || ''}
                    </Text>
                  </View>
                  {selectedName === u.name && (
                    <Check color={colors.brand.primary} size={18} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  triggerText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.text.primary,
  },
  placeholder: {
    color: colors.text.tertiary,
  },
  dropdown: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    minHeight: 40,
    color: colors.text.primary,
    fontFamily: typography.body,
    fontSize: 14,
  },
  list: {
    maxHeight: 220,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  itemSelected: {
    backgroundColor: colors.brand.primarySoft,
  },
  itemName: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  itemMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  empty: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
}
