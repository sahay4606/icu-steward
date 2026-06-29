import { useState, useMemo } from 'react';
import {
  Activity, Grid3X3, ListTodo, UserRound, Users,
} from 'lucide-react-native';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';

import { shadow, typography } from '../../src/theme';
import { useThemeColors } from '../../src/contexts/ThemeContext';

import DashboardScreen from './index';
import PatientsScreen from './patients';
import TasksScreen from './tasks';
import ActivityScreen from './activity';
import ProfileScreen from './profile';

const tabs = [
  { name: 'dashboard', label: 'Dashboard', icon: Grid3X3, component: DashboardScreen },
  { name: 'patients', label: 'Patients', icon: Users, component: PatientsScreen },
  { name: 'tasks', label: 'Tasks', icon: ListTodo, component: TasksScreen },
  { name: 'activity', label: 'Activity', icon: Activity, component: ActivityScreen },
  { name: 'profile', label: 'Profile', icon: UserRound, component: ProfileScreen },
];

export default function TabsLayout() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {tabs.map(({ name, component: Comp }) => (
          <View key={name} style={{ display: activeTab === name ? 'flex' : 'none', flex: 1 }}>
            <Comp />
          </View>
        ))}
      </View>

      <View style={styles.tabBar}>
        {tabs.map(({ name, label, icon: Icon }) => {
          const isActive = activeTab === name;
          return (
            <TouchableOpacity
              key={name}
              activeOpacity={0.7}
              onPress={() => setActiveTab(name)}
              style={styles.tabButton}
              data-testid={`tab-${name}`}
            >
              <Icon
                color={isActive ? colors.brand.primary : colors.text.tertiary}
                size={22}
                strokeWidth={2}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors) { return StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingTop: 8,
    paddingBottom: 10,
    ...shadow.low,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 4,
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  tabLabelActive: {
    color: colors.brand.primary,
    fontWeight: '700',
  },
}); }
