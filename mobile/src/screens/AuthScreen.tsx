import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, type, space, radius } from '../theme';
import { Screen, Card, Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';

type Mode = 'signIn' | 'signUp';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'signUp';

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Enter a valid email address';
    }
    if (password.length < 6) {
      next.password = 'At least 6 characters';
    }
    if (isSignUp && name.trim().length < 2) {
      next.name = 'Enter your name';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit() {
    setFormError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email, name, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setErrors({});
    setFormError(null);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.brand}>
          <View style={s.logo}>
            <Ionicons name="school" size={32} color={colors.onPrimary} />
          </View>
          <Text style={s.title}>OL MCQ Practice</Text>
          <Text style={s.subtitle}>සාමාන්‍ය පෙළ විභාග පුරුදු</Text>
        </View>

        <Card style={s.card}>
          <Text style={s.cardTitle}>{isSignUp ? 'Create account' : 'Welcome back'}</Text>
          <Text style={s.cardBody}>
            {isSignUp
              ? 'Track your progress across every subject.'
              : 'Log in to continue practising.'}
          </Text>

          {isSignUp ? (
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Nimal Perera"
              autoCapitalize="words"
              error={errors.name}
            />
          ) : null}

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password}
          />

          {formError ? (
            <View style={s.alert}>
              <Ionicons name="alert-circle" size={18} color={colors.error} />
              <Text style={s.alertText}>{formError}</Text>
            </View>
          ) : null}

          {busy ? (
            <ActivityIndicator color={colors.onPrimary} style={s.busy} />
          ) : (
            <Button
              label={isSignUp ? 'Create account' : 'Log in'}
              onPress={submit}
            />
          )}

          <Button
            label={isSignUp ? 'Already have an account?' : 'New here? Create an account'}
            onPress={toggleMode}
            variant="text"
          />
        </Card>

        <Text style={s.legal}>
          By continuing you agree to practise honestly. Your progress is stored on your
          account only.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const s = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: space.xl,
  },

  brand: {
    alignItems: 'center',
    marginBottom: space.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    color: colors.onSurface,
    ...type.headlineSmall,
  },
  subtitle: {
    color: colors.onSurfaceVariant,
    marginTop: space.xs,
    ...type.bodyMedium,
  },

  card: {
    padding: space.xl,
  },
  cardTitle: {
    color: colors.onSurface,
    ...type.titleLarge,
  },
  cardBody: {
    color: colors.onSurfaceVariant,
    marginTop: space.xs,
    marginBottom: space.xl,
    ...type.bodyMedium,
  },

  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.sm,
    padding: space.md,
    marginBottom: space.lg,
  },
  alertText: {
    flex: 1,
    color: colors.onErrorContainer,
    ...type.bodyMedium,
  },

  busy: {
    marginVertical: space.xl,
  },

  legal: {
    color: colors.outline,
    textAlign: 'center',
    marginTop: space.xl,
    ...type.bodySmall,
  },
});