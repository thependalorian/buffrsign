// BuffrSign Platform - Authentication Context Provider
// Provides authentication state management and role-based access control

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser, AuthResponse, signIn, signUp, signOut, getCurrentSession, refreshSession } from './supabase';
import { UserRole, KYCStatus } from './types';

// ============================================================================
// AUTHENTICATION CONTEXT TYPES
// ============================================================================

interface AuthContextType {
  _user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, userData: unknown) => Promise<AuthResponse>;
  signOut: () => Promise<{ error?: string }>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  hasRole: (requiredRole: UserRole | UserRole[]) => boolean;
  hasKYCStatus: (requiredStatus: KYCStatus | KYCStatus[]) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
}

// ============================================================================
// AUTHENTICATION CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTHENTICATION PROVIDER COMPONENT
// ============================================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [_user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const session = await getCurrentSession();
      
      if (session._user) {
        setUser(session._user);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Failed to initialize authentication');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const handleSignIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await signIn(email, password);
      
      if (response._user) {
        setUser(response._user);
      } else if (response.error) {
        setError(response.error);
      }
      
      return response;
    } catch {
      const errorMessage = 'Sign in failed';
      setError(errorMessage);
      return { _user: null, session: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, userData: unknown): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await signUp(email, password, userData as { first_name: string; last_name: string; company?: string });
      
      if (response._user) {
        setUser(response._user);
      } else if (response.error) {
        setError(response.error);
      }
      
      return response;
    } catch {
      const errorMessage = 'Sign up failed';
      setError(errorMessage);
      return { _user: null, session: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async (): Promise<{ error?: string }> => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await signOut();
      
      if (response.error) {
        setError(response.error);
      } else {
        setUser(null);
      }
      
      return response;
    } catch {
      const errorMessage = 'Sign out failed';
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (!_user) return;
      
      const response = await refreshSession();
      
      if (response._user) {
        setUser(response._user);
      } else if (response.error) {
        setError(response.error);
        // If refresh fails, sign out the user
        setUser(null);
      }
    } catch (err) {
      console.error('User refresh error:', err);
      setError('Failed to refresh _user session');
      setUser(null);
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL
  // ============================================================================

  const hasRole = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!_user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(_user.role as UserRole);
    }
    
    return _user.role === requiredRole;
  };

  const hasKYCStatus = (): boolean => {
    if (!_user) return false;
    
    // For now, we'll assume basic verification for all users
    // This should be updated when KYC status is properly implemented
    return true;
  };

  const isAdmin = (): boolean => {
    if (!_user) return false;
    
    const adminRoles = [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN
    ];
    
    return adminRoles.includes(_user.role as UserRole);
  };

  const isSuperAdmin = (): boolean => {
    if (!_user) return false;
    
    return _user.role === UserRole.SUPER_ADMIN;
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: AuthContextType = {
    _user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    refreshUser,
    clearError,
    hasRole,
    hasKYCStatus,
    isAdmin,
    isSuperAdmin,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// AUTHENTICATION HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL HOOKS
// ============================================================================

export function useRoleAccess(requiredRole: UserRole | UserRole[]): boolean {
  const { hasRole } = useAuth();
  return hasRole(requiredRole);
}

export function useAdminAccess(): boolean {
  const { isAdmin } = useAuth();
  return isAdmin();
}

export function useSuperAdminAccess(): boolean {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin();
}

export function useKYCStatus(requiredStatus: KYCStatus | KYCStatus[]): boolean {
  const { hasKYCStatus } = useAuth();
  return hasKYCStatus(requiredStatus);
}

// ============================================================================
// PROTECTED ROUTE COMPONENT
// ============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredKYCStatus?: KYCStatus | KYCStatus[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredKYCStatus,
  fallback,
  redirectTo
}: ProtectedRouteProps) {
  const { _user, loading, hasRole, hasKYCStatus } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Check if _user is authenticated
  if (!_user) {
    if (redirectTo) {
      // Redirect to login page
      window.location.href = redirectTo;
      return null;
    }
    
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600">You don&#39;t have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check KYC status requirements
  if (requiredKYCStatus && !hasKYCStatus(requiredKYCStatus)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Verification Required</h2>
          <p className="text-gray-600">Please complete your KYC verification to access this page.</p>
        </div>
      </div>
    );
  }

  // User has access
  return <>{children}</>;
}

// ============================================================================
// EXPORTS
// ============================================================================

// All functions are exported individually above
