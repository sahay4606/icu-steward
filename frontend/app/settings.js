import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft, Bell, MoonStar, ShieldCheck, WifiOff } from 'lucide-react-native';
import { router } from 'expo-router';

import { SectionHeader, Surface, InfoRow, Pill } from '../src/components/ui';
import { colors, typography } from '../src/theme';
import { useAuth } from '../src/contexts/AuthContext';
import { useData } from '../src/contexts/DataContext';

export default function SettingsScreen() {
  const { user } = useAuth();
  const { hospital } = useData();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} data-testid="settings-back" style={styles.back}>
        <ArrowLeft color={colors.text.primary} size={18} strokeWidth={2} />
        <Text style={styles.backText}>Settings</Text>
      </TouchableOpacity>

      <SectionHeader title="Personal settings" subtitle="Notification and offline preferences for the signed-in user." />
      <Surface style={styles.panel}>
        <InfoRow label="Signed in as" value={user?.name || '—'} />
        <InfoRow label="Role" value={user?.role || '—'} />
        <InfoRow label="Default hospital" value={hospital?.name || '—'} />
      </Surface>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Preferences</Text>
        <View style={styles.preferenceRow}>
          <Bell color={colors.brand.primary} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.preferenceTitle}>Push notifications</Text>
            <Text style={styles.preferenceBody}>Culture received, review due, device day alerts.</Text>
          </View>
          <Pill label="On" tone="green" />
        </View>
        <View style={styles.preferenceRow}>
          <MoonStar color={colors.status.info} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.preferenceTitle}>Quiet rounds mode</Text>
            <Text style={styles.preferenceBody}>Mute non-critical alerts during protected sleep hours.</Text>
          </View>
          <Pill label="Off" tone="gray" />
        </View>
        <View style={styles.preferenceRow}>
          <WifiOff color={colors.status.warning} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.preferenceTitle}>Offline cache</Text>
            <Text style={styles.preferenceBody}>Read-only local data when the network is unstable.</Text>
          </View>
          <Pill label="Ready" tone="blue" />
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Security</Text>
        <View style={styles.preferenceRow}>
          <ShieldCheck color={colors.status.safe} size={18} strokeWidth={2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.preferenceTitle}>Tenant isolated access</Text>
            <Text style={styles.preferenceBody}>Every API request will be filtered by hospital_id.</Text>
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
  preferenceRow: {
    minHeight: 56,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  preferenceTitle: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  preferenceBody: {
    marginTop: 2,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
});
