import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import apiClient from '../api/client';
import { tokenStore } from '../storage/token';
import type {
  AuthResponse,
  BasketKey,
  MotherLanguage,
  Profile,
  Religion,
} from '../types';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthValue {
  status: Status;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    name: string,
    password: string,
    motherLanguage?: MotherLanguage,
    religion?: Religion,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  /** Reloads /api/profile after the student edits their selections. */
  refreshProfile: () => Promise<void>;
  saveProfile: (input: {
    mother_language: MotherLanguage;
    religion: Religion;
  }) => Promise<void>;
  saveSubjects: (picks: Record<BasketKey, string>) => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    const { data } = await apiClient.get<Profile>('/profile');
    setProfile(data);
  }, []);

  /** Restore the session on cold start. */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await tokenStore.get();
      if (!token) {
        if (!cancelled) setStatus('signedOut');
        return;
      }
      try {
        await loadProfile();
        if (!cancelled) setStatus('signedIn');
      } catch {
        // Token missing, expired, or rejected by the API.
        await tokenStore.clear();
        if (!cancelled) setStatus('signedOut');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  const authenticate = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const { data } = await apiClient.post<AuthResponse>(path, body);
      await tokenStore.set(data.token);
      await loadProfile();
      setStatus('signedIn');
    },
    [loadProfile],
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      profile,

      signIn: (email, password) =>
        authenticate('/auth/login', { email: email.trim(), password }),

      signUp: (email, name, password, mother_language, religion) =>
        authenticate('/auth/register', {
          email: email.trim(),
          name: name.trim(),
          password,
          mother_language,
          religion,
        }),

      signOut: async () => {
        await tokenStore.clear();
        setProfile(null);
        setStatus('signedOut');
      },

      refreshProfile: loadProfile,

      saveProfile: async ({ mother_language, religion }) => {
        await apiClient.patch('/profile', { mother_language, religion });
        await loadProfile();
      },

      saveSubjects: async (picks) => {
        await apiClient.put('/profile/subjects', picks);
        await loadProfile();
      },
    }),
    [status, profile, authenticate, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}