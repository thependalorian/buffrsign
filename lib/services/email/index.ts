/**
 * Email Service Index
 * 
 * Main export file for the BuffrSign email system.
 */

export { EmailService } from './email-service';
export { EmailTemplateEngine } from './template-engine';
export { SendGridProvider, ResendProvider, SESProvider } from './providers';

// Re-export types for convenience
export type {
  EmailType,
  EmailStatus,
  EmailProvider,
  EmailSendResult,
  EmailQueueData,
  TemplateContext,
  ProcessedTemplate,
  UserEmailPreferences,
  EmailNotification,
  ScheduledReminder,
  EmailAnalytics,
  EmailBlacklist,
  SendEmailRequest,
  SendEmailResponse,
  EmailWebhookEvent,
} from '@/lib/types/email';
