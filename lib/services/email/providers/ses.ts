/**
 * SendGrid Email Provider (Replacing AWS SES)
 * 
 * Implementation of SendGrid email service for BuffrSign.
 * Handles sending emails through SendGrid API with webhook support.
 * 
 * Note: This replaces AWS SES to align with our actual infrastructure:
 * - Database: Supabase (PostgreSQL)
 * - Email: SendGrid
 * - Knowledge Graph: Neo4j
 */

import { 
  EmailProvider, 
  SESConfig, 
  EmailSendResult, 
  EmailQueueData,
  EmailWebhookEvent 
} from '@/lib/types/email';

export class SESProvider {
  private config: SESConfig;
  private isInitialized = false;
  private sendGridApiKey: string;

  constructor(config: SESConfig) {
    this.config = config;
    this.sendGridApiKey = config.apiKey || '';
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.sendGridApiKey) {
      throw new Error('SendGrid API key is required');
    }

    try {
      // Test SendGrid connection
      const response = await fetch('https://api.sendgrid.com/v3/_user/account', {
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SendGrid API test failed: ${response.status}`);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
      throw new Error('Failed to initialize SendGrid provider');
    }
  }

  /**
   * Send email through SendGrid
   */
  async sendEmail(emailData: EmailQueueData): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const emailPayload = {
        personalizations: [
          {
            to: [{ email: emailData.to }],
            subject: emailData.subject,
            custom_args: {
              document_id: emailData.document_id || '',
              email_type: emailData.email_type,
              recipient_id: emailData.recipient_id || '',
            },
          },
        ],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        reply_to: {
          email: this.config.replyTo || this.config.fromEmail,
        },
        content: [
          ...(emailData.html_content ? [{
            type: 'text/html',
            value: emailData.html_content,
          }] : []),
          ...(emailData.text_content ? [{
            type: 'text/plain',
            value: emailData.text_content,
          }] : []),
        ],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`SendGrid API error: ${response.status} - ${errorData}`);
      }

      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;

      return {
        success: true,
        messageId,
        provider: 'sendgrid' as EmailProvider,
      };
    } catch (error: unknown) {
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
    templateName: string,
    templateData: Record<string, unknown>,
    customArgs?: Record<string, string>
  ): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const emailPayload = {
        personalizations: [
          {
            to: [{ email: to }],
            dynamic_template_data: templateData,
            custom_args: customArgs || {},
          },
        ],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName,
        },
        reply_to: {
          email: this.config.replyTo || this.config.fromEmail,
        },
        template_id: templateName,
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`SendGrid template API error: ${response.status} - ${errorData}`);
      }

      const messageId = response.headers.get('X-Message-Id') || `sg-${Date.now()}`;

      return {
        success: true,
        messageId,
        provider: 'sendgrid' as EmailProvider,
      };
    } catch (error: unknown) {
      console.error('SendGrid template send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email via SendGrid',
        provider: 'sendgrid' as EmailProvider,
      };
    }
  }

  /**
   * Verify SendGrid webhook signature
   */
  async verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): Promise<boolean> {
    if (!this.config.webhookSecret) {
      console.warn('SendGrid webhook secret not configured');
      return false;
    }

    try {
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
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
  parseWebhookEvent(event: unknown): EmailWebhookEvent | null {
    try {
      // SendGrid webhook events are arrays of events
      if (Array.isArray(event) && event.length > 0) {
        const webhookEvent = event[0];
        
        return {
          event: webhookEvent.event,
          messageId: webhookEvent.sg_message_id,
          email: webhookEvent.email,
          reason: webhookEvent.reason || webhookEvent.type,
          url: webhookEvent.url,
          userAgent: webhookEvent.useragent,
          ip: webhookEvent.ip,
        };
      }

      return null;
    } catch (error) {
      console.error('SendGrid webhook parsing error:', error);
      return null;
    }
  }

  /**
   * Get provider configuration
   */
  getConfig(): SESConfig {
    return { ...this.config };
  }

  /**
   * Update provider configuration
   */
  async updateConfig(newConfig: Partial<SESConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.apiKey || newConfig.secretAccessKey || newConfig.region) {
      await this.initialize();
    }
  }

  /**
   * Test SendGrid connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Test connection by getting account info
      const response = await fetch('https://api.sendgrid.com/v3/_user/account', {
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return false;
    }
  }

  /**
   * Get delivery statistics from SendGrid
   */
  async getDeliveryStats(startDate: string, endDate: string): Promise<SendGridDeliveryStats> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await fetch(
        `https://api.sendgrid.com/v3/stats?start_date=${startDate}&end_date=${endDate}&aggregated_by=day`,
        {
          headers: {
            'Authorization': `Bearer ${this.sendGridApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`SendGrid stats API error: ${response.status}`);
      }

      const stats = await response.json();
      
      return {
        delivered: stats.reduce((sum: number, day: unknown) => sum + (day.stats[0]?.metrics?.delivered || 0), 0),
        bounced: stats.reduce((sum: number, day: unknown) => sum + (day.stats[0]?.metrics?.bounces || 0), 0),
        complaints: stats.reduce((sum: number, day: unknown) => sum + (day.stats[0]?.metrics?.spam_reports || 0), 0),
        rejected: stats.reduce((sum: number, day: unknown) => sum + (day.stats[0]?.metrics?.blocks || 0), 0),
      };
    } catch (error) {
      console.error('SendGrid stats error:', error);
      throw error;
    }
  }

  /**
   * Get sending quota from SendGrid
   */
  async getSendingQuota(): Promise<SendGridSendingQuota> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await fetch('https://api.sendgrid.com/v3/_user/credits', {
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SendGrid quota API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SendGrid quota error:', error);
      throw error;
    }
  }

  /**
   * Verify email address with SendGrid
   */
  async verifyEmailAddress(email: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await fetch('https://api.sendgrid.com/v3/validations/email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.result?.verdict === 'Valid';
    } catch (error) {
      console.error('SendGrid email verification error:', error);
      return false;
    }
  }

  /**
   * List verified email addresses from SendGrid
   */
  async listVerifiedEmails(): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const response = await fetch('https://api.sendgrid.com/v3/verified_senders', {
        headers: {
          'Authorization': `Bearer ${this.sendGridApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`SendGrid verified senders API error: ${response.status}`);
      }

      const result = await response.json();
      return result.results?.map((sender: unknown) => sender.from_email) || [];
    } catch (error) {
      console.error('SendGrid list verified emails error:', error);
      throw error;
    }
  }
}
