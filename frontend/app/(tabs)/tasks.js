import { router } from 'expo-router';
import { CheckCircle2, Circle, Clock3 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';

import { SectionHeader, Surface, Pill, ToggleChip, SearchField } from '../../src/components/ui';
import { colors, typography } from '../../src/theme';
import { useData } from '../../src/contexts/DataContext';
import { formatDateTime } from '../../src/lib/format';

export default function TasksScreen() {
  const { tasks, error } = useData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const visible = useMemo(() => {
    const lower = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus = status === 'All' || task.status === status;
      const matchesQuery =
        !lower ||
        [task.title, task.patientId, task.assignedTo, task.status]
          .join(' ')
          .toLowerCase()
          .includes(lower);
      return matchesStatus && matchesQuery;
    });
  }, [status, query]);

  if (error && tasks.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <Text style={{ fontFamily: typography.heading, fontSize: 17, fontWeight: '700', color: colors.text.primary, textAlign: 'center' }}>Could not load tasks</Text>
        <Text style={{ marginTop: 8, fontFamily: typography.body, fontSize: 13, color: colors.text.secondary, textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <SectionHeader
        title="Tasks"
        subtitle="Assigned follow-up actions with clear due times."
        actionLabel="New"
        onAction={() => router.push('/new?type=task')}
        actionTestId="tasks-new-action"
      />

      <Surface style={styles.panel}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks, assignee, patient"
          testId="tasks-search"
        />
        <View style={{ height: 12 }} />
        <View style={styles.filterRow}>
          {['All', 'Pending', 'Completed'].map((item) => (
            <ToggleChip
              key={item}
              label={item}
              selected={status === item}
              onPress={() => setStatus(item)}
              testId={`tasks-filter-${item}`}
            />
          ))}
        </View>
      </Surface>

      <View style={styles.list}>
        {visible.map((task) => (
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.7}
            onPress={() => router.push('/patients')}
            data-testid={`task-card-${task.id}`}
          >
            <Surface style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.iconWrap}>
                  {task.status === 'Completed' ? (
                    <CheckCircle2 color={colors.status.safe} size={18} strokeWidth={2} />
                  ) : (
                    <Circle color={colors.status.warning} size={18} strokeWidth={2} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{task.title}</Text>
                  <Text style={styles.meta}>{task.patientId} · {task.assignedTo}</Text>
                </View>
                <Pill label={task.priority} tone={task.priority === 'High' ? 'red' : 'orange'} />
              </View>
              <View style={styles.detailRow}>
                <Clock3 color={colors.text.tertiary} size={16} strokeWidth={2} />
                <Text style={styles.detailText}>Due {formatDateTime(task.dueTime)}</Text>
              </View>
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Status</Text>
                <Text style={[styles.footerValue, task.status === 'Completed' && { color: colors.status.safe }]}>
                  {task.status}
                </Text>
              </View>
            </Surface>
          </TouchableOpacity>
        ))}
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
    gap: 8,
    flexWrap: 'wrap',
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 14,
    gap: 10,
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
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.text.secondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  footerValue: {
    fontFamily: typography.bodyMedium,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
