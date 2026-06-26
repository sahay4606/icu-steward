import { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, CheckCheck, Inbox, ShieldAlert } from 'lucide-react-native';

import { SectionHeader, Surface, Pill, ToggleChip, SearchField } from '../../src/components/ui';
import { colors, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';
import { formatDateTime } from '../../src/lib/format';

function SeverityIcon({ severity }) {
  if (severity === 'critical') return <ShieldAlert color={colors.status.critical} size={18} strokeWidth={2} />;
  if (severity === 'warning') return <Bell color={colors.status.warning} size={18} strokeWidth={2} />;
  return <Inbox color={colors.status.info} size={18} strokeWidth={2} />;
}

export default function NotificationsScreen() {
  const { notifications, acknowledgeNotification, error } = useData();
  const [query, setQuery] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [acknowledged, setAcknowledged] = useState({});

  const visible = useMemo(() => {
    return notifications.filter((item) => {
      const open = !acknowledged[item.id] && !item.acknowledged;
      const matchesQuery =
        !query.trim() ||
        [item.title, item.detail, item.severity]
          .join(' ')
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      if (onlyOpen && !open) return false;
      return matchesQuery;
    });
  }, [onlyOpen, acknowledged, query]);

  if (error && notifications.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load notifications</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Notifications"
        subtitle="Push and in-app alerts stay visible until acknowledged."
      />

      <Surface style={styles.panel}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search alerts, cultures, reviews"
          testId="notifications-search"
        />
        <View style={{ height: 12 }} />
        <View style={styles.filterRow}>
          <ToggleChip
            label="Open only"
            selected={onlyOpen}
            onPress={() => setOnlyOpen((value) => !value)}
            testId="notifications-filter-open"
          />
          <ToggleChip
            label={`All ${notifications.length}`}
            selected={!onlyOpen}
            onPress={() => setOnlyOpen(false)}
            testId="notifications-filter-all"
          />
        </View>
      </Surface>

      <View style={styles.list}>
        {visible.map((item) => {
          const done = acknowledged[item.id] || item.acknowledged;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                setAcknowledged((prev) => ({ ...prev, [item.id]: true }));
                acknowledgeNotification(item.id);
              }}
              data-testid={`notification-card-${item.id}`}
            >
              <Surface style={[styles.card, done && styles.cardDone]}>
                <View style={styles.cardTop}>
                  <View style={styles.iconWrap}>
                    <SeverityIcon severity={item.severity} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.meta}>{item.detail}</Text>
                  </View>
                  <Pill
                    label={done ? 'Acknowledged' : 'Open'}
                    tone={done ? 'green' : item.severity === 'critical' ? 'red' : item.severity === 'warning' ? 'orange' : 'blue'}
                  />
                </View>
                <View style={styles.footerRow}>
                  <Text style={styles.footerText}>{formatDateTime(item.time)}</Text>
                  <Text style={styles.footerText}>Tap to acknowledge</Text>
                </View>
              </Surface>
            </TouchableOpacity>
          );
        })}
        {visible.length === 0 ? (
          <Surface style={styles.empty}>
            <CheckCheck color={colors.status.safe} size={20} strokeWidth={2} />
            <Text style={styles.emptyTitle}>Nothing pending</Text>
            <Text style={styles.emptyBody}>All notifications in this hospital tenant are acknowledged.</Text>
          </Surface>
        ) : null}
      </View>
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
  panel: {
    padding: 14,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
    gap: 10,
  },
  cardDone: {
    opacity: 0.78,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  meta: {
    marginTop: 3,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  empty: {
    padding: 18,
    gap: 6,
  },
  emptyTitle: {
    fontFamily: typography.heading,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
});
