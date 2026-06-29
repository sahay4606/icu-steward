import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { bootstrapStorage } from '../src/utils/storage';
import { DataProvider } from '../src/contexts/DataContext';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { useThemeColors } from '../src/contexts/ThemeContext';

function AuthGate({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const colors = useThemeColors();

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
    const c = colors || { brand: { primary: '#1D4ED8' }, background: '#F4F6F9' };
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background }}>
        <ActivityIndicator size="large" color={c.brand.primary} />
      </View>
    );
  }

  return children;
}

function RootLayoutInner() {
  useEffect(() => { bootstrapStorage(); }, []);

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <RootLayoutInner />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
