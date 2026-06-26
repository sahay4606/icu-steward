import { useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput,
  TouchableOpacity, View, StyleSheet, Alert,
} from 'react-native';

import { colors, radius, typography } from '../src/theme';
import { useAuth } from '../src/contexts/AuthContext';

export default function SignupScreen() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [hospitalId, setHospitalId] = useState('hosp-st-john');
  const [busy, setBusy] = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Missing fields', 'All fields are required.');
    }
    if (password !== confirm) return Alert.alert('Passwords do not match');
    if (password.length < 6) return Alert.alert('Password too short', 'Use at least 6 characters.');
    setBusy(true);
    try {
      await signup(name.trim(), email.trim(), password, hospitalId);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setBusy(false);
    }
  }

  function handleGoogle() {
    Alert.alert('Coming soon', 'Google sign-up will be available in a future update.');
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ICU Steward</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Dr. Jane Doe"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="words"
            data-testid="signup-name"
          />

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
            data-testid="signup-email"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            autoComplete="new-password"
            data-testid="signup-password"
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Re-enter password"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            autoComplete="new-password"
            data-testid="signup-confirm"
          />

          <Text style={styles.label}>Hospital code</Text>
          <TextInput
            style={styles.input}
            value={hospitalId}
            onChangeText={setHospitalId}
            placeholder="e.g. hosp-st-john"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            autoComplete="off"
            data-testid="signup-hospital"
          />

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSignup}
            disabled={busy}
            style={styles.primaryBtn}
            data-testid="signup-submit"
          >
            {busy ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={styles.primaryBtnText}>Create account</Text>
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
            data-testid="signup-google"
          >
            <Text style={styles.googleBtnText}>Sign up with Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/login')}
          style={styles.switchRow}
          data-testid="signup-to-login"
        >
          <Text style={styles.switchText}>
            Already have an account?{' '}
            <Text style={styles.switchLink}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
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
  primaryBtnText: { fontFamily: typography.bodyMedium, fontSize: 15, fontWeight: '700', color: colors.text.inverse },
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
});
