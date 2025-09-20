'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole, AuthState, LoginCredentials, SignUpCredentials } from '@/lib/types/auth';

interface AuthContextType extends AuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: Error | null }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  hasPermission: (permission: keyof UserProfile['permissions']) => boolean;
  isRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
  getSupabaseClient: () => ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    _user: null,
    session: null,
    loading: true,
    error: null,
  });

  const _supabase = useMemo(() => createClient(), []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching _user profile:', error);
        setState(prev => ({ ...prev, error: 'Failed to fetch _user profile' }));
        return;
      }

      if (profile) {
        setState(prev => ({
          ...prev,
          _user: profile,
          loading: false,
          error: null,
        }));
      }
    } catch (error) {
      console.error('Error fetching _user profile:', error);
      setState(prev => ({ ...prev, error: 'Failed to fetch _user profile' }));
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await fetchUserProfile(session._user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({ ...prev, error: 'Failed to initialize authentication' }));
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session._user.id);
        } else if (event === 'SIGNED_OUT') {
          setState({
            _user: null,
            session: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, supabase.auth]);


  const signIn = async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            company_name: credentials.company_name,
            phone: credentials.phone,
            role: credentials.role || '_user',
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state._user) throw new Error('No _user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state._user.id);

      if (error) throw error;

      // Refresh _user profile
      await refreshUser();

      return { error: null };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      return { error };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return { error: error instanceof Error ? error : new Error(errorMessage) };
    }
  };

  const hasPermission = useCallback((permission: keyof UserProfile['permissions']) => {
    return state._user?.permissions?.[permission] || false;
  }, [state._user]);

  const isRole = useCallback((role: UserRole) => {
    return state._user?.role === role;
  }, [state._user]);

  const refreshUser = async () => {
    if (state._user) {
      await fetchUserProfile(state._user.id);
    }
  };

  const getSupabaseClient = () => supabase;

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    hasPermission,
    isRole,
    refreshUser,
    getSupabaseClient,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
