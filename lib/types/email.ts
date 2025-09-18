/**
 * Email System TypeScript Types
 * 
 * This file contains all TypeScript interfaces and types for the BuffrSign email notification system.
 * Based on the comprehensive email.md documentation.
 */

// ===================================================================
// Core Email Types
// ===================================================================

export type EmailType = 
  | 'document_invitation'
  | 'signature_reminder'
  | 'document_signed'
  | 'document_completed'
  | 'document_expired'
  | 'document_rejected'
  | 'document_viewed'
  | 'welcome_email'
  | 'password_reset';

export type EmailStatus = 
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'bounced'
  | 'failed';

export type EmailProvider = 'sendgrid' | 'resend' | 'ses';

export type ReminderType = 
  | 'signature_reminder'
  | 'expiration_warning'
  | 'final_notice';

export type ReminderStatus = 
  | 'pending'
  | 'sent'
  | 'failed'
  | 'cancelled';

export type BlacklistReason = 
  | 'bounced'
  | 'complained'
  | 'unsubscribed'
  | 'invalid'
  | 'blocked';

export type QueueStatus = 
  | 'queued'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'cancelled';

export type EmailFormat = 'html' | 'text';

// ===================================================================
// Database Table Interfaces
// ===================================================================

export interface EmailNotification {
  id: string;
  document_id: string;
  recipient_id?: string;
  email_type: EmailType;
  email_address: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  status: EmailStatus;
  external_message_id?: string;
  provider: EmailProvider;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  template_type: EmailType;
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: string[];
  branding_options: Record<string, any>;
  locale: string;
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserEmailPreferences {
  id: string;
  user_id: string;
  receive_invitations: boolean;
  receive_reminders: boolean;
  receive_status_updates: boolean;
  receive_marketing: boolean;
  reminder_frequency: number;
  preferred_language: string;
  timezone: string;
  email_format: EmailFormat;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReminder {
  id: string;
  document_id: string;
  recipient_id?: string;
  reminder_type: ReminderType;
  scheduled_for: string;
  status: ReminderStatus;
  attempts: number;
  last_attempt_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalytics {
  id: string;
  date: string;
  email_type: EmailType;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  created_at: string;
  updated_at: string;
}

export interface EmailBlacklist {
  id: string;
  email_address: string;
  reason: BlacklistReason;
  blacklisted_at: string;
  blacklisted_by?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailQueue {
  id: string;
  priority: number;
  email_data: EmailQueueData;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  status: QueueStatus;
  error_message?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailQueueData {
  to: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  email_type: EmailType;
  document_id?: string;
  recipient_id?: string;
  provider?: EmailProvider;
  metadata?: Record<string, any>;
}

export interface EmailSystemConfig {
  id: string;
  config_key: string;
  config_value: Record<string, any>;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===================================================================
// View Interfaces
// ===================================================================

export interface EmailNotificationStats {
  document_id: string;
  email_type: EmailType;
  total_sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

export interface RecentEmailActivity {
  id: string;
  document_id: string;
  recipient_id?: string;
  email_type: EmailType;
  email_address: string;
  subject: string;
  html_content?: string;
  text_content?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  status: EmailStatus;
  external_message_id?: string;
  provider: EmailProvider;
  error_message?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
  document_title: string;
  sender_name: string;
}

export interface EmailPerformanceSummary {
  month: string;
  email_type: EmailType;
  total_emails: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  avg_delivery_rate: number;
  avg_open_rate: number;
}

// ===================================================================
// Service Interfaces
// ===================================================================

export interface EmailProviderConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  webhookSecret?: string;
}

export interface SendGridConfig extends EmailProviderConfig {
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export interface ResendConfig extends EmailProviderConfig {
  domain?: string;
}

export interface SESConfig extends EmailProviderConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: EmailProvider;
}

export interface EmailWebhookEvent {
  event: string;
  timestamp: number;
  messageId: string;
  email: string;
  reason?: string;
  url?: string;
  userAgent?: string;
  ip?: string;
}

// ===================================================================
// Template Engine Types
// ===================================================================

export interface TemplateVariable {
  name: string;
  value: string | number | boolean;
  type: 'string' | 'number' | 'boolean' | 'date';
}

export interface TemplateContext {
  document?: {
    id: string;
    title: string;
    status: string;
    created_at: string;
    expires_at?: string;
    sender_name: string;
    sender_email: string;
  };
  recipient?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  company?: {
    name: string;
    logo_url?: string;
    website?: string;
    support_email?: string;
  };
  custom?: Record<string, any>;
}

export interface ProcessedTemplate {
  subject: string;
  html_content: string;
  text_content: string;
  variables_used: string[];
}

// ===================================================================
// API Request/Response Types
// ===================================================================

export interface SendEmailRequest {
  to: string;
  email_type: EmailType;
  document_id?: string;
  recipient_id?: string;
  template_variables?: Record<string, any>;
  priority?: number;
  scheduled_for?: string;
  provider?: EmailProvider;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailPreferencesRequest {
  receive_invitations?: boolean;
  receive_reminders?: boolean;
  receive_status_updates?: boolean;
  receive_marketing?: boolean;
  reminder_frequency?: number;
  preferred_language?: string;
  timezone?: string;
  email_format?: EmailFormat;
}

export interface EmailAnalyticsRequest {
  start_date: string;
  end_date: string;
  email_type?: EmailType;
  group_by?: 'day' | 'week' | 'month';
}

export interface EmailAnalyticsResponse {
  analytics: EmailAnalytics[];
  summary: {
    total_sent: number;
    total_delivered: number;
    total_opened: number;
    total_clicked: number;
    avg_delivery_rate: number;
    avg_open_rate: number;
    avg_click_rate: number;
  };
}

// ===================================================================
// Hook Types
// ===================================================================

export interface UseEmailNotificationsOptions {
  documentId?: string;
  emailType?: EmailType;
  limit?: number;
  offset?: number;
}

export interface UseEmailPreferencesOptions {
  userId?: string;
}

export interface UseEmailAnalyticsOptions {
  startDate: string;
  endDate: string;
  emailType?: EmailType;
  groupBy?: 'day' | 'week' | 'month';
}

// ===================================================================
// Component Props Types
// ===================================================================

export interface EmailPreferencesFormProps {
  userId?: string;
  onSave?: (preferences: UserEmailPreferences) => void;
  onCancel?: () => void;
}

export interface EmailAnalyticsChartProps {
  data: EmailAnalytics[];
  type: 'delivery' | 'open' | 'click' | 'bounce';
  groupBy: 'day' | 'week' | 'month';
}

export interface EmailTemplateEditorProps {
  template?: EmailTemplate;
  onSave?: (template: EmailTemplate) => void;
  onCancel?: () => void;
}

export interface EmailNotificationListProps {
  documentId?: string;
  emailType?: EmailType;
  limit?: number;
  showFilters?: boolean;
}

// ===================================================================
// Error Types
// ===================================================================

export interface EmailError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface EmailValidationError extends EmailError {
  field: string;
  value: any;
}

// ===================================================================
// Utility Types
// ===================================================================

export type EmailProviderType<T extends EmailProvider> = 
  T extends 'sendgrid' ? SendGridConfig :
  T extends 'resend' ? ResendConfig :
  T extends 'ses' ? SESConfig :
  never;

export type EmailTemplateType<T extends EmailType> = 
  T extends 'document_invitation' ? 'Document Invitation' :
  T extends 'signature_reminder' ? 'Signature Reminder' :
  T extends 'document_signed' ? 'Document Signed' :
  T extends 'document_completed' ? 'Document Completed' :
  T extends 'document_expired' ? 'Document Expired' :
  T extends 'document_rejected' ? 'Document Rejected' :
  T extends 'document_viewed' ? 'Document Viewed' :
  T extends 'welcome_email' ? 'Welcome Email' :
  T extends 'password_reset' ? 'Password Reset' :
  never;

// ===================================================================
// Constants
// ===================================================================

export const EMAIL_TYPES: Record<EmailType, string> = {
  document_invitation: 'Document Invitation',
  signature_reminder: 'Signature Reminder',
  document_signed: 'Document Signed',
  document_completed: 'Document Completed',
  document_expired: 'Document Expired',
  document_rejected: 'Document Rejected',
  document_viewed: 'Document Viewed',
  welcome_email: 'Welcome Email',
  password_reset: 'Password Reset',
};

export const EMAIL_STATUSES: Record<EmailStatus, string> = {
  sent: 'Sent',
  delivered: 'Delivered',
  opened: 'Opened',
  clicked: 'Clicked',
  bounced: 'Bounced',
  failed: 'Failed',
};

export const EMAIL_PROVIDERS: Record<EmailProvider, string> = {
  sendgrid: 'SendGrid',
  resend: 'Resend',
  ses: 'AWS SES',
};

export const REMINDER_TYPES: Record<ReminderType, string> = {
  signature_reminder: 'Signature Reminder',
  expiration_warning: 'Expiration Warning',
  final_notice: 'Final Notice',
};

export const BLACKLIST_REASONS: Record<BlacklistReason, string> = {
  bounced: 'Bounced',
  complained: 'Complained',
  unsubscribed: 'Unsubscribed',
  invalid: 'Invalid',
  blocked: 'Blocked',
};

export const DEFAULT_EMAIL_PREFERENCES: Omit<UserEmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  receive_invitations: true,
  receive_reminders: true,
  receive_status_updates: true,
  receive_marketing: false,
  reminder_frequency: 2,
  preferred_language: 'en-NA',
  timezone: 'Africa/Windhoek',
  email_format: 'html',
};

export const EMAIL_QUEUE_PRIORITIES = {
  HIGH: 1,
  NORMAL: 5,
  LOW: 10,
} as const;

export const EMAIL_RETRY_ATTEMPTS = {
  MAX_ATTEMPTS: 3,
  RETRY_DELAY_MINUTES: [5, 15, 60], // Progressive backoff
} as const;

// ===================================================================
// Admin Email Controls Types
// ===================================================================

export type ManualEmailStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'sent'
  | 'failed';

export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';

export type ConflictType = 
  | 'duplicate'
  | 'document_status'
  | 'signature_workflow'
  | 'frequency_limit'
  | 'blacklist';

export interface ManualEmailRequest {
  id: string;
  admin_id: string;
  admin_name: string;
  email_type: EmailType;
  recipients: {
    type: 'custom' | 'document_signers' | 'all_users';
    ids?: string[];
    emails?: string[];
    documentId?: string;
  };
  subject: string;
  content: {
    html: string;
    text: string;
  };
  scheduled_for?: string;
  priority: EmailPriority;
  reason: string;
  status: ManualEmailStatus;
  conflicts: EmailConflict[];
  approver_id?: string;
  approver_name?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancelled_by?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailConflict {
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  recommendation: string;
  affected_email?: string;
  document_id?: string;
  document_status?: string;
}

export interface AdminEmailActivity {
  id: string;
  admin_id: string;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface EmailQueueItem {
  id: string;
  email_type: EmailType;
  recipient_email: string;
  subject: string;
  content: {
    html: string;
    text: string;
  };
  scheduled_for: string;
  priority: number;
  status: QueueStatus;
  attempts: number;
  last_attempt?: string;
  error_message?: string;
  is_manual: boolean;
  manual_request_id?: string;
  admin_id?: string;
  document_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentEmailConflict {
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  recommendation: string;
  document_status: string;
}

export interface SignatureWorkflowConflict {
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  message: string;
  recommendation: string;
  affected_email: string;
  document_id: string;
}

export interface EmailFrequencyData {
  email: string;
  email_count: number;
}

export interface EmailConflictMonitoring {
  id: string;
  admin_name: string;
  email_type: EmailType;
  subject: string;
  status: ManualEmailStatus;
  created_at: string;
  conflict_count: number;
  conflict_severity: ConflictSeverity;
  document_id?: string;
}

export interface EmailQueueMonitoring {
  status: QueueStatus;
  is_manual: boolean;
  count: number;
  avg_wait_minutes: number;
}

// ===================================================================
// Admin Email Controls API Types
// ===================================================================

export interface SendManualEmailRequest {
  email_type: EmailType;
  recipients: {
    type: 'custom' | 'document_signers' | 'all_users';
    ids?: string[];
    emails?: string[];
    documentId?: string;
  };
  subject: string;
  content: {
    html: string;
    text: string;
  };
  scheduled_for?: string;
  priority?: EmailPriority;
  reason: string;
  bypass_conflict_checks?: boolean;
}

export interface SendManualEmailResponse {
  success: boolean;
  request_id?: string;
  conflicts?: EmailConflict[];
  error?: string;
}

export interface GetManualEmailLogsRequest {
  page?: number;
  limit?: number;
  status?: ManualEmailStatus;
  admin_id?: string;
  email_type?: EmailType;
}

export interface GetManualEmailLogsResponse {
  requests: ManualEmailRequest[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ApproveManualEmailRequest {
  request_id: string;
  approver_notes?: string;
}

export interface RejectManualEmailRequest {
  request_id: string;
  rejection_reason: string;
}

export interface CancelManualEmailRequest {
  request_id: string;
  cancellation_reason: string;
}

export interface CheckEmailConflictsRequest {
  recipients: string[];
  email_type: EmailType;
  document_id?: string;
  hours_back?: number;
}

export interface CheckEmailConflictsResponse {
  conflicts: EmailConflict[];
  has_conflicts: boolean;
  severity_level: ConflictSeverity;
}

export interface GetEmailFrequencyRequest {
  recipients: string[];
  hours_back?: number;
}

export interface GetEmailFrequencyResponse {
  frequency_data: EmailFrequencyData[];
  has_frequency_issues: boolean;
}

// ===================================================================
// Admin Email Controls Hook Types
// ===================================================================

export interface UseAdminEmailControlsOptions {
  page?: number;
  limit?: number;
  status?: ManualEmailStatus;
  email_type?: EmailType;
}

export interface UseEmailConflictDetectionOptions {
  recipients: string[];
  email_type: EmailType;
  document_id?: string;
  hours_back?: number;
}

// ===================================================================
// Admin Email Controls Component Props
// ===================================================================

export interface AdminEmailControlsDashboardProps {
  adminId: string;
  adminName: string;
  onEmailSent?: (request: ManualEmailRequest) => void;
  onEmailApproved?: (request: ManualEmailRequest) => void;
  onEmailRejected?: (request: ManualEmailRequest) => void;
}

export interface ManualEmailFormProps {
  onSubmit: (data: SendManualEmailRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  conflicts?: EmailConflict[];
}

export interface EmailConflictAlertProps {
  conflicts: EmailConflict[];
  onResolve?: (conflict: EmailConflict) => void;
  onBypass?: () => void;
}

export interface EmailQueueMonitorProps {
  refreshInterval?: number;
  showManualOnly?: boolean;
}

export interface ManualEmailLogsTableProps {
  requests: ManualEmailRequest[];
  onApprove?: (request: ManualEmailRequest) => void;
  onReject?: (request: ManualEmailRequest) => void;
  onCancel?: (request: ManualEmailRequest) => void;
  onViewDetails?: (request: ManualEmailRequest) => void;
  isLoading?: boolean;
}

// ===================================================================
// Admin Email Controls Constants
// ===================================================================

export const MANUAL_EMAIL_STATUSES: Record<ManualEmailStatus, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  sent: 'Sent',
  failed: 'Failed',
};

export const EMAIL_PRIORITIES: Record<EmailPriority, string> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const CONFLICT_SEVERITIES: Record<ConflictSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const CONFLICT_TYPES: Record<ConflictType, string> = {
  duplicate: 'Duplicate Email',
  document_status: 'Document Status Conflict',
  signature_workflow: 'Signature Workflow Conflict',
  frequency_limit: 'Frequency Limit Exceeded',
  blacklist: 'Blacklisted Email',
};

export const EMAIL_QUEUE_PRIORITIES_ADMIN = {
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
} as const;
