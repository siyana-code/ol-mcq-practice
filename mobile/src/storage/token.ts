import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'olmcq.authToken';

/**
 * JWT storage.
 *
 * SecureStore is backed by the iOS keychain and Android EncryptedSharedPrefs,
 * so the token is not recoverable from a plain filesystem backup. On web it
 * falls back to localStorage and is therefore not encrypted — acceptable only
 * because web is not a shipped target.
 */
export const tokenStore = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async set(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      // Fail closed: a token we cannot persist must not be treated as logged in.
    }
  },

  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Nothing to do.
    }
  },
};