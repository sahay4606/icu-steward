import { router } from 'expo-router';
import { FlaskConical, Pill as PillIcon, Search, ShieldAlert, UserCheck, Users } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import {
  ActionTile,
  Pill,
  SectionHeader,
  StatCard,
  Surface,
} from '../../src/components/ui';
import { colors, typography } from '../../src/theme';
import { formatDate, formatDateTime } from '../../src/lib/format';
import { useData } from '../../src/contexts/DataContext';

function DashboardRow({ title, subtitle, tone, value, onPress, testId, meta }) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} data-testid={testId}>
      <Surface style={styles.rowCard}>
        <View style={styles.rowHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowSubtitle}>{subtitle}</Text>
          </View>
          <Pill label={tone} tone={tone === 'critical' ? 'red' : tone === 'warning' ? 'orange' : tone === 'safe' ? 'green' : 'blue'} />
        </View>
        <Text style={styles.rowValue}>{value}</Text>
        {meta ? <Text style={styles.rowMeta}>{meta}</Text> : null}
      </Surface>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { patients, investigations, antibiotics, notifications, hospital, dashboardSummary, error } = useData();
  const cards = [
    { key: 'attention', title: 'Patients requiring attention', value: String(patients.filter(p => p.priority === 'High').length), tone: 'critical', subtitle: 'Immediate review needed' },
    { key: 'cultures', title: 'Pending investigations', value: String(investigations.filter(i => i.status === 'Pending').length), tone: 'warning', subtitle: 'Awaiting reports' },
    { key: 'positive', title: 'Positive cultures', value: String(notifications.filter(n => n.severity === 'safe').length), tone: 'safe', subtitle: 'Act on review outcomes' },
    { key: 'abx', title: 'Antibiotic review due', value: String(antibiotics.filter(a => a.status !== 'Active').length), tone: 'warning', subtitle: 'Review continuation today' },
  ];

  if (error && patients.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load data</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Surface style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>ICU Operations SaaS</Text>
            <Text style={styles.heroTitle}>{hospital?.name || 'ICU'}</Text>
            <Text style={styles.heroSubtitle}>
              Multi-tenant stewardship for investigators, antibiotics, devices, tasks, and alerts.
            </Text>
          </View>
          <View style={styles.heroStatus}>
            <View style={styles.liveDot} />
            <Text style={styles.heroStatusText}>{hospital?.plan || ''}</Text>
          </View>
        </View>
        <View style={styles.heroMetaRow}>
          <Text style={styles.heroMeta}>Beds {hospital?.beds || 0}</Text>
          <Text style={styles.heroMeta}>Sync {hospital?.name ? 'Live' : 'Offline'}</Text>
          <Text style={styles.heroMeta}>Updated {hospital?.updatedAt ? formatDateTime(hospital.updatedAt) : '—'}</Text>
        </View>
      </Surface>

      <View style={styles.metricsGrid}>
        {cards.map((card) => (
          <StatCard
            key={card.key}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            tone={card.tone}
            onPress={() => router.push('/patients')}
            testId={`dashboard-metric-${card.key}`}
          />
        ))}
      </View>

      <SectionHeader
        title="Immediate attention"
        subtitle="Only what needs action in the next rounds."
      />

      <View style={styles.stack}>
        <DashboardRow
          title="Patients requiring attention"
          subtitle="Need consultant review, antibiotic decision, or pending report."
          tone="critical"
          value={`${patients.filter((item) => item.priority === 'High').length} high priority patients`}
          meta="Tap to open roster"
          onPress={() => router.push('/patients')}
          testId="dashboard-attention"
        />
        <DashboardRow
          title="Pending investigations"
          subtitle="Free-text investigations waiting for reports."
          tone="warning"
          value={`${investigations.filter((item) => item.status === 'Pending').length} pending`}
          meta="Culture reminder repeats until closed"
          onPress={() => router.push('/patients')}
          testId="dashboard-pending-investigations"
        />
        <DashboardRow
          title="Positive cultures"
          subtitle="Reports received and ready for action."
          tone="safe"
          value={`${notifications.filter((item) => item.severity === 'safe').length} active signals`}
          meta="Review linked antibiotic actions"
          onPress={() => router.push('/notifications')}
          testId="dashboard-positive-cultures"
        />
        <DashboardRow
          title="Antibiotic review due"
          subtitle="Meropenem, Vancomycin, and broad-spectrum review windows."
          tone="warning"
          value={`${antibiotics.filter((item) => item.status !== 'Active').length} due today`}
          meta="Day-based stewardship reminders"
          onPress={() => router.push('/patients')}
          testId="dashboard-antibiotic-review"
        />
      </View>

      <SectionHeader title="Quick add" subtitle="Create the most common ICU resources fast." />
      <View style={styles.quickGrid}>
        <ActionTile
          title="Quick Add Patient"
          subtitle="UHID, bed, diagnosis, consultant"
          icon={Users}
          onPress={() => router.push('/new?type=patient')}
          testId="quick-add-patient"
        />
        <ActionTile
          title="Quick Add Investigation"
          subtitle="Free-text test, lab, reminder date"
          icon={FlaskConical}
          onPress={() => router.push('/new?type=investigation')}
          testId="quick-add-investigation"
        />
        <ActionTile
          title="Quick Add Antibiotic"
          subtitle="Drug, dose, duration, review date"
          icon={PillIcon}
          onPress={() => router.push('/new?type=antibiotic')}
          testId="quick-add-antibiotic"
        />
        <ActionTile
          title="Global Search"
          subtitle="Patient, UHID, bed, doctor, drug, test"
          icon={Search}
          onPress={() => router.push('/search')}
          testId="quick-global-search"
        />
      </View>

      <SectionHeader title="Operational queue" subtitle="Grouped by what the ICU team should see first." />
      <View style={styles.stack}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/patients')}
          data-testid="dashboard-patient-queue"
        >
          <Surface style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <UserCheck color={colors.brand.primary} size={20} strokeWidth={2} />
              <Text style={styles.queueTitle}>Recently admitted</Text>
              <Pill label={`${patients.length}`} tone="blue" />
            </View>
            <Text style={styles.queueBody}>
              {patients.map((patient) => patient.name).join(' · ')}
            </Text>
          </Surface>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/notifications')}
          data-testid="dashboard-alert-queue"
        >
          <Surface style={styles.queueCard}>
            <View style={styles.queueHeader}>
              <ShieldAlert color={colors.status.critical} size={20} strokeWidth={2} />
              <Text style={styles.queueTitle}>High priority alerts</Text>
              <Pill label="Live" tone="red" />
            </View>
            <Text style={styles.queueBody}>
              {notifications.map((item) => item.title).slice(0, 2).join(' · ')}
            </Text>
          </Surface>
        </TouchableOpacity>
      </View>

      <SectionHeader title="Recent signals" subtitle="Newest workflow events across the ICU." />
      <View style={styles.stack}>
        {investigations.slice(0, 3).map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/investigations/${item.id}`)}
            data-testid={`dashboard-investigation-${item.id}`}
          >
            <Surface style={styles.signalCard}>
              <View style={styles.signalTop}>
                <Text style={styles.signalTitle}>{item.name}</Text>
                <Pill
                  label={item.status}
                  tone={
                    item.status === 'Pending'
                      ? 'orange'
                      : item.status === 'Received'
                        ? 'blue'
                        : item.status === 'Reviewed'
                          ? 'green'
                          : 'gray'
                  }
                />
              </View>
              <Text style={styles.signalMeta}>
                {item.patientName} · {item.labName}
              </Text>
              <Text style={styles.signalMeta}>
                Sent {formatDate(item.sentDate)} · Due {formatDate(item.expectedReportDate)}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>

      <SectionHeader title="Analytics ready" subtitle="Extensible now, fully powered later." />
      <Surface style={styles.analyticsCard}>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Investigation turnaround</Text>
          <Text style={styles.analyticsValue}>{dashboardSummary?.turnaroundTime || '—'}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Average antibiotic duration</Text>
          <Text style={styles.analyticsValue}>{dashboardSummary?.avgAntibioticDuration || '—'}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Missed reviews</Text>
          <Text style={[styles.analyticsValue, { color: colors.status.critical }]}>{dashboardSummary?.missedReviews || 0}</Text>
        </View>
        <View style={styles.analyticsRow}>
          <Text style={styles.analyticsLabel}>Compliance</Text>
          <Text style={[styles.analyticsValue, { color: colors.status.safe }]}>{dashboardSummary?.compliance || '—'}</Text>
        </View>
      </Surface>
      <View style={{ height: 28 }} />
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
  hero: {
    padding: 16,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 4,
    fontFamily: typography.heading,
    fontSize: 26,
    fontWeight: '800',
    color: colors.text.primary,
  },
  heroSubtitle: {
    marginTop: 6,
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text.secondary,
  },
  heroStatus: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.brand.primarySoft,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.status.safe,
  },
  heroStatusText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand.primary,
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroMeta: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    color: colors.text.secondary,
    fontFamily: typography.bodyMedium,
    fontSize: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stack: {
    gap: 12,
  },
  rowCard: {
    padding: 14,
    gap: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  rowSubtitle: {
    marginTop: 3,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  rowValue: {
    fontFamily: typography.heading,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text.primary,
  },
  rowMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  queueCard: {
    padding: 14,
    gap: 8,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  queueTitle: {
    flex: 1,
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  queueBody: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  signalCard: {
    padding: 14,
    gap: 6,
  },
  signalTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  signalTitle: {
    flex: 1,
    fontFamily: typography.heading,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  signalMeta: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
  },
  analyticsCard: {
    padding: 14,
    gap: 10,
  },
  analyticsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  analyticsLabel: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  analyticsValue: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
