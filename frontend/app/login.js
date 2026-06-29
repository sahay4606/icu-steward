import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput,
  TouchableOpacity, View, StyleSheet,
} from 'react-native';

import { radius, typography } from '../src/theme';
import { useThemeColors } from '../src/contexts/ThemeContext';
import { useAuth } from '../src/contexts/AuthContext';
import { API_BASE_URL } from '../src/lib/config';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  async function handleLogin() {
    setErrorMsg('');
    if (!email.trim() || !password) {
      setErrorMsg('Enter email and password.');
      return;
    }
    setBusy(true);
    console.log('[login] Starting login for', email.trim());
    console.log('[login] API URL:', API_BASE_URL);
    try {
      const result = await login(email.trim(), password);
      console.log('[login] Success, navigating to tabs');
      router.replace('/(tabs)');
    } catch (e) {
      console.error('[login] Error:', e);
      setErrorMsg(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  function handleGoogle() {
    setErrorMsg('Google sign-in coming soon.');
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>ICU</Text>
          </View>
          <Text style={styles.title}>ICU Steward</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@hospital.com"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            data-testid="login-email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            autoComplete="current-password"
            data-testid="login-password"
          />

          {errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogin}
            disabled={busy}
            style={[styles.primaryBtn, busy && styles.primaryBtnBusy]}
            data-testid="login-submit"
          >
            {busy ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.primaryBtnText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleGoogle}
            style={styles.googleBtn}
            data-testid="login-google"
          >
            <Text style={styles.googleBtnText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/signup')}
          style={styles.switchRow}
          data-testid="login-to-signup"
        >
          <Text style={styles.switchText}>
            Don't have an account?{' '}
            <Text style={styles.switchLink}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) { return StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 64, height: 64, borderRadius: radius.xl,
    backgroundColor: colors.brand.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { fontFamily: typography.heading, fontSize: 22, fontWeight: '900', color: colors.text.inverse },
  title: { fontFamily: typography.heading, fontSize: 26, fontWeight: '900', color: colors.text.primary },
  subtitle: { marginTop: 4, fontFamily: typography.body, fontSize: 14, color: colors.text.secondary },
  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20,
    shadowColor: '#0F172A', shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 2,
  },
  label: { fontFamily: typography.bodyMedium, fontSize: 13, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.background, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12, fontFamily: typography.body, fontSize: 15, color: colors.text.primary,
  },
  primaryBtn: {
    marginTop: 20, backgroundColor: colors.brand.primary, borderRadius: radius.sm,
    paddingVertical: 14, alignItems: 'center',
  },
  primaryBtnBusy: { opacity: 0.7 },
  primaryBtnText: { fontFamily: typography.bodyMedium, fontSize: 15, fontWeight: '700', color: colors.text.inverse },
  error: {
    marginTop: 12, fontFamily: typography.body, fontSize: 13,
    color: colors.status.critical, textAlign: 'center',
  },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, fontFamily: typography.body, fontSize: 12, color: colors.text.tertiary },
  googleBtn: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingVertical: 14, alignItems: 'center',
  },
  googleBtnText: { fontFamily: typography.bodyMedium, fontSize: 14, fontWeight: '700', color: colors.text.primary },
  switchRow: { alignItems: 'center', marginTop: 24 },
  switchText: { fontFamily: typography.body, fontSize: 13, color: colors.text.secondary },
  switchLink: { color: colors.brand.primary, fontWeight: '700' },
}); }
