/**
 * SendGrid Email Provider
 * 
 * Implementation of SendGrid email service for BuffrSign.
 * Handles sending emails through SendGrid API with webhook support.
 */

import sgMail from '@sendgrid/mail';
import { 
  EmailProvider, 
  SendGridConfig, 
  EmailSendResult, 
  EmailQueueData,
  EmailWebhookEvent 
} from '@/lib/types/email';

export class SendGridProvider {
  private config: SendGridConfig;
  private isInitialized = false;

  constructor(config: SendGridConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    sgMail.setApiKey(this.config.apiKey);
    this.isInitialized = true;
  }

  /**
   * Send email through SendGrid
   */
  async sendEmail(emailData: EmailQueueData): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      throw new Error('SendGrid provider not initialized');
    }

    try {
      const msg = {
        to: emailData.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        replyTo: this.config.replyTo || this.config.fromEmail,
        subject: emailData.subject,
        html: emailData.html_content,
        text: emailData.text_content,
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true,
          },
          openTracking: {
            enable: true,
          },
        },
        customArgs: {
          document_id: emailData.document_id || '',
          email_type: emailData.email_type,
          recipient_id: emailData.recipient_id || '',
        },
        ...(emailData.metadata && { metadata: emailData.metadata }),
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'] as string;

      return {
        success: true,
        messageId,
        provider: 'sendgrid' as EmailProvider,
      };
    } catch (error: any) {
      console.error('SendGrid send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email via SendGrid',
        provider: 'sendgrid' as EmailProvider,
      };
    }
  }

  /**
   * Send email using SendGrid template
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    dynamicTemplateData: Record<string, any>,
    customArgs?: Record<string, string>
  ): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      throw new Error('SendGrid provider not initialized');
    }

    try {
      const msg = {
        to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        replyTo: this.config.replyTo || this.config.fromEmail,
        templateId,
        dynamicTemplateData,
        customArgs: customArgs || {},
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true,
          },
          openTracking: {
            enable: true,
          },
        },
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'] as string;

      return {
        success: true,
        messageId,
        provider: 'sendgrid' as EmailProvider,
      };
    } catch (error: any) {
      console.error('SendGrid template send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email via SendGrid',
        provider: 'sendgrid' as EmailProvider,
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    if (!this.config.webhookSecret) {
      console.warn('SendGrid webhook secret not configured');
      return false;
    }

    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(timestamp + payload)
        .digest('base64');

      return signature === expectedSignature;
    } catch (error) {
      console.error('SendGrid webhook verification error:', error);
      return false;
    }
  }

  /**
   * Parse SendGrid webhook event
   */
  parseWebhookEvent(event: any): EmailWebhookEvent | null {
    try {
      return {
        event: event.event,
        timestamp: event.timestamp,
        messageId: event.sg_message_id,
        email: event.email,
        reason: event.reason,
        url: event.url,
        userAgent: event.useragent,
        ip: event.ip,
      };
    } catch (error) {
      console.error('SendGrid webhook parsing error:', error);
      return null;
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): SendGridConfig {
    return { ...this.config };
  }

  /**
   * Update provider configuration
   */
  updateConfig(newConfig: Partial<SendGridConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey) {
      this.initialize();
    }
  }

  /**
   * Test provider connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Send a test email to verify connection
      const testMsg = {
        to: this.config.fromEmail, // Send to self for testing
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        subject: 'SendGrid Connection Test',
        text: 'This is a test email to verify SendGrid connection.',
        html: '<p>This is a test email to verify SendGrid connection.</p>',
      };

      await sgMail.send(testMsg);
      return true;
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return false;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(startDate: string, endDate: string): Promise<any> {
    try {
      // This would require SendGrid Stats API
      // For now, return empty stats
      return {
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        blocked: 0,
        spam_reports: 0,
        invalid_emails: 0,
      };
    } catch (error) {
      console.error('SendGrid stats error:', error);
      throw error;
    }
  }
}
