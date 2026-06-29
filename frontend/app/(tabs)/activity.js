import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { FlaskConical, Pill as PillIcon, UserPlus, Activity, ShieldAlert, CheckCircle2, Stethoscope, Syringe, FileEdit } from 'lucide-react-native';

import { typography } from '../../src/theme';
import { formatDateTime } from '../../src/lib/format';
import { useData } from '../../src/contexts/DataContext';
import { useThemeColors } from '../../src/contexts/ThemeContext';

const EXCLUDE_TYPES = new Set([
  'ventilatorReviewed', 'nutrition', 'dvtProphylaxis', 'stressUlcerProphylaxis',
  'sedationReviewed', 'cultureReviewed', 'antibioticReviewed', 'deviceNecessityReviewed',
]);

const ICON_MAP = {
  patient_admitted: { icon: UserPlus, colorKey: 'safe' },
  investigation_sent: { icon: FlaskConical, colorKey: 'info' },
  investigation_reviewed: { icon: CheckCircle2, colorKey: 'safe' },
  investigation_updated: { icon: FileEdit, colorKey: 'warning' },
  investigation_deleted: { icon: ShieldAlert, colorKey: 'critical' },
  antibiotic_started: { icon: PillIcon, colorKey: 'warning' },
  antibiotic_continued: { icon: PillIcon, colorKey: 'warning' },
  antibiotic_stopped: { icon: ShieldAlert, colorKey: 'critical' },
  antibiotic_updated: { icon: FileEdit, colorKey: 'warning' },
  antibiotic_deleted: { icon: ShieldAlert, colorKey: 'critical' },
  device_inserted: { icon: Syringe, colorKey: 'info' },
  device_removed: { icon: ShieldAlert, colorKey: 'critical' },
  device_updated: { icon: FileEdit, colorKey: 'warning' },
  device_deleted: { icon: ShieldAlert, colorKey: 'critical' },
  device_site_assessed: { icon: Stethoscope, colorKey: 'info' },
  note: { icon: Stethoscope, colorKey: 'safe' },
  checklist_updated: { icon: CheckCircle2, colorKey: 'info' },
  patient_discharged: { icon: ShieldAlert, colorKey: 'critical' },
  task_created: { icon: CheckCircle2, colorKey: 'info' },
  reminder_updated: { icon: Activity, colorKey: 'warning' },
  culture_linked: { icon: FlaskConical, colorKey: 'info' },
};

function timeAgo(d) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ActivityTab() {
  const colors = useThemeColors();
  const s = useMemo(() => createStyles(colors), [colors]);
  const { timelineEvents, patients } = useData();

  const important = useMemo(() => {
    return timelineEvents
      .filter((ev) => !EXCLUDE_TYPES.has(ev.type))
      .sort((a, b) => new Date(b.time || b.createdAt) - new Date(a.time || a.createdAt));
  }, [timelineEvents]);

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Activity color={colors.brand.primary} size={20} strokeWidth={2} />
        <Text style={s.title}>Activity</Text>
        <Text style={s.count}>{important.length}</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {important.length > 0 ? (
          important.map((ev) => {
            const map = ICON_MAP[ev.type] || { icon: Activity, colorKey: 'info' };
            const Icon = map.icon;
            const iconColor = colors.status[map.colorKey] || colors.status.info;
            return (
            <View key={ev.id} style={s.activityItem}>
                <View style={[s.activityDot, { backgroundColor: iconColor + '15' }]}>
                  <Icon color={iconColor} size={14} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.activityTop}>
                    <Text style={s.activityTitle}>{ev.title}</Text>
                    <Text style={s.activityTime}>{timeAgo(ev.time || ev.createdAt)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {ev.performedByName ? (
                      <Text style={s.activityDoctor}>{ev.performedByName}</Text>
                    ) : null}
                    {ev.performedByName && ev.patientId ? <Text style={s.activitySep}>·</Text> : null}
                    {ev.patientId ? (
                      <TouchableOpacity onPress={() => router.push(`/patients/${ev.patientId}`)}>
                        <Text style={s.activitySub}>
                          {patients.find((p) => p.id === ev.patientId)?.name || ev.patientId}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {ev.description ? <Text style={s.activityDesc}>{ev.description}</Text> : null}
                </View>
              </View>
            );
          })
        ) : (
          <View style={s.emptyCard}>
            <Activity color={colors.text.disabled} size={40} strokeWidth={1.5} />
            <Text style={s.emptyText}>No activity recorded yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(t) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
    title: { flex: 1, fontFamily: typography.heading, fontSize: 20, fontWeight: '700', color: t.text.primary },
    count: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: t.text.disabled },
    content: { padding: 16, gap: 4, paddingBottom: 40 },
    activityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.border },
    activityDot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    activityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    activityTitle: { flex: 1, fontFamily: typography.body, fontSize: 14, fontWeight: '600', color: t.text.primary },
    activityTime: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled, marginLeft: 8 },
    activityDoctor: { fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '600', color: t.brand?.primary || t.text.secondary },
    activitySep: { fontFamily: typography.body, fontSize: 12, color: t.text.disabled },
    activitySub: { fontFamily: typography.body, fontSize: 12, color: t.text.secondary },
    activityDesc: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled, marginTop: 2, fontStyle: 'italic' },
    emptyCard: { padding: 60, alignItems: 'center', gap: 12 },
    emptyText: { fontFamily: typography.body, fontSize: 14, color: t.text.disabled },
  });
}
