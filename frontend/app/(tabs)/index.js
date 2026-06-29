import { useMemo, useState, useCallback } from 'react';
import { useClock } from '../../src/hooks/use-clock';
import {
  ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell, CheckCircle, Circle, FlaskConical,
  Plus, Search, ShieldAlert, Users, Pill as PillIcon,
  AlertTriangle, Activity, Calendar, Syringe,
  TrendingUp, TrendingDown, Minus, ChevronRight, Clock, Sun, Moon,
} from 'lucide-react-native';
import { typography } from '../../src/theme';
import { formatDate, formatDateTime } from '../../src/lib/format';
import { useData } from '../../src/contexts/DataContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';

const lightTheme = {
  bg: '#F4F6F9', card: '#FFFFFF', cardBorder: '#E2E8F0', input: '#F1F5F9',
  text: { primary: '#0F172A', secondary: '#475569', disabled: '#94A3B8' },
  semantic: { critical: '#DC2626', warning: '#D97706', stable: '#059669', info: '#1D4ED8' },
  surfaceAlt: '#F8FAFC',
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function MobileDashboard() {
  const { user } = useAuth();
  const { isDark, toggleMode } = useTheme();
  const { timeString, dateString } = useClock();
  const theme = isDark ? {
    bg: '#121212', card: '#1E1E1E', cardBorder: '#2A2A2A', input: '#2A2A2A',
    text: { primary: '#FFFFFF', secondary: '#A0A0A0', disabled: '#666666' },
    semantic: { critical: '#FF4C4C', warning: '#FFB84D', stable: '#4CAF50', info: '#4DA6FF' },
    surfaceAlt: '#1A1A1A',
  } : lightTheme;
  const s = useMemo(() => createStyles(theme), [theme]);
  const {
    patients, investigations, antibiotics, devices, tasks, notifications, hospital, loading, dashboardSummary, updateHospitalSettings, mutating,
  } = useData();
  const { user: authUser } = useAuth();
  const [fabOpen, setFabOpen] = useState(false);
  const [showBedConfig, setShowBedConfig] = useState(false);
  const [bedDraft, setBedDraft] = useState('');
  const [reviewTab, setReviewTab] = useState('antibiotics');

  const pendingInv = useMemo(() => investigations.filter((i) => i.status === 'Pending'), [investigations]);
  const reviewAbx = useMemo(() => antibiotics.filter((a) => a.action === 'Review due' || a.action === 'Escalate'), [antibiotics]);
  const reviewDev = useMemo(() => devices.filter((d) => d.status !== 'Removed'), [devices]);
  const unacked = useMemo(() => notifications.filter((n) => !n.acknowledged), [notifications]);
  const criticalAlerts = useMemo(() => unacked.filter((n) => n.severity === 'critical'), [unacked]);
  const highPrio = useMemo(() => patients.filter((p) => p.status === 'Requires attention').slice(0, 5), [patients]);

  const reviewsByTab = useMemo(() => ({
    antibiotics: reviewAbx.slice(0, 6),
    investigations: pendingInv.slice(0, 6),
    devices: reviewDev.slice(0, 6),
  }), [reviewAbx, pendingInv, reviewDev]);

  const reviewTabs = [
    { key: 'antibiotics', label: 'Antibiotics', count: reviewsByTab.antibiotics.length },
    { key: 'investigations', label: 'Investigations', count: reviewsByTab.investigations.length },
    { key: 'devices', label: 'Devices', count: reviewsByTab.devices.length },
  ];

  const currentUserName = user?.name || 'Doctor';
  const hospitalName = hospital?.name || 'ICU';

  function Pill({ label, color }) {
    return (
      <View style={[s.pill, { backgroundColor: color + '20' }]}>
        <Text style={[s.pillText, { color }]}>{label}</Text>
      </View>
    );
  }

  function Trend({ current, prev }) {
    if (prev == null || current == null) return null;
    if (current > prev) return <TrendingUp color={theme.semantic.critical} size={14} strokeWidth={2.5} />;
    if (current < prev) return <TrendingDown color={theme.semantic.stable} size={14} strokeWidth={2.5} />;
    return <Minus color={theme.text.disabled} size={14} strokeWidth={2.5} />;
  }

  async function markTaskComplete(taskId) {
    try {
      const { createApiClient } = await import('../../src/lib/api');
      const { API_BASE_URL } = await import('../../src/lib/config');
      const api = createApiClient(API_BASE_URL);
      await api.patch(`/api/tasks/${taskId}`, { status: 'Completed' });
    } catch (e) {
      Alert.alert('Error', 'Could not update task');
    }
  }

  const totalBeds = hospital?.icuBeds || hospital?.beds || 30;
  const isAdmin = authUser?.role === 'Hospital Admin';

  const handleBedSave = useCallback(async () => {
    const val = parseInt(bedDraft, 10);
    if (!val || val < 1) { Alert.alert('Invalid', 'Enter a positive number.'); return; }
    try {
      await updateHospitalSettings({ icu_beds: val });
      setShowBedConfig(false);
      Alert.alert('Updated', `ICU beds set to ${val}.`);
    } catch (e) { Alert.alert('Error', e.message); }
  }, [bedDraft, updateHospitalSettings]);

  if (loading) {
    return (
      <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.semantic.info} />
      </View>
    );
  }

  const kpi = [
    { label: 'Occupied Beds', value: `${patients.length}`, total: `/ ${totalBeds}`, color: theme.text.primary, onPress: isAdmin ? () => { setBedDraft(String(totalBeds)); setShowBedConfig(true); } : () => router.push('/patients') },
    { label: 'Pending Investigations', value: pendingInv.length, color: theme.semantic.warning, route: '/search' },
    { label: 'Active Alerts', value: criticalAlerts.length, color: theme.semantic.critical, route: '/notifications' },
    { label: 'Reviews Due', value: reviewAbx.length + reviewDev.length, color: theme.semantic.info, route: '/patients' },
  ];

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── TOP BAR ── */}
        <View style={s.topBar}>
          <View style={{ flex: 1 }}>
            <Text style={s.greeting}>{greeting()},</Text>
            <Text style={s.userName}>{currentUserName}</Text>
            <Text style={s.location}>{hospitalName}</Text>
            <View style={s.clockRow}>
              <Clock color={theme.text.secondary} size={13} strokeWidth={2} />
              <Text style={s.clockText}>{timeString}</Text>
              <Text style={s.clockSeparator}>·</Text>
              <Text style={s.clockText}>{dateString}</Text>
            </View>
          </View>
          <View style={s.topActions}>
            <TouchableOpacity onPress={() => router.push('/search')} style={s.iconBtn}>
              <Search color={theme.text.secondary} size={20} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={s.iconBtn}>
              <Bell color={theme.text.secondary} size={20} strokeWidth={2} />
              {unacked.length > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{unacked.length}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMode} style={s.iconBtn} data-testid="theme-toggle">
              {isDark ? <Sun color={theme.semantic.warning} size={20} strokeWidth={2} /> : <Moon color={theme.text.secondary} size={20} strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* ── KPI HORIZONTAL SCROLL ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.kpiRow}>
          {kpi.map((k) => (
            <TouchableOpacity key={k.label} activeOpacity={0.7} onPress={k.onPress || (() => router.push(k.route))} style={s.kpiCard}>
              <View style={s.kpiValueRow}>
                <Text style={[s.kpiValue, { color: k.color }]}>{k.value}</Text>
                {k.total ? <Text style={s.kpiTotal}>{k.total}</Text> : null}
              </View>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── BED CONFIG MODAL ── */}
        <Modal visible={showBedConfig} animationType="fade" transparent onRequestClose={() => setShowBedConfig(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 300, backgroundColor: theme.card, borderRadius: 16, padding: 24, gap: 16 }}>
              <Text style={{ fontFamily: typography.heading, fontSize: 18, fontWeight: '800', color: theme.text.primary }}>ICU Bed Configuration</Text>
              <Text style={{ fontFamily: typography.body, fontSize: 13, color: theme.text.secondary }}>Set the total number of ICU beds for this hospital.</Text>
              <TextInput
                value={bedDraft}
                onChangeText={setBedDraft}
                keyboardType="numeric"
                placeholder="Total beds"
                placeholderTextColor={theme.text.disabled}
                style={{ minHeight: 44, paddingHorizontal: 12, borderRadius: 10, backgroundColor: theme.input, color: theme.text.primary, fontFamily: typography.body, fontSize: 14 }}
                data-testid="bed-config-input"
              />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
                <TouchableOpacity onPress={() => setShowBedConfig(false)} data-testid="bed-config-cancel">
                  <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '600', color: theme.text.disabled }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleBedSave} disabled={mutating} data-testid="bed-config-save">
                  <Text style={{ fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: theme.semantic.info }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ── IMMEDIATE ACTION REQUIRED ── */}
        {highPrio.length > 0 && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <ShieldAlert color={theme.semantic.critical} size={16} strokeWidth={2} />
              <Text style={s.sectionTitle}>Immediate Action Required</Text>
              <Text style={[s.sectionCount, { color: theme.semantic.critical }]}>{highPrio.length}</Text>
            </View>
            {highPrio.map((p) => (
              <TouchableOpacity key={p.id} activeOpacity={0.7} onPress={() => router.push(`/patients/${p.id}`)} style={s.immediateCard}>
                <View style={s.immediateAccent} />
                <View style={s.immediateBody}>
                  <View style={s.immediateTop}>
                    <Text style={s.immediateBed}>{p.bed || '—'}</Text>
                    <Pill label={p.status || 'ATTENTION'} color={theme.semantic.critical} />
                  </View>
                  <Text style={s.immediateName}>{p.name}</Text>
                  <Text style={s.immediateIssue}>
                    {(() => {
                      const pid = p.id;
                      const h = investigations.find((i) => i.patientId === pid && i.priority === 'High' && i.status === 'Pending');
                      if (h) return `${h.name} Pending`;
                      const c = investigations.find((i) => i.patientId === pid && i.status === 'Received');
                      if (c) return `${c.name} Result Received`;
                      const a = antibiotics.find((i) => i.patientId === pid && i.action === 'Review due');
                      if (a) return `Review ${a.drugName}`;
                      const d = devices.find((i) => i.patientId === pid && i.status !== 'Removed');
                      if (d) return `${d.type} Review`;
                      return 'Routine review';
                    })()}
                  </Text>
                  <View style={s.immediateBottom}>
                    <Text style={s.immediateUhid}>{p.uhid || ''}</Text>
                    <View style={s.immediateDueRow}>
                      <Clock color={theme.text.disabled} size={11} strokeWidth={2} />
                      <Text style={s.immediateDue}>Due Today</Text>
                    </View>
                  </View>
                </View>
                <ChevronRight color={theme.text.disabled} size={16} strokeWidth={2} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── TODAY'S REVIEWS ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Calendar color={theme.semantic.warning} size={16} strokeWidth={2} />
            <Text style={s.sectionTitle}>Today's Reviews</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow}>
            {reviewTabs.map((t) => (
              <TouchableOpacity
                key={t.key}
                activeOpacity={0.7}
                onPress={() => setReviewTab(t.key)}
                style={[s.tab, reviewTab === t.key && s.tabActive]}
              >
                <Text style={[s.tabText, reviewTab === t.key && s.tabTextActive]}>{t.label}</Text>
                <Text style={[s.tabCount, reviewTab === t.key && s.tabCountActive]}>{t.count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {reviewsByTab[reviewTab].length > 0 ? (
            reviewsByTab[reviewTab].map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => router.push(`/${reviewTab === 'antibiotics' ? 'antibiotics' : reviewTab === 'investigations' ? 'investigations' : 'devices'}/${item.id}`)}
                style={s.reviewCard}
              >
                <View style={s.reviewRow}>
                  <Text style={s.reviewTitle}>
                    {reviewTab === 'antibiotics' ? item.drugName || item.drug_name : reviewTab === 'investigations' ? item.name : item.type}
                  </Text>
                  <Pill
                    label={item.status || item.action || 'Pending'}
                    color={item.status === 'Pending' || item.action === 'Review due' ? theme.semantic.warning : theme.semantic.info}
                  />
                </View>
                <Text style={s.reviewPatient}>{item.patientName || item.patient_name || '—'}</Text>
                <Text style={s.reviewMeta}>
                  {(item.dueTime || item.expectedReportDate || item.reviewReminder)
                    ? formatDateTime(item.dueTime || item.expectedReportDate || item.reviewReminder)
                    : '—'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={s.emptyCard}><Text style={s.emptyText}>No {reviewTab} reviews due today.</Text></View>
          )}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity activeOpacity={0.8} onPress={() => setFabOpen(true)} style={s.fab}>
        <Plus color={theme.bg} size={24} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── BOTTOM SHEET ── */}
      <Modal visible={fabOpen} transparent animationType="slide" onRequestClose={() => setFabOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setFabOpen(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Quick Add</Text>
            <View style={s.sheetGrid}>
              {[
                { icon: Users, label: 'Patient', color: theme.semantic.info, route: '/new?type=patient' },
                { icon: FlaskConical, label: 'Investigation', color: theme.semantic.warning, route: '/new?type=investigation' },
                { icon: PillIcon, label: 'Antibiotic', color: theme.semantic.critical, route: '/new?type=antibiotic' },
                { icon: Syringe, label: 'Device', color: theme.text.secondary, route: '/new?type=device' },
                { icon: CheckCircle, label: 'Task', color: theme.semantic.stable, route: '/new?type=task' },
              ].map((b) => (
                <TouchableOpacity key={b.label} activeOpacity={0.7} onPress={() => { setFabOpen(false); router.push(b.route); }} style={s.sheetBtn}>
                  <View style={[s.sheetBtnIcon, { backgroundColor: b.color + '20' }]}>
                    <b.icon color={b.color} size={22} strokeWidth={2} />
                  </View>
                  <Text style={s.sheetBtnLabel}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setFabOpen(false)} style={s.sheetCancel}>
              <Text style={s.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function createStyles(t) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    content: { padding: 16, gap: 20, paddingTop: 60 },

    // ── TOP BAR ──
    topBar: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    greeting: { fontFamily: typography.body, fontSize: 12, color: t.text.secondary },
    userName: { fontFamily: typography.heading, fontSize: 20, fontWeight: '700', color: t.text.primary },
    location: { fontFamily: typography.body, fontSize: 12, color: t.text.disabled, marginTop: 2 },
    clockRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    clockText: { fontFamily: typography.body, fontSize: 12, color: t.text.disabled },
    clockSeparator: { fontFamily: typography.body, fontSize: 12, color: t.text.disabled, marginHorizontal: 2 },
    topActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 4 },
    iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
    badge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: t.semantic.critical, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontFamily: typography.bodyMedium, fontSize: 10, fontWeight: '700', color: '#fff' },

    // ── KPI ──
    kpiRow: { marginHorizontal: -16, paddingHorizontal: 16 },
    kpiCard: {
      minWidth: 130, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: t.card,
      borderRadius: 12, borderWidth: 1, borderColor: t.cardBorder, marginRight: 10,
    },
    kpiTop: { alignItems: 'flex-end', marginBottom: 4 },
    kpiValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
    kpiValue: { fontFamily: typography.heading, fontSize: 28, fontWeight: '800' },
    kpiTotal: { fontFamily: typography.body, fontSize: 16, color: t.text.disabled },
    kpiLabel: { fontFamily: typography.body, fontSize: 11, color: t.text.secondary, marginTop: 2 },

    // ── SECTION ──
    section: { gap: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    sectionTitle: { flex: 1, fontFamily: typography.heading, fontSize: 15, fontWeight: '700', color: t.text.primary },
    sectionCount: { fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '700' },
    pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    pillText: { fontFamily: typography.bodyMedium, fontSize: 10, fontWeight: '700' },

    // ── IMMEDIATE ──
    immediateCard: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: t.card,
      borderRadius: 12, borderWidth: 1, borderColor: t.cardBorder, overflow: 'hidden',
    },
    immediateAccent: { width: 4, backgroundColor: t.semantic.critical, alignSelf: 'stretch' },
    immediateBody: { flex: 1, padding: 14, gap: 4 },
    immediateTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    immediateBed: { fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '700', color: t.semantic.info },
    immediateName: { fontFamily: typography.heading, fontSize: 16, fontWeight: '700', color: t.text.primary },
    immediateIssue: { fontFamily: typography.body, fontSize: 13, color: t.text.secondary },
    immediateBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
    immediateUhid: { fontFamily: typography.mono, fontSize: 11, color: t.text.disabled },
    immediateDueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    immediateDue: { fontFamily: typography.bodyMedium, fontSize: 11, fontWeight: '700', color: t.semantic.critical },

    // ── TABS ──
    tabRow: { marginHorizontal: -16, paddingHorizontal: 16 },
    tab: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12,
      borderRadius: 8, backgroundColor: t.card, marginRight: 8,
    },
    tabActive: { backgroundColor: t.semantic.warning + '20' },
    tabText: { fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '600', color: t.text.secondary },
    tabTextActive: { color: t.semantic.warning },
    tabCount: { fontFamily: typography.bodyMedium, fontSize: 11, fontWeight: '700', color: t.text.disabled },
    tabCountActive: { color: t.semantic.warning },

    // ── REVIEW ──
    reviewCard: {
      paddingVertical: 10, paddingHorizontal: 14, backgroundColor: t.card,
      borderRadius: 10, borderWidth: 1, borderColor: t.cardBorder,
    },
    reviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    reviewTitle: { fontFamily: typography.bodyMedium, fontSize: 14, fontWeight: '600', color: t.text.primary },
    reviewPatient: { fontFamily: typography.body, fontSize: 12, color: t.text.secondary, marginTop: 2 },
    reviewMeta: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled, marginTop: 2 },

    // ── EMPTY ──
    emptyCard: { padding: 20, alignItems: 'center', backgroundColor: t.card, borderRadius: 10, borderWidth: 1, borderColor: t.cardBorder },
    emptyText: { fontFamily: typography.body, fontSize: 13, color: t.text.disabled },

    // ── FAB ──
    fab: {
      position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28,
      backgroundColor: t.semantic.info, alignItems: 'center', justifyContent: 'center',
      elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    },

    // ── SHEET ──
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: t.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 20 },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: t.cardBorder, alignSelf: 'center' },
    sheetTitle: { fontFamily: typography.heading, fontSize: 18, fontWeight: '700', color: t.text.primary },
    sheetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    sheetBtn: { width: 80, alignItems: 'center', gap: 8 },
    sheetBtnIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sheetBtnLabel: { fontFamily: typography.body, fontSize: 12, fontWeight: '600', color: t.text.secondary },
    sheetCancel: { alignItems: 'center', paddingVertical: 12 },
    sheetCancelText: { fontFamily: typography.bodyMedium, fontSize: 15, fontWeight: '600', color: t.text.disabled },
  });
}
