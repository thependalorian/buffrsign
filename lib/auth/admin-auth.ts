/**
 * Admin Authentication Utilities for BuffrSign Applications
 * 
 * This module provides utilities for handling admin authentication
 * with @buffr.ai email domain validation and enhanced security.
 */

import { createClient } from '@/lib/supabase/client';
import { UserProfile, UserRole, AdminAuthResult } from './types';
import { authConfig, getRolePermissions } from './config';

// Re-export types from the main types file
export type { AdminUser, AdminAuthResult } from './types';

/**
 * Validates if an email belongs to the @buffr.ai domain
 */
export function isBuffrEmail(email: string): boolean {
  return email.toLowerCase().endsWith(authConfig.adminDomain);
}

/**
 * Determines admin level based on email domain and role
 */
export function getAdminLevel(email: string, role: UserRole): 'admin' | 'super_admin' | null {
  if (!isBuffrEmail(email)) {
    return null;
  }

  // Super admins have specific email patterns or explicit super_admin role
  if (authConfig.superAdminEmails.includes(email.toLowerCase()) || role === 'super_admin') {
    return 'super_admin';
  }

  return 'admin';
}

/**
 * Checks if a user is an admin based on email domain and role
 */
export function isAdminUser(email: string, role: UserRole): boolean {
  return isBuffrEmail(email) || role === 'admin' || role === 'super_admin';
}

/**
 * Validates admin access for a user profile
 */
export function validateAdminAccess(user: UserProfile): AdminAuthResult {
  const is_admin = isAdminUser(user.email, user.role);
  const admin_level = getAdminLevel(user.email, user.role);
  const buffr_email = isBuffrEmail(user.email);

  if (is_admin && !admin_level) {
    return {
      is_admin: false,
      error: 'Invalid admin configuration'
    };
  }

  return {
    is_admin,
    admin_level: admin_level || undefined,
    user: is_admin ? {
      ...user,
      is_admin: true,
      admin_level: admin_level!,
      buffr_email
    } : undefined
  };
}

/**
 * Creates an admin user with proper permissions
 */
export function createAdminUserProfile(
  email: string,
  first_name: string,
  last_name: string,
  role: UserRole = 'admin'
): Partial<UserProfile> {
  const admin_level = getAdminLevel(email, role);
  
  if (!admin_level) {
    throw new Error('Invalid admin email domain');
  }

  const permissions = getRolePermissions(role);

  return {
    email,
    first_name,
    last_name,
    role,
    is_verified: true,
    is_active: true,
    permissions,
    preferences: {
      email_notifications: true,
      sms_notifications: true,
      two_factor_enabled: true,
      language: 'en',
      timezone: 'Africa/Windhoek',
      theme: 'system'
    }
  };
}

/**
 * Middleware function to check admin access
 */
export async function requireAdminAccess(userId: string): Promise<AdminAuthResult> {
  try {
    const supabase = createClient();
    
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return {
        is_admin: false,
        error: 'User not found'
      };
    }

    return validateAdminAccess(user);
  } catch (error) {
    return {
      is_admin: false,
      error: 'Failed to validate admin access'
    };
  }
}

/**
 * Hook for admin authentication in React components
 */
export function useAdminAuth(user: UserProfile | null) {
  if (!user) {
    return {
      is_admin: false,
      admin_level: undefined,
      buffr_email: false,
      canManageSuperAdmins: false,
      canAccessAdminPanel: false
    };
  }

  const adminResult = validateAdminAccess(user);
  
  return {
    is_admin: adminResult.is_admin,
    admin_level: adminResult.admin_level,
    buffr_email: isBuffrEmail(user.email),
    canManageSuperAdmins: adminResult.admin_level === 'super_admin',
    canAccessAdminPanel: adminResult.is_admin && user.permissions.can_access_admin_panel
  };
}
