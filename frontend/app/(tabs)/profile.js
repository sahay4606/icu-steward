import { router } from 'expo-router';
import { Building2, LogOut, Settings2, UserRound } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { SectionHeader, Surface, InfoRow, Pill } from '../../src/components/ui';
import { colors, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';

import { useAuth } from '../../src/contexts/AuthContext';
export default function ProfileScreen() {
  const { hospital, users, reminderRules, error } = useData();
  const { user: authUser, logout } = useAuth();
  const demoAnalytics = {
    turnaroundTime: '26 hours',
    avgAntibioticDuration: '5.2 days',
    missedReviews: 2,
    compliance: '92%',
    pendingInvestigations: 7,
  };

  const profileUser = authUser || users?.[0];
  const hospitalName = hospital?.name || '—';
  const hospitalCity = hospital?.city || '';

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  if (error && !hospital && users.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load profile</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader title="Profile" subtitle="Role-aware access, tenant isolation, and admin controls." />

      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <UserRound color={colors.brand.primary} size={24} strokeWidth={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{profileUser?.name || 'User'}</Text>
            <Text style={styles.role}>{profileUser?.role || '—'}</Text>
            <Text style={styles.meta}>{profileUser?.unit || 'ICU'} · {hospitalCity}</Text>
          </View>
          <Pill label={profileUser?.role || 'Member'} tone="blue" />
        </View>
      </Surface>

      <Surface style={styles.panel}>
        <InfoRow label="Hospital" value={hospitalName} />
        <InfoRow label="Tenant ID" value={hospital?.id || '—'} />
        <InfoRow label="Users" value={String(users?.length || 0)} />
        <InfoRow label="ICU Beds" value={String(hospital?.beds || 0)} />
        <InfoRow label="Plan" value={hospital?.plan || '—'} />
        <InfoRow label="Signed in as" value={profileUser?.email || '—'} />
      </Surface>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/settings')}
          data-testid="profile-settings"
          style={{ flex: 1 }}
        >
          <Surface style={styles.actionCard}>
            <Settings2 color={colors.brand.primary} size={20} strokeWidth={2} />
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Personal preferences, notifications, offline mode</Text>
          </Surface>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/hospital-settings')}
          data-testid="profile-hospital-settings"
          style={{ flex: 1 }}
        >
          <Surface style={styles.actionCard}>
            <Building2 color={colors.status.safe} size={20} strokeWidth={2} />
            <Text style={styles.actionTitle}>Hospital Settings</Text>
            <Text style={styles.actionSubtitle}>Reminder rules, logo, beds, notifications</Text>
          </Surface>
        </TouchableOpacity>
      </View>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Reminder rules</Text>
        {reminderRules?.map((rule) => (
          <InfoRow key={rule.id} label={rule.name} value={rule.value} />
        ))}
      </Surface>

      <Surface style={styles.panel}>
        <Text style={styles.panelTitle}>Analytics preview</Text>
        <InfoRow label="Turnaround time" value={demoAnalytics.turnaroundTime} valueTone="info" />
        <InfoRow label="Antibiotic duration" value={demoAnalytics.avgAntibioticDuration} />
        <InfoRow label="Compliance" value={demoAnalytics.compliance} valueTone="safe" />
        <InfoRow label="Pending investigations" value={String(demoAnalytics.pendingInvestigations)} valueTone="warning" />
      </Surface>

      <TouchableOpacity activeOpacity={0.7} onPress={handleLogout} data-testid="profile-signout">
        <Surface style={styles.logout}>
          <LogOut color={colors.status.critical} size={18} strokeWidth={2} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Surface>
      </TouchableOpacity>
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
    paddingBottom: 40,
  },
  hero: {
    padding: 16,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.brand.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
  },
  role: {
    marginTop: 4,
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  meta: {
    marginTop: 4,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  panel: {
    padding: 14,
  },
  panelTitle: {
    marginBottom: 6,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    padding: 14,
    gap: 8,
    minHeight: 134,
  },
  actionTitle: {
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  actionSubtitle: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  logout: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutText: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
    color: colors.status.critical,
  },
});
