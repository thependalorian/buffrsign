/**
 * Email Preferences Form Component
 * 
 * A form component for managing _user email notification preferences.
 * Uses DaisyUI components for consistent styling.
 */

'use client';

import { useState, useEffect } from 'react';
import { useEmailPreferences } from '@/lib/hooks/useEmailPreferences';
import { EmailPreferencesFormProps } from '@/lib/types/email';

function EmailPreferencesForm({ 
  userId, 
  onSave, 
  onCancel 
}: EmailPreferencesFormProps) {
  const {
    preferences,
    loading,
    saving,
    error,
    updatePreferences,
    resetToDefaults,
    isModified,
  } = useEmailPreferences({ userId });

  const [formData, setFormData] = useState({
    receive_invitations: true,
    receive_reminders: true,
    receive_status_updates: true,
    receive_marketing: false,
    reminder_frequency: 2,
    preferred_language: 'en-NA',
    timezone: 'Africa/Windhoek',
    email_format: 'html' as 'html' | 'text',
  });

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        receive_invitations: preferences.receive_invitations,
        receive_reminders: preferences.receive_reminders,
        receive_status_updates: preferences.receive_status_updates,
        receive_marketing: preferences.receive_marketing,
        reminder_frequency: preferences.reminder_frequency,
        preferred_language: preferences.preferred_language,
        timezone: preferences.timezone,
        email_format: preferences.email_format,
      });
    }
  }, [preferences]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await updatePreferences(formData);
    if (success && onSave) {
      onSave(preferences!);
    }
  };

  const handleReset = async () => {
    const success = await resetToDefaults();
    if (success) {
      setFormData({
        receive_invitations: true,
        receive_reminders: true,
        receive_status_updates: true,
        receive_marketing: false,
        reminder_frequency: 2,
        preferred_language: 'en-NA',
        timezone: 'Africa/Windhoek',
        email_format: 'html',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6">Email Preferences</h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Types Section */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email Notifications</span>
            </label>
            <div className="space-y-3">
              <label className="label cursor-pointer">
                <span className="label-text">Document Invitations</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.receive_invitations}
                  onChange={(e) => handleInputChange('receive_invitations', e.target.checked)}
                />
              </label>
              
              <label className="label cursor-pointer">
                <span className="label-text">Signature Reminders</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.receive_reminders}
                  onChange={(e) => handleInputChange('receive_reminders', e.target.checked)}
                />
              </label>
              
              <label className="label cursor-pointer">
                <span className="label-text">Status Updates</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.receive_status_updates}
                  onChange={(e) => handleInputChange('receive_status_updates', e.target.checked)}
                />
              </label>
              
              <label className="label cursor-pointer">
                <span className="label-text">Marketing Emails</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.receive_marketing}
                  onChange={(e) => handleInputChange('receive_marketing', e.target.checked)}
                />
              </label>
            </div>
          </div>

          {/* Reminder Frequency */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Reminder Frequency (days)</span>
            </label>
            <input
              type="number"
              min="1"
              max="30"
              className="input input-bordered w-full max-w-xs"
              value={formData.reminder_frequency}
              onChange={(e) => handleInputChange('reminder_frequency', parseInt(e.target.value))}
            />
            <label className="label">
              <span className="label-text-alt">How often to send reminder emails (1-30 days)</span>
            </label>
          </div>

          {/* Language Preference */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Preferred Language</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={formData.preferred_language}
              onChange={(e) => handleInputChange('preferred_language', e.target.value)}
            >
              <option value="en-NA">English (Namibia)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="af">Afrikaans</option>
              <option value="de">German</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Timezone</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="Africa/Windhoek">Africa/Windhoek</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>

          {/* Email Format */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email Format</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="email_format"
                  className="radio radio-primary"
                  value="html"
                  checked={formData.email_format === 'html'}
                  onChange={(e) => handleInputChange('email_format', e.target.value)}
                />
                <span className="label-text ml-2">HTML</span>
              </label>
              <label className="label cursor-pointer">
                <input
                  type="radio"
                  name="email_format"
                  className="radio radio-primary"
                  value="text"
                  checked={formData.email_format === 'text'}
                  onChange={(e) => handleInputChange('email_format', e.target.value)}
                />
                <span className="label-text ml-2">Text</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="card-actions justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </button>
            
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleReset}
              disabled={saving || !isModified()}
            >
              Reset to Defaults
            </button>
            
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { EmailPreferencesForm };
export default EmailPreferencesForm;
