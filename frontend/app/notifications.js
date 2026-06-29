import { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, CheckCheck, Inbox, ShieldAlert } from 'lucide-react-native';

import { SectionHeader, Surface, Pill, ToggleChip, SearchField } from '../src/components/ui';
import { typography } from '../src/theme';
import { useThemeColors } from '../src/contexts/ThemeContext';
import { useData } from '../src/contexts/DataContext';
import { formatDateTime } from '../src/lib/format';
import { BackButton } from '../src/components/back-button';

export default function NotificationsPage() {
  const { notifications, acknowledgeNotification, error } = useData();
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [acknowledged, setAcknowledged] = useState({});
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  function SeverityIcon({ severity }) {
    if (severity === 'critical') return <ShieldAlert color={colors.status.critical} size={18} strokeWidth={2} />;
    return <Bell color={colors.text.secondary} size={18} strokeWidth={2} />;
  }

  const visible = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return notifications.filter((n) => {
      if (onlyOpen && n.acknowledged) return false;
      if (!lower) return true;
      return [n.type, n.message, n.patientId].join(' ').toLowerCase().includes(lower);
    });
  }, [notifications, query, onlyOpen]);

  async function handleAcknowledge(id) {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
    try {
      await acknowledgeNotification(id);
    } catch (e) {
      setAcknowledged((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (error && notifications.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load notifications</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Surface style={styles.panel}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search notifications"
            testId="notifications-search"
          />
          <View style={{ height: 12 }} />
          <ToggleChip
            label="Unacknowledged only"
            selected={onlyOpen}
            onPress={() => setOnlyOpen((p) => !p)}
            testId="notifications-toggle"
          />
        </Surface>

        <View style={styles.list}>
          {visible.length > 0 ? (
            visible.map((n) => (
              <Surface key={n.id} style={[styles.card, n.acknowledged && styles.cardDone]}>
                <View style={styles.cardTop}>
                  <SeverityIcon severity={n.severity} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardType, n.acknowledged && styles.cardDoneText]}>{n.type}</Text>
                    <Text style={styles.cardMessage}>{n.message}</Text>
                  </View>
                  {!n.acknowledged && !acknowledged[n.id] ? (
                    <TouchableOpacity
                      onPress={() => handleAcknowledge(n.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      data-testid={`acknowledge-${n.id}`}
                    >
                      <CheckCheck color={colors.text.tertiary} size={20} strokeWidth={2} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                {n.patientId ? <Text style={styles.cardPatient}>{n.patientId}</Text> : null}
                <Text style={styles.cardTime}>{formatDateTime(n.time)}</Text>
              </Surface>
            ))
          ) : (
            <Surface style={styles.emptyCard}>
              <Inbox color={colors.text.disabled} size={32} strokeWidth={1.5} />
              <Text style={styles.emptyText}>No notifications.</Text>
            </Surface>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(colors) { return StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 12 },
  title: { flex: 1, fontFamily: typography.heading, fontSize: 20, fontWeight: '700', color: colors.text.primary, textAlign: 'center' },
  content: { padding: 16, gap: 16 },
  panel: { padding: 14, gap: 12 },
  list: { gap: 12 },
  card: { padding: 14, gap: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardDone: { opacity: 0.6 },
  cardDoneText: { textDecorationLine: 'line-through' },
  cardType: { fontFamily: typography.heading, fontSize: 15, fontWeight: '800', color: colors.text.primary },
  cardMessage: { marginTop: 2, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary },
  cardPatient: { fontFamily: typography.mono, fontSize: 12, color: colors.text.disabled },
  cardTime: { fontFamily: typography.body, fontSize: 11, color: colors.text.disabled },
  emptyCard: { alignItems: 'center', padding: 40, gap: 12 },
  emptyText: { fontFamily: typography.body, fontSize: 13, color: colors.text.disabled },
}); }
