/**
 * JWT-Enhanced Auth Context for BuffrSign
 * 
 * This context integrates JWT tokens with Supabase authentication,
 * providing enhanced security and token management capabilities
 * with specialized document and signature token support.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole, AuthState, LoginCredentials, SignUpCredentials } from '@/lib/types/auth';

// JWT Token Types
interface JWTTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface DocumentToken {
  documentToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

interface JWTUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface JWTAuthState extends AuthState {
  jwtTokens: JWTTokens | null;
  jwtUser: JWTUser | null;
  isTokenValid: boolean;
  tokenExpiry: Date | null;
  documentTokens: Map<string, DocumentToken>; // documentId -> token
  signatureTokens: Map<string, DocumentToken>; // signatureId -> token
}

interface JWTAuthContextType extends JWTAuthState {
  signIn: (credentials: LoginCredentials) => Promise<{ error: unknown }>;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: unknown }>;
  signOut: () => Promise<{ error: unknown }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: unknown }>;
  resetPassword: (email: string) => Promise<{ error: unknown }>;
  hasPermission: (permission: keyof UserProfile['permissions']) => boolean;
  isRole: (role: UserRole) => boolean;
  refreshUser: () => Promise<void>;
  getSupabaseClient: () => ReturnType<typeof createClient>;
  // JWT-specific methods
  getAccessToken: () => string | null;
  isTokenExpired: () => boolean;
  refreshJWTTokens: () => Promise<{ error: unknown }>;
  revokeAllTokens: () => Promise<{ error: unknown }>;
  // Document token methods
  createDocumentToken: (documentId: string, permissions?: string[]) => Promise<{ error: unknown; token?: DocumentToken }>;
  getDocumentToken: (documentId: string) => DocumentToken | null;
  revokeDocumentToken: (documentId: string) => Promise<{ error: unknown }>;
  // Signature token methods
  createSignatureToken: (documentId: string, signatureId: string, workflowId?: string) => Promise<{ error: unknown; token?: DocumentToken }>;
  getSignatureToken: (signatureId: string) => DocumentToken | null;
  revokeSignatureToken: (signatureId: string) => Promise<{ error: unknown }>;
}

const JWTAuthContext = createContext<JWTAuthContextType | undefined>(undefined);

export function JWTAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<JWTAuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    jwtTokens: null,
    jwtUser: null,
    isTokenValid: false,
    tokenExpiry: null,
    documentTokens: new Map(),
    signatureTokens: new Map(),
  });

  const supabase = createClient();

  // JWT Token Management
  const getStoredTokens = useCallback((): JWTTokens | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem('jwt_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error parsing stored JWT tokens:', error);
      return null;
    }
  }, []);

  const storeTokens = useCallback((tokens: JWTTokens) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('jwt_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Error storing JWT tokens:', error);
    }
  }, []);

  const clearTokens = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('jwt_tokens');
    } catch (error) {
      console.error('Error clearing JWT tokens:', error);
    }
  }, []);

  const isTokenExpired = useCallback((): boolean => {
    if (!state.tokenExpiry) return true;
    return new Date() >= state.tokenExpiry;
  }, [state.tokenExpiry]);

  const getAccessToken = useCallback((): string | null => {
    if (!state.jwtTokens || isTokenExpired()) {
      return null;
    }
    return state.jwtTokens.accessToken;
  }, [state.jwtTokens, isTokenExpired]);

  // JWT Token Refresh
  const refreshJWTTokens = useCallback(async (): Promise<{ error: unknown }> => {
    try {
      if (!state.jwtTokens?.refreshToken) {
        return { error: 'No refresh token available' };
      }

      const response = await fetch('/api/auth/token', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: state.jwtTokens.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Token refresh failed' };
      }

      const data = await response.json();
      const newTokens: JWTTokens = data.data;

      storeTokens(newTokens);
      setState(prev => ({
        ...prev,
        jwtTokens: newTokens,
        isTokenValid: true,
        tokenExpiry: new Date(Date.now() + newTokens.expiresIn * 1000),
      }));

      return { error: null };
    } catch (error) {
      console.error('JWT token refresh error:', error);
      return { error };
    }
  }, [state.jwtTokens, storeTokens]);

  // Create JWT tokens after Supabase authentication
  const createJWTTokens = useCallback(async (userId: string): Promise<{ error: unknown }> => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'JWT token creation failed' };
      }

      const data = await response.json();
      const tokens: JWTTokens = data.data;
      const user: JWTUser = data.user;

      storeTokens(tokens);
      setState(prev => ({
        ...prev,
        jwtTokens: tokens,
        jwtUser: user,
        isTokenValid: true,
        tokenExpiry: new Date(Date.now() + tokens.expiresIn * 1000),
      }));

      return { error: null };
    } catch (error) {
      console.error('JWT token creation error:', error);
      return { error };
    }
  }, [storeTokens]);

  // Revoke all tokens
  const revokeAllTokens = useCallback(async (): Promise<{ error: unknown }> => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return { error: 'No access token available' };
      }

      const response = await fetch('/api/auth/token?revoke_all=true', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Token revocation failed' };
      }

      clearTokens();
      setState(prev => ({
        ...prev,
        jwtTokens: null,
        jwtUser: null,
        isTokenValid: false,
        tokenExpiry: null,
        documentTokens: new Map(),
        signatureTokens: new Map(),
      }));

      return { error: null };
    } catch (error) {
      console.error('Token revocation error:', error);
      return { error };
    }
  }, [getAccessToken, clearTokens]);

  // Document Token Management
  const createDocumentToken = useCallback(async (
    documentId: string, 
    permissions: string[] = ['read']
  ): Promise<{ error: unknown; token?: DocumentToken }> => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return { error: 'No access token available' };
      }

      const response = await fetch(`/api/documents/${documentId}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Document token creation failed' };
      }

      const data = await response.json();
      const token: DocumentToken = data.data;

      setState(prev => ({
        ...prev,
        documentTokens: new Map(prev.documentTokens).set(documentId, token),
      }));

      return { error: null, token };
    } catch (error) {
      console.error('Document token creation error:', error);
      return { error };
    }
  }, [getAccessToken]);

  const getDocumentToken = useCallback((documentId: string): DocumentToken | null => {
    return state.documentTokens.get(documentId) || null;
  }, [state.documentTokens]);

  const revokeDocumentToken = useCallback(async (documentId: string): Promise<{ error: unknown }> => {
    try {
      const token = state.documentTokens.get(documentId);
      if (!token) {
        return { error: 'No document token found' };
      }

      const response = await fetch(`/api/documents/${documentId}/token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.documentToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Document token revocation failed' };
      }

      setState(prev => {
        const newDocumentTokens = new Map(prev.documentTokens);
        newDocumentTokens.delete(documentId);
        return {
          ...prev,
          documentTokens: newDocumentTokens,
        };
      });

      return { error: null };
    } catch (error) {
      console.error('Document token revocation error:', error);
      return { error };
    }
  }, [state.documentTokens]);

  // Signature Token Management
  const createSignatureToken = useCallback(async (
    documentId: string,
    signatureId: string,
    workflowId?: string
  ): Promise<{ error: unknown; token?: DocumentToken }> => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        return { error: 'No access token available' };
      }

      const response = await fetch(`/api/documents/${documentId}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          signatureId,
          workflowId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Signature token creation failed' };
      }

      const data = await response.json();
      const token: DocumentToken = data.data;

      setState(prev => ({
        ...prev,
        signatureTokens: new Map(prev.signatureTokens).set(signatureId, token),
      }));

      return { error: null, token };
    } catch (error) {
      console.error('Signature token creation error:', error);
      return { error };
    }
  }, [getAccessToken]);

  const getSignatureToken = useCallback((signatureId: string): DocumentToken | null => {
    return state.signatureTokens.get(signatureId) || null;
  }, [state.signatureTokens]);

  const revokeSignatureToken = useCallback(async (signatureId: string): Promise<{ error: unknown }> => {
    try {
      const token = state.signatureTokens.get(signatureId);
      if (!token) {
        return { error: 'No signature token found' };
      }

      // Extract document ID from the token (this would need to be stored or extracted)
      // For now, we'll use a placeholder approach
      const response = await fetch(`/api/documents/placeholder/token`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.documentToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || 'Signature token revocation failed' };
      }

      setState(prev => {
        const newSignatureTokens = new Map(prev.signatureTokens);
        newSignatureTokens.delete(signatureId);
        return {
          ...prev,
          signatureTokens: newSignatureTokens,
        };
      });

      return { error: null };
    } catch (error) {
      console.error('Signature token revocation error:', error);
      return { error };
    }
  }, [state.signatureTokens]);

  // Initialize JWT tokens from storage
  useEffect(() => {
    const storedTokens = getStoredTokens();
    if (storedTokens) {
      const expiry = new Date(Date.now() + storedTokens.expiresIn * 1000);
      const isValid = new Date() < expiry;

      setState(prev => ({
        ...prev,
        jwtTokens: storedTokens,
        isTokenValid: isValid,
        tokenExpiry: expiry,
      }));

      // If token is expired, try to refresh
      if (!isValid && storedTokens.refreshToken) {
        refreshJWTTokens();
      }
    }
  }, [getStoredTokens, refreshJWTTokens]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!state.tokenExpiry || !state.jwtTokens) return;

    const timeUntilExpiry = state.tokenExpiry.getTime() - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000); // 5 minutes before expiry, minimum 1 minute

    const refreshTimer = setTimeout(() => {
      refreshJWTTokens();
    }, refreshTime);

    return () => clearTimeout(refreshTimer);
  }, [state.tokenExpiry, state.jwtTokens, refreshJWTTokens]);

  // Enhanced sign in with JWT token creation
  const signIn = useCallback(async (credentials: LoginCredentials): Promise<{ error: unknown }> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError || !authData.user) {
        return { error: authError || 'Authentication failed' };
      }

      // Create JWT tokens
      const jwtResult = await createJWTTokens(authData.user.id);
      if (jwtResult.error) {
        return { error: jwtResult.error };
      }

      return { error: null };
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An error occurred' }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase, createJWTTokens]);

  // Enhanced sign out with token revocation
  const signOut = useCallback(async (): Promise<{ error: unknown }> => {
    try {
      // Revoke JWT tokens first
      await revokeAllTokens();

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
        jwtTokens: null,
        jwtUser: null,
        isTokenValid: false,
        tokenExpiry: null,
        documentTokens: new Map(),
        signatureTokens: new Map(),
      });

      return { error };
    } catch (error: unknown) {
      return { error };
    }
  }, [supabase, revokeAllTokens]);

  // Permission checking with JWT user
  const hasPermission = useCallback((permission: keyof UserProfile['permissions']): boolean => {
    return state.jwtUser?.permissions?.includes(permission) || false;
  }, [state.jwtUser]);

  const isRole = useCallback((role: UserRole): boolean => {
    return state.jwtUser?.role === role;
  }, [state.jwtUser]);

  // Other methods remain the same as original auth context
  const signUp = useCallback(async (credentials: SignUpCredentials): Promise<{ error: unknown }> => {
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
            role: credentials.role || 'user',
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
        },
      });

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An error occurred' }));
      return { error };
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [supabase]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<{ error: unknown }> => {
    try {
      if (!state.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      setState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'An error occurred' }));
      return { error };
    }
  }, [state.user, supabase]);

  const resetPassword = useCallback(async (email: string): Promise<{ error: unknown }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      return { error };
    } catch (error: unknown) {
      return { error };
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    // This would typically refresh the user profile
    // Implementation depends on your specific needs
  }, []);

  const getSupabaseClient = useCallback(() => supabase, [supabase]);

  const value: JWTAuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    hasPermission,
    isRole,
    refreshUser,
    getSupabaseClient,
    getAccessToken,
    isTokenExpired,
    refreshJWTTokens,
    revokeAllTokens,
    createDocumentToken,
    getDocumentToken,
    revokeDocumentToken,
    createSignatureToken,
    getSignatureToken,
    revokeSignatureToken,
  };

  return (
    <JWTAuthContext.Provider value={value}>
      {children}
    </JWTAuthContext.Provider>
  );
}

export function useJWTAuth() {
  const context = useContext(JWTAuthContext);
  if (context === undefined) {
    throw new Error('useJWTAuth must be used within a JWTAuthProvider');
  }
  return context;
}
