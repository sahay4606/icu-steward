import { router } from 'expo-router';
import { ArrowLeft, Bell, Building2, FileText, ShieldCheck } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { SectionHeader, Surface, InfoRow, Pill } from '../src/components/ui';
import { colors, typography } from '../src/theme';
import { useData } from '../src/contexts/DataContext';

export default function HospitalSettingsScreen() {
  const { hospital, reminderRules } = useData();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="hospital-settings-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Hospital settings</Text>
      </TouchableOpacity>

      <SectionHeader title="Hospital settings" subtitle="Tenant-level configuration and reminder rules." />

      <Surface style={styles.panel}>
        <InfoRow label="Hospital name" value={hospital?.name || '—'} />
        <InfoRow label="Location" value={hospital?.city || '—'} />
        <InfoRow label="ICU beds" value={String(hospital?.beds ?? 0)} />
        <InfoRow label="Status" value={hospital?.syncStatus || '—'} />
      </Surface>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Operational configuration</Text>
        <View style={styles.settingRow}>
          <Building2 color={colors.brand.primary} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Hospital logo</Text>
            <Text style={styles.settingBody}>Branding placeholder for future white-label setup.</Text>
          </View>
          <Pill label="Upload" tone="blue" />
        </View>
        <View style={styles.settingRow}>
          <Bell color={colors.status.warning} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Notification settings</Text>
            <Text style={styles.settingBody}>Push, in-app, escalation, and acknowledgement rules.</Text>
          </View>
        </View>
        <View style={styles.settingRow}>
          <ShieldCheck color={colors.status.safe} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Role permissions</Text>
            <Text style={styles.settingBody}>Admin, consultant, residents, and nurse visibility.</Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Reminder rules</Text>
        {reminderRules.map((rule) => (
          <View key={rule.id} style={styles.ruleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>{rule.name}</Text>
              <Text style={styles.settingBody}>Applies to all resources within hospital_id.</Text>
            </View>
            <Pill label={rule.value} tone="orange" />
          </View>
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <View style={styles.settingRow}>
          <FileText color={colors.status.info} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.settingTitle}>Analytics framework</Text>
            <Text style={styles.settingBody}>TAT, duration, compliance, missed reviews, and benchmarking later.</Text>
          </View>
        </View>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  backText: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  panel: {
    padding: 14,
  },
  panelTitle: {
    marginBottom: 10,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  settingRow: {
    minHeight: 56,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingTitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  settingBody: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  ruleRow: {
    minHeight: 54,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
