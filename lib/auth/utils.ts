/**
 * Authentication Utilities for BuffrSign Applications
 * 
 * This module provides utility functions for authentication,
 * validation, and security operations.
 */

import { UserProfile, UserRole, LoginCredentials, SignUpCredentials, ValidationError } from './types';
import { validationRules, securityConfig } from './config';

// ========== Validation Utilities ==========

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationError | null {
  const rules = validationRules.email;
  
  if (!email) {
    return { field: 'email', message: 'Email is required', code: 'REQUIRED' };
  }
  
  if (!rules.pattern.test(email)) {
    return { field: 'email', message: rules.message, code: 'INVALID_FORMAT' };
  }
  
  return null;
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationError | null {
  const rules = validationRules.password;
  
  if (!password) {
    return { field: 'password', message: 'Password is required', code: 'REQUIRED' };
  }
  
  if (password.length < rules.minLength) {
    return { field: 'password', message: `Password must be at least ${rules.minLength} characters`, code: 'TOO_SHORT' };
  }
  
  if (!rules.pattern.test(password)) {
    return { field: 'password', message: rules.message, code: 'INVALID_FORMAT' };
  }
  
  return null;
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): ValidationError | null {
  const rules = validationRules.phone;
  
  if (!phone) {
    return null; // Phone is optional
  }
  
  if (!rules.pattern.test(phone)) {
    return { field: 'phone', message: rules.message, code: 'INVALID_FORMAT' };
  }
  
  return null;
}

/**
 * Validates name format
 */
export function validateName(name: string, fieldName: string): ValidationError | null {
  const rules = validationRules.name;
  
  if (!name) {
    return { field: fieldName, message: `${fieldName} is required`, code: 'REQUIRED' };
  }
  
  if (name.length < rules.minLength) {
    return { field: fieldName, message: `${fieldName} must be at least ${rules.minLength} characters`, code: 'TOO_SHORT' };
  }
  
  if (name.length > rules.maxLength) {
    return { field: fieldName, message: `${fieldName} must be no more than ${rules.maxLength} characters`, code: 'TOO_LONG' };
  }
  
  if (!rules.pattern.test(name)) {
    return { field: fieldName, message: rules.message, code: 'INVALID_FORMAT' };
  }
  
  return null;
}

/**
 * Validates login credentials
 */
export function validateLoginCredentials(credentials: LoginCredentials): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(credentials.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(credentials.password);
  if (passwordError) errors.push(passwordError);
  
  return errors;
}

/**
 * Validates signup credentials
 */
export function validateSignUpCredentials(credentials: SignUpCredentials): ValidationError[] {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(credentials.email);
  if (emailError) errors.push(emailError);
  
  const passwordError = validatePassword(credentials.password);
  if (passwordError) errors.push(passwordError);
  
  const firstNameError = validateName(credentials.first_name, 'first_name');
  if (firstNameError) errors.push(firstNameError);
  
  const lastNameError = validateName(credentials.last_name, 'last_name');
  if (lastNameError) errors.push(lastNameError);
  
  if (credentials.phone) {
    const phoneError = validatePhone(credentials.phone);
    if (phoneError) errors.push(phoneError);
  }
  
  return errors;
}

// ========== Security Utilities ==========

/**
 * Generates a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  
  return result;
}

/**
 * Generates a session ID
 */
export function generateSessionId(): string {
  return generateSecureToken(16);
}

/**
 * Generates a request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${generateSecureToken(8)}`;
}

/**
 * Checks if a token is expired
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Date.now();
  const expiryTime = expiresAt * 1000; // Convert to milliseconds
  return now >= expiryTime;
}

/**
 * Calculates time until token expiry
 */
export function getTimeUntilExpiry(expiresAt: number): number {
  const now = Date.now();
  const expiryTime = expiresAt * 1000; // Convert to milliseconds
  return Math.max(0, expiryTime - now);
}

/**
 * Checks if token needs refresh
 */
export function shouldRefreshToken(expiresAt: number): boolean {
  const timeUntilExpiry = getTimeUntilExpiry(expiresAt);
  return timeUntilExpiry <= securityConfig.tokenRefreshThreshold;
}

// ========== User Utilities ==========

/**
 * Creates a full name from first and last name
 */
export function createFullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

/**
 * Formats user display name
 */
export function formatDisplayName(user: UserProfile): string {
  if (user.full_name) {
    return user.full_name;
  }
  
  return createFullName(user.first_name, user.last_name);
}

/**
 * Gets user initials
 */
export function getUserInitials(user: UserProfile): string {
  const firstName = user.first_name.charAt(0).toUpperCase();
  const lastName = user.last_name.charAt(0).toUpperCase();
  return `${firstName}${lastName}`;
}

/**
 * Checks if user has any admin permissions
 */
export function hasAnyAdminPermissions(user: UserProfile): boolean {
  return (
    user.permissions.can_manage_users ||
    user.permissions.can_manage_documents ||
    user.permissions.can_manage_signatures ||
    user.permissions.can_view_analytics ||
    user.permissions.can_manage_settings ||
    user.permissions.can_access_admin_panel ||
    user.permissions.can_manage_super_admins
  );
}

/**
 * Checks if user is active and verified
 */
export function isUserActive(user: UserProfile): boolean {
  return user.is_active && user.is_verified;
}

// ========== Role Utilities ==========

/**
 * Gets role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'Super Administrator';
    case 'admin':
      return 'Administrator';
    case 'user':
    default:
      return 'User';
  }
}

/**
 * Gets role color for UI
 */
export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'super_admin':
      return 'text-red-600 bg-red-100';
    case 'admin':
      return 'text-blue-600 bg-blue-100';
    case 'user':
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Checks if role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === 'super_admin') {
    return true; // Super admin can manage everyone
  }
  
  if (managerRole === 'admin') {
    return targetRole === 'user'; // Admin can only manage users
  }
  
  return false; // Users cannot manage anyone
}

// ========== Permission Utilities ==========

/**
 * Checks if user has specific permission
 */
export function hasPermission(user: UserProfile, permission: keyof UserProfile['permissions']): boolean {
  return user.permissions[permission] || false;
}

/**
 * Checks if user has any of the specified permissions
 */
export function hasAnyPermission(user: UserProfile, permissions: (keyof UserProfile['permissions'])[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Checks if user has all of the specified permissions
 */
export function hasAllPermissions(user: UserProfile, permissions: (keyof UserProfile['permissions'])[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

// ========== Error Utilities ==========

/**
 * Formats validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
}

/**
 * Creates a user-friendly error message
 */
export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

// ========== Date Utilities ==========

/**
 * Formats date for display
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formats datetime for display
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Gets relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateObj);
}
