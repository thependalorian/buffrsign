'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  UserProfile, 
  UserRole, 
  AuthState, 
  LoginCredentials, 
  SignUpCredentials,
  AdminUser,
  AuthContextType as EnhancedAuthContextType
} from '@/lib/auth/types';
import { User } from '@supabase/supabase-js';
import { AuthenticationService } from '@/lib/auth/service';
import { getAdminLevel, isBuffrEmail } from '@/lib/auth/admin-auth';
import { authConfig } from '@/lib/auth/config';


// ========== Simple Toast Function ==========
// TODO: Replace with proper toast component when available
const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
};

/**
 * Authentication Context for BuffrSign
 * 
 * This context provides comprehensive authentication functionality for the BuffrSign application.
 * It integrates with the core auth modules to provide document signing and management capabilities.
 */

// ========== Context Creation ==========

const AuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

// ========== Auth Provider Component ==========

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ========== State Management ==========
  
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const supabase = createClient();
  const authService = useMemo(() => new AuthenticationService(), []);

  // ========== Admin Authentication Hook ==========
  
  const useAdminAuth = useCallback(() => {
    if (!state.user) {
      return {
        isAdmin: false,
        adminLevel: null,
        isBuffrEmail: false,
        canManageSuperAdmins: false,
        canAccessAdminPanel: false
      };
    }

    const isAdmin = state.user.role === 'admin' || state.user.role === 'super_admin';
    const adminLevel = getAdminLevel(state.user.email, state.user.role);
    const isBuffr = state.user.email.toLowerCase().endsWith('@buffr.ai');
    const canManageSuperAdmins = state.user.permissions.can_manage_super_admins;
    const canAccessAdminPanel = state.user.permissions.can_access_admin_panel;

    return {
      isAdmin,
      adminLevel,
      isBuffrEmail: isBuffr,
      canManageSuperAdmins,
      canAccessAdminPanel
    };
  }, [state.user]);

  const adminAuth = useAdminAuth();

  // ========== Session Management ==========

  const loadUserProfile = useCallback(async (user: User | UserProfile) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load user profile' 
        }));
        return;
      }

      const userProfile: UserProfile = {
        id: user.id,
        email: user.email || '',
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        role: profile?.role || 'user',
        permissions: profile?.permissions || authConfig.defaultPermissions,
        preferences: profile?.preferences || authConfig.defaultPreferences,
        created_at: profile?.created_at || user.created_at,
        updated_at: profile?.updated_at || user.updated_at,
        last_login_at: profile?.last_login_at || null,
        is_active: profile?.is_active ?? true,
        is_verified: 'email_confirmed_at' in user && user.email_confirmed_at ? true : false
      };

      setState(prev => ({ 
        ...prev, 
        user: userProfile, 
        session: null, // We'll get the actual session from Supabase
        loading: false, 
        error: null 
      }));

      // Load admin user data if applicable
      const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super_admin';
      if (isAdmin) {
        const adminLevel = getAdminLevel(userProfile.email, userProfile.role);
        const isBuffr = userProfile.email.toLowerCase().endsWith('@buffr.ai');
        
        setAdminUser({
          ...userProfile,
          is_admin: true,
          admin_level: adminLevel || 'admin',
          buffr_email: isBuffr
        });
      }

    } catch (error) {
      console.error('Error loading user profile:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [supabase]);

  const initializeAuth = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setState(prev => ({ ...prev, loading: false, error: error.message }));
        return;
      }

      if (session?._user) {
        await loadUserProfile(session._user);
      } else {
        setState(prev => ({ 
          ...prev, 
          user: null, 
          session: null, 
          loading: false, 
          error: null 
        }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [supabase.auth, loadUserProfile]);

  // ========== Authentication Methods ==========

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signIn(credentials);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      if (result.user) {
        await loadUserProfile(result.user);
        toast('Successfully signed in!', 'success');
      }

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService, loadUserProfile]);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signUp(credentials);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('Account created successfully! Please check your email to verify your account.', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService]);

  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signOut();
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      setState(prev => ({ 
        ...prev, 
        user: null, 
        session: null, 
        loading: false, 
        error: null 
      }));
      setAdminUser(null);
      toast('Successfully signed out!', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        return { error: 'No user logged in' };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.updateProfile(state.user.id, updates);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      // Profile was updated successfully
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: null 
      }));
      toast('Profile updated successfully!', 'success');

      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService, state.user]);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.resetPassword(email);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('Password reset email sent!', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.signInWithGoogle();
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('Redirecting to Google...', 'info');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService]);


  // ========== Admin Methods ==========

  const createAdminUser = useCallback(async (email: string, firstName: string, lastName: string, role?: UserRole) => {
    try {
      if (!state.user?.permissions.can_manage_users) {
        return { error: 'Insufficient permissions to create admin users' };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.createAdminUser(email, firstName, lastName, role);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('Admin user created successfully!', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin user creation failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService, state.user?.permissions.can_manage_users]);

  const promoteToAdmin = useCallback(async (userId: string) => {
    try {
      if (!state.user?.permissions.can_manage_users) {
        return { error: 'Insufficient permissions to promote users' };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.promoteToAdmin(userId);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('User promoted to admin successfully!', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User promotion failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService, state.user?.permissions.can_manage_users]);

  const demoteFromAdmin = useCallback(async (userId: string) => {
    try {
      if (!state.user?.permissions.can_manage_users) {
        return { error: 'Insufficient permissions to demote users' };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await authService.demoteFromAdmin(userId);
      
      if (result.error) {
        setState(prev => ({ ...prev, loading: false, error: result.error }));
        return { error: result.error };
      }

      toast('User demoted from admin successfully!', 'success');
      return { error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'User demotion failed';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, [authService, state.user?.permissions.can_manage_users]);

  // ========== Permission Helpers ==========

  const hasPermission = useCallback((permission: keyof UserProfile['permissions']) => {
    return state.user?.permissions[permission] ?? false;
  }, [state.user]);

  const isAdmin = useMemo(() => adminAuth.isAdmin, [adminAuth.isAdmin]);
  const adminLevel = useMemo(() => adminAuth.adminLevel || undefined, [adminAuth.adminLevel]);
  const isBuffrEmail = useMemo(() => adminAuth.isBuffrEmail, [adminAuth.isBuffrEmail]);
  const canManageSuperAdmins = useMemo(() => adminAuth.canManageSuperAdmins, [adminAuth.canManageSuperAdmins]);
  const canAccessAdminPanel = useMemo(() => adminAuth.canAccessAdminPanel, [adminAuth.canAccessAdminPanel]);

  // ========== Additional Required Methods ==========
  
  const isRole = useCallback((role: UserRole) => {
    return state.user?.role === role;
  }, [state.user]);

  const refreshUser = useCallback(async () => {
    if (state.user) {
      await loadUserProfile(state.user);
    }
  }, [state.user, loadUserProfile]);

  const refreshToken = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Token refresh failed' };
    }
  }, [supabase.auth]);

  // ========== Effects ==========

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?._user) {
          await loadUserProfile(session._user);
        } else if (event === 'SIGNED_OUT') {
          setState(prev => ({ 
            ...prev, 
            user: null, 
            session: null, 
            loading: false, 
            error: null 
          }));
          setAdminUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth, loadUserProfile, supabase.auth]);

  // ========== Context Value ==========

  const contextValue: EnhancedAuthContextType = {
    // State
    ...state,
    
    // Admin state
    adminUser,
    
    // Authentication methods
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    signInWithGoogle,
    
    // Admin methods
    createAdminUser,
    promoteToAdmin,
    demoteFromAdmin,
    
    // Permission helpers
    hasPermission,
    isRole,
    refreshUser,
    refreshToken,
    
    // Admin helpers
    isAdmin,
    adminLevel,
    isBuffrEmail,
    canManageSuperAdmins,
    canAccessAdminPanel,

    // Supabase client
    supabase,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== Hook ==========

export function useAuth(): EnhancedAuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}