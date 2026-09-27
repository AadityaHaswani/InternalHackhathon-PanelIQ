import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { apiClient, setApiAccessToken } from './api-client';
import { MOCK_USERS } from '../mocks/auth/auth.fixtures';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Development mode fallback when Supabase credentials are missing or explicit demo requested
  const [devMode, setDevMode] = useState(!isSupabaseConfigured);

  // Sync token to API client whenever it changes
  useEffect(() => {
    setApiAccessToken(token);
  }, [token]);

  // Fetch verified profile from backend GET /api/v1/me
  const fetchBackendIdentity = useCallback(async (accessToken) => {
    try {
      const response = await apiClient.get('me', { token: accessToken });
      if (response?.data) {
        setUser(response.data.user);
        setProfile(response.data.profile);
        // Determine role: backend currently does not provide admin grants in token/profile,
        // so default to candidate unless explicit admin/evaluator metadata exists
        return response.data;
      }
    } catch (err) {
      console.warn('Backend /me fetch failed or profile absent:', err.message);
      // Profile may be null if newly registered and unonboarded
      if (err.code === 'PROFILE_FORBIDDEN' || err.code === 'AUTH_REQUIRED') {
        setError(err);
      }
    }
    return null;
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function init() {
      setIsLoading(true);
      setError(null);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (session?.user && mounted) {
            setUser(session.user);
            setToken(session.access_token);
            setDevMode(false);
            await fetchBackendIdentity(session.access_token);
          } else if (mounted) {
            setUser(null);
            setProfile(null);
            setToken(null);
          }
        } catch (err) {
          console.warn('Supabase session initialization error:', err.message);
          if (mounted) setError(err);
        }
      } else if (mounted) {
        // Fallback to initial mock candidate in dev mode for UI exploration
        const defaultAccount = MOCK_USERS.candidate;
        setUser({ id: defaultAccount.id, email: defaultAccount.email });
        setProfile(defaultAccount.profile);
        setToken(defaultAccount.token);
        setRole(defaultAccount.role);
        setDevMode(true);
      }

      if (mounted) setIsLoading(false);
    }

    init();

    // Listen to Supabase auth events if configured
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setToken(session.access_token);
          setDevMode(false);
          await fetchBackendIdentity(session.access_token);
        } else {
          setUser(null);
          setProfile(null);
          setToken(null);
        }
        setIsLoading(false);
      });
      subscription = data.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [fetchBackendIdentity]);

  // Sign in handler
  const signIn = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password });
      if (authErr) {
        setIsLoading(false);
        setError(authErr);
        throw authErr;
      }
      setUser(data.user);
      setToken(data.session.access_token);
      await fetchBackendIdentity(data.session.access_token);
      setIsLoading(false);
      return data;
    } else {
      // Mock sign in matching test accounts
      const matched = Object.values(MOCK_USERS).find((u) => u.email.toLowerCase() === email.toLowerCase());
      const account = matched || {
        id: `usr_${Date.now()}`,
        email,
        role: 'candidate',
        profile: null,
        token: `mock_token_${Date.now()}`,
      };
      setUser({ id: account.id, email: account.email });
      setProfile(account.profile);
      setToken(account.token);
      setRole(account.role);
      setDevMode(true);
      setIsLoading(false);
      return { user: account, session: { access_token: account.token } };
    }
  };

  // Sign up handler
  const signUp = async ({ email, password }) => {
    setIsLoading(true);
    setError(null);

    if (isSupabaseConfigured && supabase) {
      const { data, error: authErr } = await supabase.auth.signUp({ email, password });
      if (authErr) {
        setIsLoading(false);
        setError(authErr);
        throw authErr;
      }
      setIsLoading(false);
      return data;
    } else {
      // Dev mode instant registration
      const newAccount = {
        id: `usr_${Date.now()}`,
        email,
        role: 'candidate',
        profile: null,
        token: `mock_token_${Date.now()}`,
      };
      setUser({ id: newAccount.id, email: newAccount.email });
      setProfile(null);
      setToken(newAccount.token);
      setRole('candidate');
      setDevMode(true);
      setIsLoading(false);
      return { user: newAccount, session: { access_token: newAccount.token } };
    }
  };

  // Sign out handler
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    // Clear drafts from sessionStorage as required by PRD
    try {
      sessionStorage.clear();
    } catch {
      // Ignore sessionStorage exceptions
    }
    setUser(null);
    setProfile(null);
    setToken(null);
    setRole('candidate');
    setIsLoading(false);
  };

  // Password reset request
  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (resetErr) throw resetErr;
    } else {
      // Dev mode simulated success
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  // Update password completion
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  };

  // Profile update via real PATCH /api/v1/me
  const updateProfile = async (patch) => {
    if (!devMode && token) {
      const response = await apiClient.patch('me', patch, { token });
      if (response?.data?.profile) {
        setProfile(response.data.profile);
      }
      return response?.data;
    } else {
      // Dev mode update
      const updated = {
        ...(profile || {}),
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      setProfile(updated);
      return { user, profile: updated };
    }
  };

  // Switch demo account in dev mode
  const setDevAccount = (accountKey) => {
    const acc = MOCK_USERS[accountKey];
    if (acc) {
      setUser({ id: acc.id, email: acc.email });
      setProfile(acc.profile);
      setToken(acc.token);
      setRole(acc.role);
      setDevMode(true);
    }
  };

  const value = {
    user,
    profile,
    token,
    role,
    isLoading,
    error,
    isSupabaseConfigured,
    devMode,
    setDevMode,
    setDevAccount,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => token && fetchBackendIdentity(token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
