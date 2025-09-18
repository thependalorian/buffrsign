/**
 * Resend Email Provider
 * 
 * Implementation of Resend email service for BuffrSign.
 * Handles sending emails through Resend API with webhook support.
 */

import { 
  EmailProvider, 
  ResendConfig, 
  EmailSendResult, 
  EmailQueueData,
  EmailWebhookEvent 
} from '@/lib/types/email';

export class ResendProvider {
  private config: ResendConfig;
  private isInitialized = false;
  private apiUrl = 'https://api.resend.com';

  constructor(config: ResendConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    if (!this.config.apiKey) {
      throw new Error('Resend API key is required');
    }

    this.isInitialized = true;
  }

  /**
   * Send email through Resend
   */
  async sendEmail(emailData: EmailQueueData): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      throw new Error('Resend provider not initialized');
    }

    try {
      const response = await fetch(`${this.apiUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html_content,
          text: emailData.text_content,
          reply_to: this.config.replyTo || this.config.fromEmail,
          tags: [
            {
              name: 'document_id',
              value: emailData.document_id || '',
            },
            {
              name: 'email_type',
              value: emailData.email_type,
            },
            {
              name: 'recipient_id',
              value: emailData.recipient_id || '',
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        messageId: result.id,
        provider: 'resend' as EmailProvider,
      };
    } catch (error: any) {
      console.error('Resend send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email via Resend',
        provider: 'resend' as EmailProvider,
      };
    }
  }

  /**
   * Send email using Resend template
   */
  async sendTemplateEmail(
    to: string,
    templateId: string,
    templateData: Record<string, any>,
    customArgs?: Record<string, string>
  ): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      throw new Error('Resend provider not initialized');
    }

    try {
      const response = await fetch(`${this.apiUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${this.config.fromName} <${this.config.fromEmail}>`,
          to: [to],
          template_id: templateId,
          template_data: templateData,
          reply_to: this.config.replyTo || this.config.fromEmail,
          tags: Object.entries(customArgs || {}).map(([name, value]) => ({
            name,
            value,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        messageId: result.id,
        provider: 'resend' as EmailProvider,
      };
    } catch (error: any) {
      console.error('Resend template send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email via Resend',
        provider: 'resend' as EmailProvider,
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
      console.warn('Resend webhook secret not configured');
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
      console.error('Resend webhook verification error:', error);
      return false;
    }
  }

  /**
   * Parse Resend webhook event
   */
  parseWebhookEvent(event: any): EmailWebhookEvent | null {
    try {
      return {
        event: event.type,
        timestamp: new Date(event.created_at).getTime(),
        messageId: event.data?.email_id || event.data?.id,
        email: event.data?.to || event.data?.email,
        reason: event.data?.reason,
        url: event.data?.url,
        userAgent: event.data?.user_agent,
        ip: event.data?.ip,
      };
    } catch (error) {
      console.error('Resend webhook parsing error:', error);
      return null;
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): ResendConfig {
    return { ...this.config };
  }

  /**
   * Update provider configuration
   */
  updateConfig(newConfig: Partial<ResendConfig>): void {
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
      // Test API key by making a simple request
      const response = await fetch(`${this.apiUrl}/domains`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Resend connection test failed:', error);
      return false;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(startDate: string, endDate: string): Promise<any> {
    try {
      // This would require Resend Analytics API
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
      console.error('Resend stats error:', error);
      throw error;
    }
  }

  /**
   * Get email status
   */
  async getEmailStatus(messageId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/emails/${messageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resend email status error:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled email
   */
  async cancelEmail(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/emails/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Resend cancel email error:', error);
      return false;
    }
  }
}
