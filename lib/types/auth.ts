export type UserRole = 'user' | 'admin' | 'super_admin';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: UserRole;
  company_name?: string;
  phone?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  preferences: UserPreferences;
  permissions: UserPermissions;
}

export interface UserPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  two_factor_enabled: boolean;
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface UserPermissions {
  can_view_dashboard: boolean;
  can_manage_users: boolean;
  can_manage_documents: boolean;
  can_manage_compliance: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
  can_access_admin_panel: boolean;
  can_manage_super_admins: boolean;
  can_manage_kyc: boolean;
  can_manage_templates: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  session: unknown | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  phone?: string;
  role?: UserRole;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdate {
  current_password: string;
  new_password: string;
}

export interface TwoFactorSetup {
  method: 'authenticator' | 'sms' | 'email';
  secret?: string;
  backup_codes?: string[];
}

export interface TwoFactorVerification {
  method: 'authenticator' | 'sms' | 'email';
  code: string;
}
