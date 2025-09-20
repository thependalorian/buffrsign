/**
 * useEmailPreferences Hook
 * 
 * React hook for managing _user email preferences in BuffrSign.
 * Provides functionality to get, update, and manage email notification settings.
 */

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  UserEmailPreferences,
  EmailPreferencesRequest,
  UseEmailPreferencesOptions,
  DEFAULT_EMAIL_PREFERENCES,
} from '@/lib/types/email';

export function useEmailPreferences(options: UseEmailPreferencesOptions = {}) {
  const [_preferences, setPreferences] = useState<UserEmailPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const _supabase = createClient();

  /**
   * Fetch _user email preferences
   */
  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const userId = options.userId;
      
      if (!userId) {
        // Get current user
        const { data: { _user } } = await supabase.auth.getUser();
        if (!_user) {
          throw new Error('User not authenticated');
        }
        userId = _user.id;
      }

      const { data, error: fetchError } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no preferences found, create default ones
      if (!data) {
        const defaultPreferences: UserEmailPreferences = {
          id: '',
          user_id: userId,
          ...DEFAULT_EMAIL_PREFERENCES,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newPreferences, error: createError } = await supabase
          .from('user_email_preferences')
          .insert(defaultPreferences)
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setPreferences(newPreferences);
      } else {
        setPreferences(data);
      }
    } catch (err: unknown) {
      setError(err.message || 'Failed to fetch email preferences');
    } finally {
      setLoading(false);
    }
  }, [options.userId, supabase]);

  /**
   * Update email preferences
   */
  const updatePreferences = useCallback(async (
    updates: EmailPreferencesRequest
  ): Promise<boolean> => {
    if (!preferences) {
      setError('No preferences to update');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('user_email_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', preferences.user_id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setPreferences(data);
      return true;
    } catch (err: unknown) {
      setError(err.message || 'Failed to update email preferences');
      return false;
    } finally {
      setSaving(false);
    }
  }, [preferences, supabase]);

  /**
   * Reset preferences to defaults
   */
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    if (!preferences) {
      setError('No preferences to reset');
      return false;
    }

    setSaving(true);
    setError(null);

    try {
      const defaultUpdates: EmailPreferencesRequest = {
        receive_invitations: DEFAULT_EMAIL_PREFERENCES.receive_invitations,
        receive_reminders: DEFAULT_EMAIL_PREFERENCES.receive_reminders,
        receive_status_updates: DEFAULT_EMAIL_PREFERENCES.receive_status_updates,
        receive_marketing: DEFAULT_EMAIL_PREFERENCES.receive_marketing,
        reminder_frequency: DEFAULT_EMAIL_PREFERENCES.reminder_frequency,
        preferred_language: DEFAULT_EMAIL_PREFERENCES.preferred_language,
        timezone: DEFAULT_EMAIL_PREFERENCES.timezone,
        email_format: DEFAULT_EMAIL_PREFERENCES.email_format,
      };

      return await updatePreferences(defaultUpdates);
    } catch (err: unknown) {
      setError(err.message || 'Failed to reset preferences');
      return false;
    } finally {
      setSaving(false);
    }
  }, [preferences, updatePreferences]);

  /**
   * Toggle specific preference
   */
  const togglePreference = useCallback(async (
    key: keyof EmailPreferencesRequest,
    value?: boolean
  ): Promise<boolean> => {
    if (!preferences) {
      setError('No preferences to update');
      return false;
    }

    const currentValue = preferences[key as keyof UserEmailPreferences];
    const newValue = value !== undefined ? value : !currentValue;

    return await updatePreferences({ [key]: newValue } as EmailPreferencesRequest);
  }, [preferences, updatePreferences]);

  /**
   * Update reminder frequency
   */
  const updateReminderFrequency = useCallback(async (frequency: number): Promise<boolean> => {
    if (frequency < 1) {
      setError('Reminder frequency must be at least 1 day');
      return false;
    }

    return await updatePreferences({ reminder_frequency: frequency });
  }, [updatePreferences]);

  /**
   * Update timezone
   */
  const updateTimezone = useCallback(async (timezone: string): Promise<boolean> => {
    return await updatePreferences({ timezone });
  }, [updatePreferences]);

  /**
   * Update preferred language
   */
  const updateLanguage = useCallback(async (language: string): Promise<boolean> => {
    return await updatePreferences({ preferred_language: language });
  }, [updatePreferences]);

  /**
   * Update email format
   */
  const updateEmailFormat = useCallback(async (format: 'html' | 'text'): Promise<boolean> => {
    return await updatePreferences({ email_format: format });
  }, [updatePreferences]);

  /**
   * Check if _user receives specific email type
   */
  const canReceiveEmailType = useCallback((_emailType: string): boolean => {
    if (!preferences) return true; // Default to true if no preferences

    switch (_emailType) {
      case 'document_invitation':
        return preferences.receive_invitations;
      case 'signature_reminder':
        return preferences.receive_reminders;
      case 'document_signed':
      case 'document_completed':
      case 'document_expired':
      case 'document_rejected':
      case 'document_viewed':
        return preferences.receive_status_updates;
      case 'welcome_email':
      case 'password_reset':
        return true; // Always allow system emails
      default:
        return preferences.receive_marketing;
    }
  }, [preferences]);

  /**
   * Get preference value
   */
  const getPreference = useCallback((key: keyof UserEmailPreferences): unknown => {
    return preferences?.[key];
  }, [preferences]);

  /**
   * Check if preferences are loaded
   */
  const isLoaded = useCallback((): boolean => {
    return preferences !== null;
  }, [preferences]);

  /**
   * Check if preferences have been modified from defaults
   */
  const isModified = useCallback((): boolean => {
    if (!preferences) return false;

    return (
      preferences.receive_invitations !== DEFAULT_EMAIL_PREFERENCES.receive_invitations ||
      preferences.receive_reminders !== DEFAULT_EMAIL_PREFERENCES.receive_reminders ||
      preferences.receive_status_updates !== DEFAULT_EMAIL_PREFERENCES.receive_status_updates ||
      preferences.receive_marketing !== DEFAULT_EMAIL_PREFERENCES.receive_marketing ||
      preferences.reminder_frequency !== DEFAULT_EMAIL_PREFERENCES.reminder_frequency ||
      preferences.preferred_language !== DEFAULT_EMAIL_PREFERENCES.preferred_language ||
      preferences.timezone !== DEFAULT_EMAIL_PREFERENCES.timezone ||
      preferences.email_format !== DEFAULT_EMAIL_PREFERENCES.email_format
    );
  }, [preferences]);

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    // Data
    preferences,
    loading,
    saving,
    error,

    // Actions
    fetchPreferences,
    updatePreferences,
    resetToDefaults,
    togglePreference,
    updateReminderFrequency,
    updateTimezone,
    updateLanguage,
    updateEmailFormat,

    // Utilities
    canReceiveEmailType,
    getPreference,
    isLoaded,
    isModified,

    // Computed values
    hasPreferences: preferences !== null,
    isDefault: !isModified(),
  };
}
