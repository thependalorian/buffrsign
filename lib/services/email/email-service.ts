/**
 * Email Service
 * 
 * Main service class for handling all email operations in BuffrSign.
 * Orchestrates email providers, template engine, and database operations.
 */

import { createClient } from '@/lib/supabase/client';
import { EmailTemplateEngine } from './template-engine';
import { SendGridProvider, ResendProvider, SESProvider } from './providers';
import {
  EmailType,
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
  DEFAULT_EMAIL_PREFERENCES,
  EMAIL_QUEUE_PRIORITIES,
  EMAIL_RETRY_ATTEMPTS,
} from '@/lib/types/email';

export class EmailService {
  private supabase = createClient();
  private templateEngine = new EmailTemplateEngine();
  private providers: Map<EmailProvider, any> = new Map();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email service
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadProviderConfigurations();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize EmailService:', error);
      throw error;
    }
  }

  /**
   * Load provider configurations from database
   */
  private async loadProviderConfigurations(): Promise<void> {
    try {
      const { data: configs, error } = await this.supabase
        .from('email_system_config')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Failed to load email configurations:', error);
        return;
      }

      // Initialize providers based on configuration
      for (const config of configs || []) {
        const providerType = config.config_key.split('_')[0] as EmailProvider;
        const providerConfig = config.config_value;

        switch (providerType) {
          case 'sendgrid':
            this.providers.set('sendgrid', new SendGridProvider(providerConfig));
            break;
          case 'resend':
            this.providers.set('resend', new ResendProvider(providerConfig));
            break;
          case 'ses':
            this.providers.set('ses', new SESProvider(providerConfig));
            break;
        }
      }
    } catch (error) {
      console.error('Error loading provider configurations:', error);
    }
  }

  /**
   * Send email using template
   */
  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    if (!this.isInitialized) {
      throw new Error('EmailService not initialized');
    }

    try {
      // Check if email is blacklisted
      const isBlacklisted = await this.isEmailBlacklisted(request.to);
      if (isBlacklisted) {
        return {
          success: false,
          error: 'Email address is blacklisted',
        };
      }

      // Get _user preferences
      const preferences = await this.getUserEmailPreferences(request.to);
      if (!preferences) {
        return {
          success: false,
          error: 'User email preferences not found',
        };
      }

      // Check if _user wants to receive this type of email
      if (!this.shouldSendEmail(request.email_type, preferences)) {
        return {
          success: true,
          messageId: 'skipped',
        };
      }

      // Process template
      const context = await this.buildTemplateContext(request);
      const processedTemplate = await this.templateEngine.processTemplate(
        request.email_type,
        context,
        preferences.preferred_language
      );

      if (!processedTemplate) {
        return {
          success: false,
          error: 'Failed to process email template',
        };
      }

      // Prepare email data
      const emailData: EmailQueueData = {
        to: request.to,
        subject: processedTemplate.subject,
        html_content: processedTemplate.html_content,
        text_content: processedTemplate.text_content,
        email_type: request.email_type,
        document_id: request.document_id,
        recipient_id: request.recipient_id,
        provider: request.provider || 'sendgrid',
        metadata: {
          variables_used: processedTemplate.variables_used,
          template_processed_at: new Date().toISOString(),
        },
      };

      // Send email immediately or queue it
      if (request.scheduled_for) {
        return await this.scheduleEmail(emailData, request.scheduled_for, request.priority);
      } else {
        return await this.sendEmailImmediate(emailData);
      }
    } catch (error: unknown) {
      console.error('Send email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Send email immediately
   */
  private async sendEmailImmediate(emailData: EmailQueueData): Promise<SendEmailResponse> {
    try {
      const provider = this.providers.get(emailData.provider || 'sendgrid');
      if (!provider) {
        throw new Error(`Email provider not configured: ${emailData.provider}`);
      }

      const result = await provider.sendEmail(emailData);

      // Record email notification
      await this.recordEmailNotification(emailData, result);

      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error: unknown) {
      console.error('Immediate email send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email immediately',
      };
    }
  }

  /**
   * Schedule email for later delivery
   */
  private async scheduleEmail(
    emailData: EmailQueueData,
    scheduledFor: string,
    priority: number = EMAIL_QUEUE_PRIORITIES.NORMAL
  ): Promise<SendEmailResponse> {
    try {
      const { data, error } = await this.supabase
        .from('email_queue')
        .insert({
          priority,
          email_data: emailData,
          scheduled_for: scheduledFor,
          status: 'queued',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        messageId: data.id,
      };
    } catch (error: unknown) {
      console.error('Schedule email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule email',
      };
    }
  }

  /**
   * Process email queue
   */
  async processEmailQueue(): Promise<void> {
    try {
      const { data: queueItems, error } = await this.supabase
        .rpc('process_email_queue', { batch_size: 10 });

      if (error) {
        console.error('Failed to process email queue:', error);
        return;
      }

      for (const item of queueItems || []) {
        try {
          const provider = this.providers.get(item.email_data.provider || 'sendgrid');
          if (!provider) {
            throw new Error(`Provider not configured: ${item.email_data.provider}`);
          }

          const result = await provider.sendEmail(item.email_data);
          
          // Update queue item status
          await this.supabase
            .rpc('complete_email_queue_item', {
              queue_id: item.id,
              success: result.success,
              message_id: result.messageId,
              error_message: result.error,
            });

          // Record email notification if successful
          if (result.success) {
            await this.recordEmailNotification(item.email_data, result);
          }
        } catch (error: unknown) {
          console.error(`Failed to process queue item ${item.id}:`, error);
          
          // Mark as failed if max attempts reached
          if (item.attempts >= EMAIL_RETRY_ATTEMPTS.MAX_ATTEMPTS) {
            await this.supabase
              .rpc('complete_email_queue_item', {
                queue_id: item.id,
                success: false,
                error_message: error.message,
              });
          }
        }
      }
    } catch (error) {
      console.error('Email queue processing error:', error);
    }
  }

  /**
   * Record email notification in database
   */
  private async recordEmailNotification(
    emailData: EmailQueueData,
    result: EmailSendResult
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_notifications')
        .insert({
          document_id: emailData.document_id,
          recipient_id: emailData.recipient_id,
          email_type: emailData.email_type,
          email_address: emailData.to,
          subject: emailData.subject,
          html_content: emailData.html_content,
          text_content: emailData.text_content,
          status: result.success ? 'sent' : 'failed',
          external_message_id: result.messageId,
          provider: emailData.provider || 'sendgrid',
          error_message: result.error,
          sent_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Failed to record email notification:', error);
      }
    } catch (error) {
      console.error('Record email notification error:', error);
    }
  }

  /**
   * Build template context from request
   */
  private async buildTemplateContext(request: SendEmailRequest): Promise<TemplateContext> {
    const context: TemplateContext = {};

    // Load _document context if document_id provided
    if (request.document_id) {
      const { data: _document } = await this.supabase
        .from('documents')
        .select(`
          id,
          title,
          status,
          created_at,
          expires_at,
          created_by,
          profiles!documents_created_by_fkey(full_name, email)
        `)
        .eq('id', request.document_id)
        .single();

      if (_document) {
        context._document = {
          id: _document.id,
          title: _document.title,
          status: _document.status,
          created_at: _document.created_at,
          expires_at: _document.expires_at,
          sender_name: _document.profiles?.full_name || '',
          sender_email: _document.profiles?.email || '',
        };
      }
    }

    // Load recipient context if recipient_id provided
    if (request.recipient_id) {
      const { data: recipient } = await this.supabase
        .from('document_recipients')
        .select('*')
        .eq('id', request.recipient_id)
        .single();

      if (recipient) {
        context.recipient = {
          id: recipient.id,
          name: recipient.name,
          email: recipient.email,
          role: recipient.role,
        };
      }
    }

    // Add custom variables
    if (request.template_variables) {
      context.custom = request.template_variables;
    }

    // Add company context (from system config)
    const { data: companyConfig } = await this.supabase
      .from('email_system_config')
      .select('config_value')
      .eq('config_key', 'company_branding')
      .single();

    if (companyConfig) {
      context.company = companyConfig.config_value;
    }

    return context;
  }

  /**
   * Check if email is blacklisted
   */
  private async isEmailBlacklisted(email: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('email_blacklist')
        .select('id')
        .eq('email_address', email.toLowerCase())
        .eq('is_active', true)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get _user email preferences
   */
  private async getUserEmailPreferences(email: string): Promise<UserEmailPreferences | null> {
    try {
      // First try to get by email
      const { data: _user } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!_user) {
        // Return default preferences if _user not found
        return {
          id: '',
          user_id: '',
          ...DEFAULT_EMAIL_PREFERENCES,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      const { data: preferences } = await this.supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', _user.id)
        .single();

      return preferences || {
        id: '',
        user_id: _user.id,
        ...DEFAULT_EMAIL_PREFERENCES,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Get _user preferences error:', error);
      return null;
    }
  }

  /**
   * Check if email should be sent based on _user preferences
   */
  private shouldSendEmail(_emailType: EmailType, preferences: UserEmailPreferences): boolean {
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
        return true; // Always send system emails
      default:
        return preferences.receive_marketing;
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(
    provider: EmailProvider,
    event: EmailWebhookEvent
  ): Promise<void> {
    try {
      // Update email notification status
      const { error } = await this.supabase
        .from('email_notifications')
        .update({
          status: this.mapWebhookEventToStatus(event.event),
          delivered_at: event.event === 'delivered' ? new Date(event.timestamp).toISOString() : undefined,
          opened_at: event.event === 'opened' ? new Date(event.timestamp).toISOString() : undefined,
          clicked_at: event.event === 'clicked' ? new Date(event.timestamp).toISOString() : undefined,
          error_message: event.reason,
        })
        .eq('external_message_id', event.messageId);

      if (error) {
        console.error('Failed to update email notification:', error);
      }

      // Handle bounces and complaints
      if (event.event === 'bounced' || event.event === 'complained') {
        await this.addToBlacklist(event.email, event.event as any, event.reason);
      }

      // Update analytics
      await this.updateEmailAnalytics(event);
    } catch (error) {
      console.error('Webhook event handling error:', error);
    }
  }

  /**
   * Map webhook event to email status
   */
  private mapWebhookEventToStatus(event: string): string {
    switch (event) {
      case 'delivered':
        return 'delivered';
      case 'opened':
        return 'opened';
      case 'clicked':
        return 'clicked';
      case 'bounced':
        return 'bounced';
      case 'complained':
        return 'bounced'; // Treat complaints as bounces
      default:
        return 'sent';
    }
  }

  /**
   * Add email to blacklist
   */
  private async addToBlacklist(
    email: string,
    reason: 'bounced' | 'complained' | 'unsubscribed' | 'invalid' | 'blocked',
    notes?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_blacklist')
        .upsert({
          email_address: email.toLowerCase(),
          reason,
          notes,
          is_active: true,
        });

      if (error) {
        console.error('Failed to add email to blacklist:', error);
      }
    } catch (error) {
      console.error('Add to blacklist error:', error);
    }
  }

  /**
   * Update email analytics
   */
  private async updateEmailAnalytics(event: EmailWebhookEvent): Promise<void> {
    try {
      // This would trigger the daily analytics update function
      // For real-time updates, we could implement incremental analytics
      await this.supabase.rpc('update_daily_email_analytics');
    } catch (error) {
      console.error('Update analytics error:', error);
    }
  }

  /**
   * Get email analytics
   */
  async getEmailAnalytics(
    startDate: string,
    endDate: string,
    _emailType?: EmailType
  ): Promise<EmailAnalytics[]> {
    try {
      let query = this.supabase
        .from('email_analytics')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (_emailType) {
        query = query.eq('email_type', _emailType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Get email analytics error:', error);
      return [];
    }
  }

  /**
   * Process scheduled reminders
   */
  async processScheduledReminders(): Promise<void> {
    try {
      const { data: reminders, error } = await this.supabase
        .rpc('process_scheduled_reminders');

      if (error) {
        console.error('Failed to process scheduled reminders:', error);
        return;
      }

      for (const reminder of reminders || []) {
        try {
          await this.sendEmail({
            to: reminder.email_address,
            email_type: reminder.reminder_type as EmailType,
            document_id: reminder.document_id,
            recipient_id: reminder.recipient_id,
          });
        } catch (error) {
          console.error(`Failed to send reminder ${reminder.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Process scheduled reminders error:', error);
    }
  }

  /**
   * Test email provider connection
   */
  async testProviderConnection(provider: EmailProvider): Promise<boolean> {
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return false;
      }

      return await providerInstance.testConnection();
    } catch (error) {
      console.error(`Test ${provider} connection error:`, error);
      return false;
    }
  }

  /**
   * Send _document expired notification
   */
  async sendDocumentExpired(data: {
    documentId: string;
    recipientEmail: string;
    recipientName: string;
    documentTitle: string;
    expiredAt: Date;
  }): Promise<EmailResponse> {
    try {
      const template = await this.templateEngine.getTemplate('document_expired', 'en-US');
      
      const emailData = {
        to: data.recipientEmail,
        subject: `Document Expired: ${data.documentTitle}`,
        html: this.templateEngine.renderTemplate(template, {
          recipient_name: data.recipientName,
          document_title: data.documentTitle,
          expired_at: data.expiredAt.toLocaleDateString(),
          document_url: `${this.config.appUrl}/documents/${data.documentId}`
        }),
        text: this.templateEngine.renderTextTemplate(template, {
          recipient_name: data.recipientName,
          document_title: data.documentTitle,
          expired_at: data.expiredAt.toLocaleDateString(),
          document_url: `${this.config.appUrl}/documents/${data.documentId}`
        })
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending _document expired notification:', error);
      throw error;
    }
  }

  /**
   * Send signature declined notification
   */
  async sendSignatureDeclined(data: {
    documentId: string;
    recipientEmail: string;
    recipientName: string;
    documentTitle: string;
    signerName: string;
    signerEmail: string;
    declineReason: string;
  }): Promise<EmailResponse> {
    try {
      const template = await this.templateEngine.getTemplate('document_rejected', 'en-US');
      
      const emailData = {
        to: data.recipientEmail,
        subject: `Signature Declined: ${data.documentTitle}`,
        html: this.templateEngine.renderTemplate(template, {
          recipient_name: data.recipientName,
          document_title: data.documentTitle,
          signer_name: data.signerName,
          signer_email: data.signerEmail,
          decline_reason: data.declineReason,
          document_url: `${this.config.appUrl}/documents/${data.documentId}`
        }),
        text: this.templateEngine.renderTextTemplate(template, {
          recipient_name: data.recipientName,
          document_title: data.documentTitle,
          signer_name: data.signerName,
          signer_email: data.signerEmail,
          decline_reason: data.declineReason,
          document_url: `${this.config.appUrl}/documents/${data.documentId}`
        })
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('Error sending signature declined notification:', error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getStatus(): { initialized: boolean; providers: string[] } {
    return {
      initialized: this.isInitialized,
      providers: Array.from(this.providers.keys()),
    };
  }
}
