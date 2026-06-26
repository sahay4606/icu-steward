import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapStorage } from '../src/utils/storage';
import { DataProvider } from '../src/contexts/DataContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme';

function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    );
  }

  return children;
}

function RootLayoutInner() {
  useEffect(() => { bootstrapStorage(); }, []);

  return (
    <AuthProvider>
      <DataProvider>
        <AuthGate>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="patients/[id]" />
            <Stack.Screen name="investigations/[id]" />
            <Stack.Screen name="antibiotics/[id]" />
            <Stack.Screen name="new" />
            <Stack.Screen name="search" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="hospital-settings" />
          </Stack>
        </AuthGate>
      </DataProvider>
    </AuthProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutInner />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
