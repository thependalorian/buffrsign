/**
 * BuffrSign Email System Usage Examples
 * Comprehensive examples showing how to use the email notification system
 */

import React, { useState, useEffect } from 'react';
import { EmailService } from '@/lib/services/email';
import { useEmailNotifications } from '@/lib/hooks/useEmailNotifications';
import { useEmailPreferences } from '@/lib/hooks/useEmailPreferences';
import { useEmailAnalytics } from '@/lib/hooks/useEmailAnalytics';
import { EmailPreferencesForm } from '@/components/email/EmailPreferencesForm';
import { EmailAnalyticsChart } from '@/components/email/EmailAnalyticsChart';
import { EmailNotificationList } from '@/components/email/EmailNotificationList';
import { EmailTemplateEditor } from '@/components/email/EmailTemplateEditor';

// Example 1: Basic Email Service Usage
export const BasicEmailServiceExample: React.FC = () => {
  const [emailService] = useState(() => new EmailService());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const sendDocumentInvitation = async () => {
    setLoading(true);
    try {
      const response = await emailService.sendDocumentInvitation({
        documentId: 'doc-123',
        recipientEmail: 'user@example.com',
        recipientName: 'John Doe',
        documentTitle: 'Contract Agreement',
        senderName: 'Jane Smith',
        expiresAt: new Date('2024-12-31'),
        customMessage: 'Please review and sign this contract by the end of the week.'
      });
      
      setResult(`Email sent successfully! Message ID: ${response.messageId}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendSignatureReminder = async () => {
    setLoading(true);
    try {
      const response = await emailService.sendSignatureReminder({
        documentId: 'doc-123',
        recipientEmail: 'user@example.com',
        recipientName: 'John Doe',
        documentTitle: 'Contract Agreement',
        daysRemaining: 3
      });
      
      setResult(`Reminder sent successfully! Message ID: ${response.messageId}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendCompletionNotification = async () => {
    setLoading(true);
    try {
      const response = await emailService.sendDocumentCompleted({
        documentId: 'doc-123',
        recipientEmail: 'user@example.com',
        recipientName: 'John Doe',
        documentTitle: 'Contract Agreement',
        completedAt: new Date()
      });
      
      setResult(`Completion notification sent! Message ID: ${response.messageId}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Basic Email Service Usage</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={sendDocumentInvitation}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Sending...' : 'Send Document Invitation'}
        </button>
        
        <button
          onClick={sendSignatureReminder}
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading ? 'Sending...' : 'Send Signature Reminder'}
        </button>
        
        <button
          onClick={sendCompletionNotification}
          disabled={loading}
          className="btn btn-accent"
        >
          {loading ? 'Sending...' : 'Send Completion Notification'}
        </button>
      </div>
      
      {result && (
        <div className="alert alert-info">
          <span>{result}</span>
        </div>
      )}
    </div>
  );
};

// Example 2: Using Email Notifications Hook
export const EmailNotificationsHookExample: React.FC<{ documentId: string }> = ({ documentId }) => {
  const {
    notifications,
    analytics,
    sendInvitation,
    sendReminder,
    loading,
    error
  } = useEmailNotifications(documentId);

  const [invitationData, setInvitationData] = useState({
    recipientEmail: '',
    recipientName: '',
    customMessage: ''
  });

  const [reminderData, setReminderData] = useState({
    recipientEmail: '',
    recipientName: ''
  });

  const handleSendInvitation = async () => {
    if (!invitationData.recipientEmail || !invitationData.recipientName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await sendInvitation({
        recipientEmail: invitationData.recipientEmail,
        recipientName: invitationData.recipientName,
        customMessage: invitationData.customMessage
      });
      
      // Reset form
      setInvitationData({
        recipientEmail: '',
        recipientName: '',
        customMessage: ''
      });
      
      alert('Invitation sent successfully!');
    } catch (error) {
      alert(`Failed to send invitation: ${error.message}`);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderData.recipientEmail || !reminderData.recipientName) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await sendReminder({
        recipientEmail: reminderData.recipientEmail,
        recipientName: reminderData.recipientName
      });
      
      // Reset form
      setReminderData({
        recipientEmail: '',
        recipientName: ''
      });
      
      alert('Reminder sent successfully!');
    } catch (error) {
      alert(`Failed to send reminder: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Notifications for Document {documentId}</h1>
      
      {/* Analytics Summary */}
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-title">Total Sent</div>
          <div className="stat-value">{analytics.totalSent}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Delivered</div>
          <div className="stat-value text-success">{analytics.delivered}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Opened</div>
          <div className="stat-value text-info">{analytics.opened}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Bounced</div>
          <div className="stat-value text-error">{analytics.bounced}</div>
        </div>
      </div>

      {/* Send Invitation Form */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Send Document Invitation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={invitationData.recipientEmail}
                onChange={(e) => setInvitationData(prev => ({
                  ...prev,
                  recipientEmail: e.target.value
                }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={invitationData.recipientName}
                onChange={(e) => setInvitationData(prev => ({
                  ...prev,
                  recipientName: e.target.value
                }))}
                placeholder="John Doe"
              />
            </div>
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text">Custom Message (Optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={invitationData.customMessage}
                onChange={(e) => setInvitationData(prev => ({
                  ...prev,
                  customMessage: e.target.value
                }))}
                placeholder="Please review and sign this document..."
              />
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={handleSendInvitation}
              className="btn btn-primary"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>

      {/* Send Reminder Form */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Send Signature Reminder</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered"
                value={reminderData.recipientEmail}
                onChange={(e) => setReminderData(prev => ({
                  ...prev,
                  recipientEmail: e.target.value
                }))}
                placeholder="user@example.com"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Recipient Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={reminderData.recipientName}
                onChange={(e) => setReminderData(prev => ({
                  ...prev,
                  recipientName: e.target.value
                }))}
                placeholder="John Doe"
              />
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={handleSendReminder}
              className="btn btn-secondary"
            >
              Send Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Notifications</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id}>
                    <td>
                      <div>
                        <div className="font-bold">{notification.recipient_name}</div>
                        <div className="text-sm opacity-50">{notification.recipient_email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {notification.template_type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        notification.status === 'delivered' ? 'badge-success' :
                        notification.status === 'bounced' ? 'badge-error' :
                        notification.status === 'opened' ? 'badge-info' :
                        'badge-warning'
                      }`}>
                        {notification.status}
                      </span>
                    </td>
                    <td>
                      {new Date(notification.sent_at).toLocaleString()}
                    </td>
                    <td>
                      {notification.status === 'failed' && (
                        <button className="btn btn-xs btn-outline">
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 3: Email Preferences Management
export const EmailPreferencesExample: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    loading,
    error
  } = useEmailPreferences();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updatePreferences(localPreferences);
      alert('Preferences saved successfully!');
    } catch (error) {
      alert(`Failed to save preferences: ${error.message}`);
    }
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Preferences</h1>
      
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Notification Settings</h2>
          
          <div className="space-y-4">
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Receive Document Invitations</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={localPreferences.receive_invitations}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    receive_invitations: e.target.checked
                  }))}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Receive Signature Reminders</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={localPreferences.receive_reminders}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    receive_reminders: e.target.checked
                  }))}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Receive Status Updates</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={localPreferences.receive_status_updates}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    receive_status_updates: e.target.checked
                  }))}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Receive Marketing Emails</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={localPreferences.receive_marketing}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    receive_marketing: e.target.checked
                  }))}
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Reminder Frequency</span>
              </label>
              <select
                className="select select-bordered"
                value={localPreferences.reminder_frequency}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  reminder_frequency: parseInt(e.target.value)
                }))}
              >
                <option value={1}>Daily</option>
                <option value={2}>Every 2 days</option>
                <option value={3}>Every 3 days</option>
                <option value={7}>Weekly</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Preferred Language</span>
              </label>
              <select
                className="select select-bordered"
                value={localPreferences.preferred_language}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  preferred_language: e.target.value
                }))}
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email Format</span>
              </label>
              <select
                className="select select-bordered"
                value={localPreferences.email_format}
                onChange={(e) => setLocalPreferences(prev => ({
                  ...prev,
                  email_format: e.target.value as 'html' | 'text'
                }))}
              >
                <option value="html">HTML</option>
                <option value="text">Plain Text</option>
              </select>
            </div>
          </div>

          <div className="card-actions justify-end mt-6">
            <button
              onClick={handleReset}
              className="btn btn-outline"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 4: Email Analytics Dashboard
export const EmailAnalyticsExample: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const {
    analytics,
    loading,
    error,
    refetch
  } = useEmailAnalytics({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate
  });

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Analytics Dashboard</h1>
      
      {/* Date Range Selector */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Date Range</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
              />
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={() => refetch()}
              className="btn btn-primary"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="stats shadow mb-6">
        <div className="stat">
          <div className="stat-title">Total Sent</div>
          <div className="stat-value">{analytics.totalSent}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Delivered</div>
          <div className="stat-value text-success">{analytics.delivered}</div>
          <div className="stat-desc">{analytics.deliveryRate.toFixed(1)}% delivery rate</div>
        </div>
        <div className="stat">
          <div className="stat-title">Opened</div>
          <div className="stat-value text-info">{analytics.opened}</div>
          <div className="stat-desc">{analytics.openRate.toFixed(1)}% open rate</div>
        </div>
        <div className="stat">
          <div className="stat-title">Clicked</div>
          <div className="stat-value text-warning">{analytics.clicked}</div>
          <div className="stat-desc">{analytics.clickRate.toFixed(1)}% click rate</div>
        </div>
        <div className="stat">
          <div className="stat-title">Bounced</div>
          <div className="stat-value text-error">{analytics.bounced}</div>
          <div className="stat-desc">{analytics.bounceRate.toFixed(1)}% bounce rate</div>
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Email Performance Over Time</h2>
          <EmailAnalyticsChart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
          />
        </div>
      </div>

      {/* Template Breakdown */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Performance by Template Type</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Template Type</th>
                  <th>Sent</th>
                  <th>Delivered</th>
                  <th>Opened</th>
                  <th>Clicked</th>
                  <th>Open Rate</th>
                  <th>Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.breakdown.byTemplate).map(([type, data]) => (
                  <tr key={type}>
                    <td>
                      <span className="badge badge-outline">
                        {type.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{data.sent}</td>
                    <td>{data.delivered}</td>
                    <td>{data.opened}</td>
                    <td>{data.clicked}</td>
                    <td>
                      <span className={`badge ${
                        (data.opened / data.sent) > 0.8 ? 'badge-success' :
                        (data.opened / data.sent) > 0.6 ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {((data.opened / data.sent) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        (data.clicked / data.sent) > 0.3 ? 'badge-success' :
                        (data.clicked / data.sent) > 0.2 ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {((data.clicked / data.sent) * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 5: Template Management
export const TemplateManagementExample: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState({
    recipient_name: 'John Doe',
    document_title: 'Sample Contract',
    sender_name: 'Jane Smith',
    expires_at: '2024-12-31',
    custom_message: 'Please review and sign this document.'
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Template Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Editor */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Template Editor</h2>
            <EmailTemplateEditor
              templateId={selectedTemplate}
              onSave={(template) => {
                console.log('Template saved:', template);
                setSelectedTemplate(template.id);
              }}
              onDelete={(templateId) => {
                console.log('Template deleted:', templateId);
                setSelectedTemplate(null);
              }}
            />
          </div>
        </div>

        {/* Template Preview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Template Preview</h2>
            
            <div className="space-y-4 mb-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Recipient Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={previewData.recipient_name}
                  onChange={(e) => setPreviewData(prev => ({
                    ...prev,
                    recipient_name: e.target.value
                  }))}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Document Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={previewData.document_title}
                  onChange={(e) => setPreviewData(prev => ({
                    ...prev,
                    document_title: e.target.value
                  }))}
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Sender Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={previewData.sender_name}
                  onChange={(e) => setPreviewData(prev => ({
                    ...prev,
                    sender_name: e.target.value
                  }))}
                />
              </div>
            </div>

            <div className="mockup-browser border bg-base-300">
              <div className="mockup-browser-toolbar">
                <div className="input">https://example.com/email-preview</div>
              </div>
              <div className="px-4 py-16 bg-base-200">
                <div className="prose max-w-none">
                  <h3>Email Preview</h3>
                  <p>Subject: You have been invited to sign: {previewData.document_title}</p>
                  <div className="border p-4 bg-white rounded">
                    <h4>Hello {previewData.recipient_name}!</h4>
                    <p>You have been invited to review and sign: <strong>{previewData.document_title}</strong></p>
                    <p>From: {previewData.sender_name}</p>
                    <p>Expires: {previewData.expires_at}</p>
                    {previewData.custom_message && (
                      <p><em>Message: {previewData.custom_message}</em></p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 6: Complete Email Management Dashboard
export const EmailManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences' | 'analytics' | 'templates'>('notifications');
  const [selectedDocumentId, setSelectedDocumentId] = useState('doc-123');

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Email Management Dashboard</h1>
      
      {/* Document Selector */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Select Document</span>
            </label>
            <select
              className="select select-bordered"
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
            >
              <option value="doc-123">Contract Agreement (doc-123)</option>
              <option value="doc-456">NDA Document (doc-456)</option>
              <option value="doc-789">Service Agreement (doc-789)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'notifications' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab ${activeTab === 'preferences' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'notifications' && (
          <EmailNotificationList documentId={selectedDocumentId} />
        )}
        {activeTab === 'preferences' && (
          <EmailPreferencesExample />
        )}
        {activeTab === 'analytics' && (
          <EmailAnalyticsExample />
        )}
        {activeTab === 'templates' && (
          <TemplateManagementExample />
        )}
      </div>
    </div>
  );
};

// Export all examples
export default {
  BasicEmailServiceExample,
  EmailNotificationsHookExample,
  EmailPreferencesExample,
  EmailAnalyticsExample,
  TemplateManagementExample,
  EmailManagementDashboard
};
