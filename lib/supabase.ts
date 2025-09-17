// BuffrSign Platform - Supabase Client Configuration
// Provides typed Supabase client with authentication and real-time capabilities

import { createClient, Session } from '@supabase/supabase-js';
import { Database } from './database.types';

// ============================================================================
// SUPABASE CLIENT CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with database types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  first_name?: string;
  last_name?: string;
  company?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  session: Session | null;
  error?: string;
}

/**
 * Sign in user with email and password
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user && data.session) {
      // Get additional user profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: profile?.role || 'user',
        plan: 'free', // Will be updated when subscription system is implemented
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        company: profile?.company_name || undefined,
      };

      return { user, session: data.session };
    }

    return { user: null, session: null };
  } catch {
    return { user: null, session: null, error: 'Authentication failed' };
  }
}

/**
 * Sign up new user
 */
export async function signUp(
  email: string,
  password: string,
  userData: {
    first_name: string;
    last_name: string;
    company?: string;
  }
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          company: userData.company,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    if (data.user && data.session) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name} ${userData.last_name}`,
          company_name: userData.company,
          role: 'user',
          is_active: true,
          is_verified: false,
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        role: 'user',
        plan: 'free',
        first_name: userData.first_name,
        last_name: userData.last_name,
        company: userData.company,
      };

      return { user, session: data.session };
    }

    return { user: null, session: null };
  } catch {
    return { user: null, session: null, error: 'Registration failed' };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error?.message };
  } catch {
    return { error: 'Sign out failed' };
  }
}

/**
 * Get current user session
 */
export async function getCurrentSession(): Promise<AuthResponse> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { user: null, session: null };
    }

    // Get user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email!,
        role: profile.role || 'user',
        plan: 'free', // Will be updated when subscription system is implemented
        first_name: profile.first_name,
        last_name: profile.last_name,
        company: profile.company_name || undefined,
      };

      return { user, session };
    }

    return { user: null, session: null };
  } catch {
    return { user: null, session: null, error: 'Failed to get session' };
  }
}

/**
 * Refresh user session
 */
export async function refreshSession(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error || !data.session) {
      return { user: null, session: null, error: error?.message };
    }

    // Get updated user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (profile) {
      const user: AuthUser = {
        id: data.session.user.id,
        email: data.session.user.email!,
        role: profile.role || 'user',
        plan: 'free', // Will be updated when subscription system is implemented
        first_name: profile.first_name,
        last_name: profile.last_name,
        company: profile.company_name || undefined,
      };

      return { user, session: data.session };
    }

    return { user: null, session: null };
  } catch {
    return { user: null, session: null, error: 'Session refresh failed' };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<{
    first_name: string;
    last_name: string;
    company_name: string;
    phone: string;
    avatar_url: string;
    language: string;
    timezone: string;
    theme: string;
    email_notifications: boolean;
    sms_notifications: boolean;
    two_factor_enabled: boolean;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Profile update failed' };
  }
}

/**
 * Reset user password
 */
export async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Password reset failed' };
  }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return { success: false, error: 'Password update failed' };
  }
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to user profile changes
 */
export function subscribeToProfileChanges(
  userId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to document changes
 */
export function subscribeToDocumentChanges(
  userId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`documents:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'documents',
        filter: `created_by=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to workflow changes
 */
export function subscribeToWorkflowChanges(
  workflowId: string,
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`workflow:${workflowId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'signature_workflows',
        filter: `id=eq.${workflowId}`,
      },
      callback
    )
    .subscribe();
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  supabase as default,
};
