import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';
import { apiClient, setApiAccessToken, getApiAccessToken } from './api-client';
import { MOCK_USERS } from '../mocks/auth/auth.fixtures';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setTokenState] = useState(null);
  const setToken = (value) => {
    setApiAccessToken(value);
    setTokenState(value);
  };
  const [role, setRole] = useState('candidate');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Development mode fallback when Supabase credentials are missing or explicit demo requested
  const [devMode, setDevMode] = useState(false);

  // Fetch verified profile from backend GET /api/v1/me and role from user_roles
  const fetchBackendIdentity = useCallback(async (accessToken, userId = null) => {
    try {
      const response = await apiClient.get('me', { token: accessToken });
      if (getApiAccessToken() !== accessToken) return null;
      if (response?.data) {
        setUser(response.data.user);
        setProfile(response.data.profile);

        const currentUserId = response.data.user?.id || userId;
        if (isSupabaseConfigured && supabase && currentUserId) {
          try {
            const { data: roleRows, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', currentUserId);
            if (roleError) throw roleError;
            if (getApiAccessToken() !== accessToken) return null;
            const roles = roleRows?.map((row) => row.role) || [];
            setRole(roles.includes('admin') ? 'admin' : roles.includes('evaluator') ? 'evaluator' : 'candidate');
          } catch (rErr) {
            console.warn('Role lookup fallback to candidate:', rErr.message);
            setRole('candidate');
          }
        } else {
          setRole('candidate');
        }
        return response.data;
      }
    } catch (err) {
      console.warn('Backend /me fetch failed or profile absent:', err.message);
      setError(err);
      throw err;
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
            await fetchBackendIdentity(session.access_token, session.user.id);
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
        // When Supabase is unconfigured, start unauthenticated
        setUser(null);
        setProfile(null);
        setToken(null);
        setRole('candidate');
        setDevMode(false);
      }

      if (mounted) setIsLoading(false);
    }

    init();

    // Listen to Supabase auth events if configured
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setToken(session.access_token);
          setDevMode(false);
          setIsLoading(true);
          // Supabase auth events run under an auth lock. Defer queries until it is released.
          setTimeout(() => {
            if (!mounted || getApiAccessToken() !== session.access_token) return;
            fetchBackendIdentity(session.access_token, session.user.id)
              .catch((identityError) => { if (mounted) setError(identityError); })
              .finally(() => { if (mounted) setIsLoading(false); });
          }, 0);
        } else {
          setUser(null);
          setProfile(null);
          setToken(null);
          setRole('candidate');
          setIsLoading(false);
        }
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
      try {
        await fetchBackendIdentity(data.session.access_token, data.user.id);
      } finally {
        setIsLoading(false);
      }
      return data;
    } else {
      setIsLoading(false);
      throw new Error('Authentication is not configured. Configure Supabase before signing in.');

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
      setIsLoading(false);
      throw new Error('Authentication is not configured. Configure Supabase before creating an account.');
    }
  };

  // Sign out handler
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      } catch (err) {
        setIsLoading(false);
        setError(err);
        throw err;
      }
    }
    // Clear drafts from sessionStorage as required by PRD
    try {
      Object.keys(sessionStorage).filter((key) => key.startsWith('paneliq_')).forEach((key) => sessionStorage.removeItem(key));
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
      throw new Error('Password recovery is unavailable until Supabase is configured.');
    }
  };

  // Update password completion
  const updatePassword = async (newPassword) => {
    if (isSupabaseConfigured && supabase) {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
    } else {
      throw new Error('Password updates are unavailable until Supabase is configured.');
    }
  };

  // Profile update via real PATCH /api/v1/me
  const updateProfile = async (patch) => {
    if (!devMode) {
      if (!token) throw new Error('Please sign in before saving your profile.');
      const response = await apiClient.patch('me', patch, { token });
      if (!response?.data?.profile) throw new Error('The server did not return the saved profile.');
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
    if (!import.meta.env.DEV || isSupabaseConfigured) return;
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
