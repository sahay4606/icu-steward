import { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react-native';

import { radius, spacing, typography } from '../theme';
import { useThemeColors } from '../contexts/ThemeContext';

const predefinedItems = [
  { key: 'ventilatorReviewed', label: 'Ventilator reviewed' },
  { key: 'nutrition', label: 'Nutrition' },
  { key: 'dvtProphylaxis', label: 'DVT prophylaxis' },
  { key: 'stressUlcerProphylaxis', label: 'Stress ulcer prophylaxis' },
  { key: 'sedationReviewed', label: 'Sedation reviewed' },
  { key: 'cultureReviewed', label: 'Culture reviewed' },
  { key: 'antibioticReviewed', label: 'Antibiotic reviewed' },
  { key: 'deviceNecessityReviewed', label: 'Device necessity reviewed' },
];

function isPredefined(key) {
  return predefinedItems.some((i) => i.key === key);
}

function getHiddenKeys(checklist) {
  if (!checklist || !checklist._hidden) return [];
  return Array.isArray(checklist._hidden) ? checklist._hidden : [];
}

function getItems(checklist) {
  const hidden = getHiddenKeys(checklist);
  const all = predefinedItems.filter((i) => !hidden.includes(i.key));
  if (checklist) {
    Object.keys(checklist).forEach((key) => {
      if (key === '_hidden') return;
      if (!isPredefined(key)) {
        all.push({ key, label: key.replace(/^custom_/, '') });
      }
    });
  }
  return all;
}

export function DailyChecklist({ patientId, initialChecklist, onToggle, onUpdateChecklist, editable }) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const prevPatientIdRef = useRef(patientId);
  const pendingRef = useRef(false);
  const [localChecklist, setLocalChecklist] = useState(() => ({ ...(initialChecklist || {}) }));
  const [editing, setEditing] = useState(false);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    if (prevPatientIdRef.current !== patientId) {
      prevPatientIdRef.current = patientId;
      setLocalChecklist({ ...(initialChecklist || {}) });
    }
  }, [patientId]);

  const displayItems = useMemo(() => getItems(localChecklist || initialChecklist || {}), [localChecklist, initialChecklist]);

  async function handlePress(key, value) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    const prev = { ...(localChecklist || initialChecklist || {}) };
    const updated = { ...prev, [key]: value };
    setLocalChecklist(updated);
    try {
      await onToggle(patientId, updated, key, value);
    } catch (err) {
      console.warn('DailyChecklist: onToggle failed, reverting', err?.message);
      setLocalChecklist(prev);
      Alert.alert('Error', err.message);
    } finally {
      pendingRef.current = false;
    }
  }

  async function handleAddItem() {
    const label = newItemText.trim();
    if (!label) return;
    const key = `custom_${label.replace(/\s+/g, '_').toLowerCase()}`;
    const prev = { ...(localChecklist || initialChecklist || {}) };
    const updated = { ...prev, [key]: false };
    setLocalChecklist(updated);
    setNewItemText('');
    try {
      await onUpdateChecklist(patientId, updated);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleRemoveItem(key) {
    const prev = { ...(localChecklist || initialChecklist || {}) };
    const updated = { ...prev };
    if (isPredefined(key)) {
      const hidden = getHiddenKeys(prev);
      updated._hidden = [...hidden, key];
    } else {
      delete updated[key];
    }
    setLocalChecklist(updated);
    try {
      await onUpdateChecklist(patientId, updated);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  return (
    <View>
      {editable && (
        <View style={styles.editRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEditing(!editing)}
            data-testid="checklist-edit-toggle"
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>{editing ? 'Done' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>
      )}
      {editing && (
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            value={newItemText}
            onChangeText={setNewItemText}
            placeholder="Add checklist item..."
            placeholderTextColor={colors.text.tertiary}
            data-testid="checklist-new-input"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleAddItem}
            disabled={!newItemText.trim()}
            style={[styles.addBtn, { opacity: newItemText.trim() ? 1 : 0.5 }]}
            data-testid="checklist-add-btn"
          >
            <Plus color={colors.brand.primary} size={18} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.grid}>
        {displayItems.map((item) => {
          const current = localChecklist || initialChecklist || {};
          const checked = Boolean(current[item.key]);
          const Icon = checked ? CheckCircle2 : Circle;
          const isCustom = !isPredefined(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => handlePress(item.key, !checked)}
              style={[styles.item, checked && styles.itemChecked]}
              data-testid={`checklist-${item.key}`}
            >
              <Icon color={checked ? colors.status.safe : colors.text.tertiary} size={18} strokeWidth={2} />
              <Text style={[styles.label, checked && styles.labelChecked]}>{item.label}</Text>
              {editing && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleRemoveItem(item.key)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  data-testid={`checklist-remove-${item.key}`}
                >
                  <X color={colors.status.critical} size={16} strokeWidth={2} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '48%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  itemChecked: {
    borderColor: colors.status.safe,
    backgroundColor: colors.status.safe + '10',
  },
  label: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  labelChecked: {
    color: colors.text.primary,
    fontWeight: '700',
  },
  editRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  addInput: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    color: colors.text.primary,
    fontFamily: typography.body,
    fontSize: 13,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
}
