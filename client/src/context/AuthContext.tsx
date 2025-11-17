import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, AuthUser } from '../models/result';
import { registerUser, signInUser, setAuthToken } from '../utils/api';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  initializing: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const TOKEN_STORAGE_KEY = '@wellness/token';
const USER_STORAGE_KEY = '@wellness/user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistSession = async (token: string, user: AuthUser) => {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const clearPersistedSession = async () => {
  await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);
        if (storedToken && storedUser) {
          const parsedUser: AuthUser = JSON.parse(storedUser);
          setTokenState(storedToken);
          setUser(parsedUser);
          setAuthToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to hydrate auth session:', error);
        await clearPersistedSession();
      } finally {
        setInitializing(false);
      }
    };

    hydrate();
  }, []);

  const setSession = async (payload: AuthResponse) => {
    setTokenState(payload.token);
    setUser(payload.user);
    setAuthToken(payload.token);
    await persistSession(payload.token, payload.user);
  };

  const handleSignIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const result = await signInUser(email, password);
      await setSession(result);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const result = await registerUser(email, password);
      await setSession(result);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setTokenState(null);
    setUser(null);
    setAuthToken(null);
    await clearPersistedSession();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      initializing,
      authLoading,
      signIn: handleSignIn,
      register: handleRegister,
      signOut: handleSignOut,
    }),
    [user, token, initializing, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

