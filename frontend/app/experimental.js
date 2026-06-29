import { useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, ScrollView, Text, TouchableOpacity, View, StyleSheet, Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  Bell, CheckCircle, Circle, FlaskConical,
  Plus, Search, ShieldAlert, Users, Pill as PillIcon,
  AlertTriangle, Activity, Calendar, UserPlus, ClipboardList, Syringe,
  TrendingUp, TrendingDown, Minus, ChevronRight, Clock, Sun, Moon,
} from 'lucide-react-native';
import { typography } from '../src/theme';
import { formatDate, formatDateTime } from '../src/lib/format';
import { useData } from '../src/contexts/DataContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useTheme, darkTheme } from '../src/contexts/ThemeContext';

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

export default function PULSEDashboard() {
  const { user } = useAuth();
  const { isDark, toggleMode, theme: ctxTheme } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const s = useMemo(() => createStyles(theme), [theme]);

  function Trend({ current, prev }) {
    if (prev == null || current == null) return null;
    if (current > prev) return <TrendingUp color={t.semantic.critical} size={14} strokeWidth={2.5} />;
    if (current < prev) return <TrendingDown color={t.semantic.stable} size={14} strokeWidth={2.5} />;
    return <Minus color={t.text.disabled} size={14} strokeWidth={2.5} />;
  }

  function SectionHeader({ icon: Icon, color, title, count, countColor }) {
    return (
      <View style={s.sectionHeader}>
        <Icon color={color} size={16} strokeWidth={2} />
        <Text style={s.sectionTitle}>{title}</Text>
        {count != null ? <Text style={[s.sectionCount, countColor ? { color: countColor } : null]}>{count}</Text> : null}
      </View>
    );
  }

  function Pill({ label, color }) {
    return (
      <View style={[s.pill, { backgroundColor: color + '20' }]}>
        <Text style={[s.pillText, { color }]}>{label}</Text>
      </View>
    );
  }
  const {
    patients, investigations, antibiotics, devices, tasks, notifications, hospital, loading,
  } = useData();
  const [fabOpen, setFabOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState('antibiotics');

  const pendingInv = useMemo(() => investigations.filter((i) => i.status === 'Pending'), [investigations]);
  const reviewAbx = useMemo(() => antibiotics.filter((a) => a.action === 'Review due' || a.status !== 'Active'), [antibiotics]);
  const reviewDev = useMemo(() => devices.filter((d) => d.status !== 'Removed'), [devices]);
  const unacked = useMemo(() => notifications.filter((n) => !n.acknowledged), [notifications]);
  const criticalAlerts = useMemo(() => unacked.filter((n) => n.severity === 'critical'), [unacked]);
  const highPrio = useMemo(() => patients.filter((p) => p.priority === 'High' || p.priority === 'Critical').slice(0, 5), [patients]);

  const myTasks = useMemo(() => {
    const myName = user?.name || '';
    return tasks.filter((t) => {
      const a = (t.assignedTo || t.assigned_to || '').toLowerCase();
      return a.includes(myName.toLowerCase()) || !myName;
    });
  }, [tasks, user]);

  const reviewsByTab = useMemo(() => {
    const map = {
      antibiotics: reviewAbx.filter((a) => a.status !== 'Active').slice(0, 6),
      investigations: pendingInv.slice(0, 6),
      devices: reviewDev.slice(0, 6),
    };
    return map;
  }, [reviewAbx, pendingInv, reviewDev]);

  const timeline = useMemo(() => {
    const ev = [];
    investigations.slice(0, 8).forEach((i) => {
      if (i.sentDate) ev.push({ id: `s-${i.id}`, time: i.sentDate, title: `${i.name} Sent`, sub: i.patientName, route: `/investigations/${i.id}` });
      if (i.status === 'Received') ev.push({ id: `r-${i.id}`, time: i.updatedAt || i.sentDate, title: `${i.name} Result Received`, sub: i.patientName, route: `/investigations/${i.id}` });
    });
    antibiotics.slice(0, 8).forEach((a) => {
      if (a.startDate) ev.push({ id: `a-${a.id}`, time: a.startDate, title: `${a.drugName} Started`, sub: a.patientName, route: `/antibiotics/${a.id}` });
    });
    patients.slice(0, 8).forEach((p) => {
      if (p.admissionDate) ev.push({ id: `p-${p.id}`, time: p.admissionDate, title: 'Patient Admitted', sub: `${p.name} · ${p.bed || ''}`, route: `/patients/${p.id}` });
    });
    return ev.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12);
  }, [investigations, antibiotics, patients]);

  const currentUserName = user?.name || 'Doctor';
  const hospitalName = hospital?.name || 'ICU';

  async function markTaskComplete(taskId) {
    try {
      const { createApiClient } = await import('../src/lib/api');
      const { API_BASE_URL } = await import('../src/lib/config');
      const api = createApiClient(API_BASE_URL);
      await api.patch(`/api/tasks/${taskId}`, { status: 'Completed' });
    } catch (e) {
      Alert.alert('Error', 'Could not update task');
    }
  }

  if (loading) {
    return (
      <View style={[s.screen, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={t.semantic.info} />
      </View>
    );
  }

  const kpi = [
    { label: 'Occupied Beds', value: `${patients.length}`, total: `/ ${hospital?.beds || 30}`, color: t.text.primary, route: '/patients' },
    { label: 'Pending Investigations', value: pendingInv.length, color: t.semantic.warning, route: '/search', prev: 6 },
    { label: 'Active Alerts', value: criticalAlerts.length, color: t.semantic.critical, route: '/notifications', prev: 1 },
    { label: 'Reviews Due', value: reviewAbx.length + reviewDev.length, color: t.semantic.info, route: '/patients', prev: 3 },
  ];

  const reviewTabs = [
    { key: 'antibiotics', label: 'Antibiotics', count: reviewsByTab.antibiotics.length },
    { key: 'investigations', label: 'Investigations', count: reviewsByTab.investigations.length },
    { key: 'devices', label: 'Devices', count: reviewsByTab.devices.length },
  ];

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── TOP NAV ── */}
        <View style={s.topNav}>
          <View style={s.topNavLeft}>
            <Text style={s.greeting}>{greeting()},</Text>
            <Text style={s.userName}>{currentUserName}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/search')} style={s.searchBar}>
            <Search color={t.text.disabled} size={16} strokeWidth={2} />
            <Text style={s.searchPlaceholder}>Search Patient, UHID, Bed...</Text>
          </TouchableOpacity>
          <View style={s.topNavRight}>
            <TouchableOpacity onPress={() => router.push('/notifications')} style={s.iconBtn}>
              <Bell color={t.text.primary} size={20} strokeWidth={2} />
              {unacked.length > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{unacked.length}</Text></View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleMode} style={s.iconBtn} data-testid="theme-toggle">
              {isDark ? <Sun color={t.semantic.warning} size={20} strokeWidth={2} /> : <Moon color={t.text.primary} size={20} strokeWidth={2} />}
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.location}>{hospitalName}</Text>

        {/* ── KPI ROW ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.kpiRow}>
          {kpi.map((k) => (
            <TouchableOpacity key={k.label} activeOpacity={0.7} onPress={() => router.push(k.route)} style={s.kpiCard}>
              <View style={s.kpiTop}>
                <Trend current={k.value} prev={k.prev} />
              </View>
              <View style={s.kpiValueRow}>
                <Text style={[s.kpiValue, { color: k.color }]}>{k.value}</Text>
                {k.total ? <Text style={s.kpiTotal}>{k.total}</Text> : null}
              </View>
              <Text style={s.kpiLabel}>{k.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── TWO-COLUMN LAYOUT ── */}
        <View style={s.columns}>

          {/* ── LEFT COLUMN (2/3) ── */}
          <View style={s.colLeft}>

            {/* IMMEDIATE ACTION */}
            {highPrio.length > 0 && (
              <View style={s.section}>
                <SectionHeader icon={ShieldAlert} color={t.semantic.critical} title="Immediate Action Required" count={highPrio.length} countColor={t.semantic.critical} />
                {highPrio.map((p) => (
                  <TouchableOpacity key={p.id} activeOpacity={0.7} onPress={() => router.push(`/patients/${p.id}`)} style={s.immediateCard}>
                    <View style={s.immediateAccent} />
                    <View style={s.immediateBody}>
                      <View style={s.immediateTop}>
                        <Text style={s.immediateBed}>{p.bed || '—'}</Text>
                        <Pill label={p.priority || 'MEDIUM'} color={t.semantic.critical} />
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
                          <Clock color={t.text.disabled} size={11} strokeWidth={2} />
                          <Text style={s.immediateDue}>Due Today</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight color={t.text.disabled} size={16} strokeWidth={2} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* TODAY'S REVIEWS WITH TABS */}
            <View style={s.section}>
              <SectionHeader icon={Calendar} color={t.semantic.warning} title="Today's Reviews" />
              <View style={s.tabRow}>
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
              </View>
              {reviewsByTab[reviewTab].length > 0 ? (
                reviewsByTab[reviewTab].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/${reviewTab === 'antibiotics' ? 'antibiotics' : reviewTab === 'investigations' ? 'investigations' : 'devices'}/${item.id}`)}
                    style={s.reviewCard}
                  >
                    <View style={s.reviewRow}>
                      <Text style={s.reviewPatient}>{item.patientName || item.patient_name || '—'}</Text>
                      <Pill
                        label={item.status || item.action || 'Pending'}
                        color={item.status === 'Pending' || item.action === 'Review due' ? t.semantic.warning : t.semantic.info}
                      />
                    </View>
                    <Text style={s.reviewTask}>
                      {reviewTab === 'antibiotics' ? item.drugName || item.drug_name : reviewTab === 'investigations' ? item.name : item.type}
                    </Text>
                    <Text style={s.reviewMeta}>
                      {item.dueTime || item.expectedReportDate || item.reviewReminder
                        ? formatDateTime(item.dueTime || item.expectedReportDate || item.reviewReminder)
                        : '—'}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={s.emptyCard}><Text style={s.emptyText}>No {reviewTab} reviews due today.</Text></View>
              )}
            </View>
          </View>

          {/* ── RIGHT COLUMN (1/3) ── */}
          <View style={s.colRight}>

            {/* RECENT ICU ACTIVITY */}
            <View style={s.section}>
              <SectionHeader icon={Activity} color={t.semantic.info} title="Recent Activity" />
              {timeline.length > 0 ? (
                timeline.slice(0, 8).map((ev) => (
                  <TouchableOpacity key={ev.id} activeOpacity={0.7} onPress={() => router.push(ev.route)} style={s.activityItem}>
                    <View style={s.activityDot}>
                      {ev.title.includes('Sent') || ev.title.includes('Result') ? (
                        <FlaskConical color={t.semantic.info} size={12} strokeWidth={2.5} />
                      ) : ev.title.includes('Started') ? (
                        <PillIcon color={t.semantic.warning} size={12} strokeWidth={2.5} />
                      ) : (
                        <UserPlus color={t.semantic.stable} size={12} strokeWidth={2.5} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.activityTop}>
                        <Text style={s.activityTitle}>{ev.title}</Text>
                        <Text style={s.activityTime}>{timeAgo(ev.time)}</Text>
                      </View>
                      {ev.sub ? <Text style={s.activitySub}>{ev.sub}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={s.emptyCard}><Text style={s.emptyText}>No recent activity.</Text></View>
              )}
            </View>

            {/* MY TASKS */}
            <View style={s.section}>
              <SectionHeader icon={ClipboardList} color={t.semantic.stable} title="My Tasks" count={myTasks.length} countColor={t.semantic.stable} />
              {myTasks.length > 0 ? (
                myTasks.slice(0, 5).map((t) => (
                  <TouchableOpacity key={t.id} activeOpacity={0.7} onPress={() => router.push(`/tasks/${t.id}`)} style={s.taskCard}>
                    <TouchableOpacity onPress={() => markTaskComplete(t.id)} style={s.taskCheck} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      {t.status === 'Completed' ? (
                        <CheckCircle color={t.semantic.stable} size={20} strokeWidth={2.5} />
                      ) : (
                        <Circle color={t.status === 'Overdue' ? t.semantic.critical : t.text.disabled} size={20} strokeWidth={1.5} />
                      )}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.taskTitle, t.status === 'Completed' && s.taskDone]}>{t.title}</Text>
                      <Text style={s.taskMeta}>
                        {t.patientName || t.patient_name || ''}{t.dueTime ? ` · ${formatDateTime(t.dueTime)}` : ''}
                      </Text>
                    </View>
                    {t.priority ? <Pill label={t.priority} color={t.priority === 'High' ? t.semantic.critical : t.semantic.warning} /> : null}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={s.emptyCard}><Text style={s.emptyText}>No assigned tasks.</Text></View>
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity activeOpacity={0.8} onPress={() => setFabOpen(true)} style={s.fab}>
        <Plus color={t.bg} size={24} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── BOTTOM SHEET ── */}
      <Modal visible={fabOpen} transparent animationType="slide" onRequestClose={() => setFabOpen(false)}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={() => setFabOpen(false)}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Quick Add</Text>
            <View style={s.sheetGrid}>
              {[
                { icon: UserPlus, label: 'Patient', color: t.semantic.info, route: '/new?type=patient' },
                { icon: FlaskConical, label: 'Investigation', color: t.semantic.warning, route: '/new?type=investigation' },
                { icon: PillIcon, label: 'Antibiotic', color: t.semantic.critical, route: '/new?type=antibiotic' },
                { icon: Syringe, label: 'Device', color: t.text.secondary, route: '/new?type=device' },
                { icon: ClipboardList, label: 'Task', color: t.semantic.stable, route: '/new?type=task' },
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

  // ── TOP NAV ──
  topNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topNavLeft: {},
  greeting: { fontFamily: typography.body, fontSize: 12, color: t.text.secondary },
  userName: { fontFamily: typography.heading, fontSize: 20, fontWeight: '700', color: t.text.primary },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 44,
    backgroundColor: t.input, borderRadius: 12, paddingHorizontal: 14, gap: 8,
  },
  searchPlaceholder: { fontFamily: typography.body, fontSize: 13, color: t.text.disabled },
  topNavRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: t.card, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: t.semantic.critical, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: typography.bodyMedium, fontSize: 10, fontWeight: '700', color: '#fff' },
  location: { fontFamily: typography.body, fontSize: 12, color: t.text.disabled, marginTop: -8 },

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

  // ── COLUMNS ──
  columns: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16 },
  colLeft: { flex: Platform.OS === 'web' ? 2 : null, gap: 20 },
  colRight: { flex: Platform.OS === 'web' ? 1 : null, gap: 20 },

  // ── SECTION ──
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { flex: 1, fontFamily: typography.heading, fontSize: 15, fontWeight: '700', color: t.text.primary },
  sectionCount: { fontFamily: typography.bodyMedium, fontSize: 12, fontWeight: '700', color: t.text.secondary },
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
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: t.card,
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
  reviewPatient: { fontFamily: typography.bodyMedium, fontSize: 14, fontWeight: '600', color: t.text.primary },
  reviewTask: { fontFamily: typography.body, fontSize: 12, color: t.text.secondary, marginTop: 2 },
  reviewMeta: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled, marginTop: 2 },

  // ── TASK ──
  taskCard: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: t.card, borderRadius: 10, borderWidth: 1, borderColor: t.cardBorder, gap: 10,
  },
  taskCheck: { width: 28, alignItems: 'center' },
  taskTitle: { fontFamily: typography.body, fontSize: 14, fontWeight: '600', color: t.text.primary },
  taskDone: { textDecorationLine: 'line-through', color: t.text.disabled },
  taskMeta: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled, marginTop: 1 },

  // ── ACTIVITY ──
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6 },
  activityDot: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: t.surfaceAlt,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  activityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityTitle: { fontFamily: typography.body, fontSize: 13, fontWeight: '600', color: t.text.primary },
  activityTime: { fontFamily: typography.body, fontSize: 11, color: t.text.disabled },
  activitySub: { fontFamily: typography.body, fontSize: 11, color: t.text.secondary, marginTop: 1 },

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
