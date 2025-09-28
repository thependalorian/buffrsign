/**
 * Authentication Configuration for BuffrSign
 * 
 * This module provides centralized configuration for authentication,
 * security, and user management for the BuffrSign application.
 */

import { AuthConfig, UserPermissions, UserPreferences } from './types';

// ========== Environment Configuration ==========

export const getAuthConfig = (): AuthConfig => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase configuration. Please check your environment variables.');
  }

  return {
    // ========== Application Identity ==========
    appName: 'BuffrSign',
    appVersion: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    
    // ========== Supabase Configuration ==========
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    adminDomain: '@buffr.ai',
    superAdminEmails: [
      'admin@buffr.ai',
      'superadmin@buffr.ai',
      'ceo@buffr.ai',
      'cto@buffr.ai',
      'founder@buffr.ai',
      'julius@buffr.ai',
      'george@buffr.ai'
    ],
    defaultPermissions: getDefaultPermissions(),
    defaultPreferences: getDefaultPreferences()
  };
};

// ========== Default Permissions ==========

export const getDefaultPermissions = (): UserPermissions => {
  return {
    can_view_dashboard: true,
    can_manage_users: false,
    can_manage_documents: true,  // BuffrSign users can manage documents
    can_manage_signatures: true, // BuffrSign users can manage signatures
    can_manage_compliance: false,
    can_view_analytics: false,
    can_manage_settings: false,
    can_access_admin_panel: false,
    can_manage_super_admins: false,
    can_manage_kyc: false,
    can_manage_templates: false
  };
};

export const getAdminPermissions = (): UserPermissions => {
  return {
    can_view_dashboard: true,
    can_manage_users: true,
    can_manage_documents: true,
    can_manage_signatures: true,
    can_manage_compliance: true,
    can_view_analytics: true,
    can_manage_settings: true,
    can_access_admin_panel: true,
    can_manage_super_admins: false,
    can_manage_kyc: true,
    can_manage_templates: true
  };
};

export const getSuperAdminPermissions = (): UserPermissions => {
  return {
    can_view_dashboard: true,
    can_manage_users: true,
    can_manage_documents: true,
    can_manage_signatures: true,
    can_manage_compliance: true,
    can_view_analytics: true,
    can_manage_settings: true,
    can_access_admin_panel: true,
    can_manage_super_admins: true,
    can_manage_kyc: true,
    can_manage_templates: true
  };
};

// ========== Default Preferences ==========

export const getDefaultPreferences = (): UserPreferences => {
  return {
    email_notifications: true,
    sms_notifications: true,
    two_factor_enabled: false,
    language: 'en',
    timezone: 'Africa/Windhoek',
    theme: 'system'
  };
};

// ========== Role-Based Configuration ==========

export const getRolePermissions = (role: string): UserPermissions => {
  switch (role) {
    case 'super_admin':
      return getSuperAdminPermissions();
    case 'admin':
      return getAdminPermissions();
    case 'user':
    default:
      return getDefaultPermissions();
  }
};

export const getRolePreferences = (role: string): UserPreferences => {
  const basePreferences = getDefaultPreferences();
  
  // Super admins and admins get enhanced security by default
  if (role === 'super_admin' || role === 'admin') {
    return {
      ...basePreferences,
      two_factor_enabled: true,
      email_notifications: true,
      sms_notifications: true
    };
  }
  
  return basePreferences;
};

// ========== Validation Rules ==========

export const getValidationRules = () => {
  return {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    phone: {
      pattern: /^\+[1-9]\d{1,14}$/,
      message: 'Please enter a valid phone number with country code'
    },
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
    }
  };
};

// ========== Security Configuration ==========

export const getSecurityConfig = () => {
  return {
    tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    passwordResetExpiry: 60 * 60 * 1000, // 1 hour in milliseconds
    twoFactorCodeExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes in milliseconds
    rateLimitMax: 100 // requests per window
  };
};

// ========== Feature Flags ==========

export const getFeatureFlags = () => {
  return {
    enableGoogleAuth: true,
    enableWhatsAppAuth: true,
    enableTwoFactor: true,
    enableAdminPanel: true,
    enableUserManagement: true,
    enableAuditLogging: true,
    enableRateLimiting: true,
    enableSessionManagement: true
  };
};

// ========== Localization ==========

export const getLocalizationConfig = () => {
  return {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'af', 'de', 'pt'],
    defaultTimezone: 'Africa/Windhoek',
    supportedTimezones: [
      'Africa/Windhoek',
      'Africa/Johannesburg',
      'Africa/Lagos',
      'UTC'
    ]
  };
};

// ========== Export Configuration ==========

export const authConfig = getAuthConfig();
export const securityConfig = getSecurityConfig();
export const featureFlags = getFeatureFlags();
export const localizationConfig = getLocalizationConfig();
export const validationRules = getValidationRules();
