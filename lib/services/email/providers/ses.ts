/**
 * AWS SES Email Provider
 * 
 * Implementation of AWS SES email service for BuffrSign.
 * Handles sending emails through AWS SES API with webhook support.
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
  private ses: any; // AWS SES SDK instance

  constructor(config: SESConfig) {
    this.config = config;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.config.apiKey || !this.config.secretAccessKey || !this.config.region) {
      throw new Error('AWS SES configuration is incomplete');
    }

    try {
      // Dynamically import AWS SDK
      const AWS = await import('aws-sdk');
      
      this.ses = new AWS.SES({
        region: this.config.region,
        accessKeyId: this.config.apiKey,
        secretAccessKey: this.config.secretAccessKey,
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AWS SES:', error);
      throw new Error('Failed to initialize AWS SES provider');
    }
  }

  /**
   * Send email through AWS SES
   */
  async sendEmail(emailData: EmailQueueData): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const params = {
        Source: `${this.config.fromName} <${this.config.fromEmail}>`,
        Destination: {
          ToAddresses: [emailData.to],
        },
        Message: {
          Subject: {
            Data: emailData.subject,
            Charset: 'UTF-8',
          },
          Body: {
            ...(emailData.html_content && {
              Html: {
                Data: emailData.html_content,
                Charset: 'UTF-8',
              },
            }),
            ...(emailData.text_content && {
              Text: {
                Data: emailData.text_content,
                Charset: 'UTF-8',
              },
            }),
          },
        },
        ReplyToAddresses: [this.config.replyTo || this.config.fromEmail],
        Tags: [
          {
            Name: 'document_id',
            Value: emailData.document_id || '',
          },
          {
            Name: 'email_type',
            Value: emailData.email_type,
          },
          {
            Name: 'recipient_id',
            Value: emailData.recipient_id || '',
          },
        ],
        ConfigurationSetName: 'buffrsign-config', // Optional: use SES configuration set
      };

      const result = await this.ses.sendEmail(params).promise();

      return {
        success: true,
        messageId: result.MessageId,
        provider: 'ses' as EmailProvider,
      };
    } catch (error: any) {
      console.error('AWS SES send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send email via AWS SES',
        provider: 'ses' as EmailProvider,
      };
    }
  }

  /**
   * Send email using SES template
   */
  async sendTemplateEmail(
    to: string,
    templateName: string,
    templateData: Record<string, any>,
    customArgs?: Record<string, string>
  ): Promise<EmailSendResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const params = {
        Source: `${this.config.fromName} <${this.config.fromEmail}>`,
        Destination: {
          ToAddresses: [to],
        },
        Template: templateName,
        TemplateData: JSON.stringify(templateData),
        ReplyToAddresses: [this.config.replyTo || this.config.fromEmail],
        Tags: Object.entries(customArgs || {}).map(([name, value]) => ({
          Name: name,
          Value: value,
        })),
      };

      const result = await this.ses.sendTemplatedEmail(params).promise();

      return {
        success: true,
        messageId: result.MessageId,
        provider: 'ses' as EmailProvider,
      };
    } catch (error: any) {
      console.error('AWS SES template send error:', error);
      
      return {
        success: false,
        error: error.message || 'Failed to send template email via AWS SES',
        provider: 'ses' as EmailProvider,
      };
    }
  }

  /**
   * Verify webhook signature (SES uses SNS for webhooks)
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    timestamp: string
  ): boolean {
    if (!this.config.webhookSecret) {
      console.warn('AWS SES webhook secret not configured');
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
      console.error('AWS SES webhook verification error:', error);
      return false;
    }
  }

  /**
   * Parse SES webhook event (from SNS)
   */
  parseWebhookEvent(event: any): EmailWebhookEvent | null {
    try {
      // SES events come through SNS
      if (event.Type === 'Notification') {
        const message = JSON.parse(event.Message);
        
        return {
          event: message.eventType,
          timestamp: new Date(message.mail.timestamp).getTime(),
          messageId: message.mail.messageId,
          email: message.mail.destination?.[0],
          reason: message.bounce?.bounceType || message.complaint?.complaintFeedbackType,
          url: message.click?.link,
          userAgent: message.open?.userAgent,
          ip: message.open?.ipAddress,
        };
      }

      return null;
    } catch (error) {
      console.error('AWS SES webhook parsing error:', error);
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
   * Test provider connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Test connection by getting sending quota
      const result = await this.ses.getSendQuota().promise();
      return result !== null;
    } catch (error) {
      console.error('AWS SES connection test failed:', error);
      return false;
    }
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(startDate: string, endDate: string): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get sending statistics
      const result = await this.ses.getSendStatistics().promise();
      
      return {
        delivered: result.SendDataPoints?.reduce((sum: number, point: any) => sum + point.DeliveryAttempts, 0) || 0,
        bounced: result.SendDataPoints?.reduce((sum: number, point: any) => sum + point.Bounces, 0) || 0,
        complaints: result.SendDataPoints?.reduce((sum: number, point: any) => sum + point.Complaints, 0) || 0,
        rejected: result.SendDataPoints?.reduce((sum: number, point: any) => sum + point.Rejects, 0) || 0,
      };
    } catch (error) {
      console.error('AWS SES stats error:', error);
      throw error;
    }
  }

  /**
   * Get sending quota
   */
  async getSendingQuota(): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return await this.ses.getSendQuota().promise();
    } catch (error) {
      console.error('AWS SES quota error:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmailAddress(email: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      await this.ses.verifyEmailIdentity({ EmailAddress: email }).promise();
      return true;
    } catch (error) {
      console.error('AWS SES email verification error:', error);
      return false;
    }
  }

  /**
   * List verified email addresses
   */
  async listVerifiedEmails(): Promise<string[]> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const result = await this.ses.listVerifiedEmailAddresses().promise();
      return result.VerifiedEmailAddresses || [];
    } catch (error) {
      console.error('AWS SES list verified emails error:', error);
      throw error;
    }
  }
}
