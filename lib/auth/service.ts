/**
 * Authentication Service for BuffrSign Applications
 * 
 * This module provides the core authentication service that handles
 * all authentication operations with Supabase.
 */

import { createClient } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { 
  UserProfile, 
  UserRole, 
  LoginCredentials, 
  SignUpCredentials, 
  AuthResponse
} from './types';
import { 
  validateLoginCredentials, 
  validateSignUpCredentials,
  createErrorMessage,
  generateSessionId,
  generateRequestId
} from './utils';
import { 
  isBuffrEmail, 
  getAdminLevel, 
  validateAdminAccess,
  createAdminUserProfile 
} from './admin-auth';
import { getRolePermissions, getRolePreferences } from './config';

// ========== Authentication Service Class ==========

export class AuthenticationService {
  private supabase = createClient();
  private sessionId: string;
  private requestId: string;

  constructor() {
    this.sessionId = generateSessionId();
    this.requestId = generateRequestId();
  }

  // ========== Basic Authentication ==========

  /**
   * Signs in a user with email and password
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate credentials
      const validationErrors = validateLoginCredentials(credentials);
      if (validationErrors.length > 0) {
        return {
          user: null,
          session: null,
          error: validationErrors.map(e => e.message).join(', ')
        };
      }

      // Attempt sign in
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message
        };
      }

      // Check if user data exists
      if (!data._user || !data._user.id) {
        return {
          user: null,
          session: data.session,
          error: 'User data not found in authentication response'
        };
      }

      // Fetch user profile
      const userProfile = await this.fetchUserProfile(data._user.id);
      if (userProfile.error) {
        return {
          user: null,
          session: data.session,
          error: userProfile.error
        };
      }

      return {
        user: userProfile.user,
        session: data.session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: createErrorMessage(error)
      };
    }
  }

  /**
   * Signs up a new user
   */
  async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
    try {
      // Validate credentials
      const validationErrors = validateSignUpCredentials(credentials);
      if (validationErrors.length > 0) {
        return {
          user: null,
          session: null,
          error: validationErrors.map(e => e.message).join(', ')
        };
      }

      // Check if this is an admin email
      const isAdmin = isBuffrEmail(credentials.email);
      const role: UserRole = isAdmin ? 'admin' : (credentials.role || 'user');

      // Attempt sign up
      const { data, error } = await this.supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.first_name,
            last_name: credentials.last_name,
            company_name: credentials.company_name,
            phone: credentials.phone,
            role: role
          }
        }
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: error.message
        };
      }

      // If user was created successfully, create profile
      if (data._user) {
        const profileResult = await this.createUserProfile(data._user.id, {
          email: credentials.email,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
          company_name: credentials.company_name,
          phone: credentials.phone,
          role: role
        });

        if (profileResult.error) {
          return {
            user: null,
            session: data.session,
            error: profileResult.error
          };
        }
      }

      return {
        user: null, // User needs to confirm email
        session: data.session,
        error: null
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: createErrorMessage(error)
      };
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  /**
   * Resets password for a user
   */
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  // ========== OAuth Authentication ==========

  /**
   * Signs in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }


  // ========== User Profile Management ==========

  /**
   * Fetches user profile by ID
   */
  async fetchUserProfile(userId: string): Promise<{ user: UserProfile | null; error: string | null }> {
    try {
      const { data: profile, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: profile, error: null };
    } catch (error) {
      return { user: null, error: createErrorMessage(error) };
    }
  }

  /**
   * Updates user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  /**
   * Creates a new user profile
   */
  async createUserProfile(userId: string, userData: {
    email: string;
    first_name: string;
    last_name: string;
    company_name?: string;
    phone?: string;
    role: UserRole;
  }): Promise<{ error: string | null }> {
    try {
      const isAdmin = isBuffrEmail(userData.email);
      const permissions = getRolePermissions(userData.role);
      const preferences = getRolePreferences(userData.role);

      const profileData = {
        id: userId,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        full_name: `${userData.first_name} ${userData.last_name}`,
        role: userData.role,
        company_name: userData.company_name,
        phone: userData.phone,
        is_verified: isAdmin, // Admin emails are auto-verified
        is_active: true,
        permissions,
        preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await this.supabase
        .from('profiles')
        .insert(profileData);

      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  // ========== Admin Management ==========

  /**
   * Creates an admin user
   */
  async createAdminUser(
    email: string, 
    firstName: string, 
    lastName: string, 
    role: UserRole = 'admin'
  ): Promise<{ error: string | null }> {
    try {
      // Validate admin email
      if (!isBuffrEmail(email)) {
        return { error: 'Only @buffr.ai emails can be admin users' };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!', // Should be changed on first login
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          role: role
        }
      });

      if (authError) {
        return { error: authError.message };
      }

      // Create profile with admin permissions
      const adminProfile = createAdminUserProfile(email, firstName, lastName, role);
      
      const { error: profileError } = await this.supabase
        .from('profiles')
        .insert({
          id: authData._user.id,
          ...adminProfile
        });

      if (profileError) {
        return { error: profileError.message };
      }

      return { error: null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  /**
   * Promotes a user to admin
   */
  async promoteToAdmin(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          role: 'admin',
          permissions: getRolePermissions('admin'),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  /**
   * Demotes an admin to user
   */
  async demoteFromAdmin(userId: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({
          role: 'user',
          permissions: getRolePermissions('user'),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      return { error: error?.message || null };
    } catch (error) {
      return { error: createErrorMessage(error) };
    }
  }

  // ========== Session Management ==========

  /**
   * Gets current session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      return { session, error: error?.message || null };
    } catch (error) {
      return { session: null, error: createErrorMessage(error) };
    }
  }

  /**
   * Refreshes the current session
   */
  async refreshSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      return { session, error: error?.message || null };
    } catch (error) {
      return { session: null, error: createErrorMessage(error) };
    }
  }

  /**
   * Sets up auth state change listener
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  // ========== Utility Methods ==========

  /**
   * Gets the current user
   */
  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      return { user: data._user, error: error?.message || null };
    } catch (error) {
      return { user: null, error: createErrorMessage(error) };
    }
  }

  /**
   * Checks if user is admin
   */
  isAdminUser(user: UserProfile): boolean {
    return validateAdminAccess(user).is_admin;
  }

  /**
   * Gets admin level for user
   */
  getAdminLevel(user: UserProfile): 'admin' | 'super_admin' | null {
    return getAdminLevel(user.email, user.role);
  }
}

// ========== Export Singleton Instance ==========

export const authService = new AuthenticationService();
