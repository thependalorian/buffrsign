@buffrsign-starter/ # DocuSign & Alternatives: Email Notification Systems Deep Dive

## Executive Summary

This analysis examines the email notification systems used by major digital signature platforms and provides a comprehensive implementation strategy for BuffrSign's email functionality. The key finding is that most platforms use enterprise-grade email service providers like SendGrid, Mailgun, or AWS SES, combined with sophisticated template systems and event-driven architectures.

## Platform Analysis

### 1. DocuSign Email System Architecture

#### Core Email Infrastructure
- **Email Service Provider**: Likely uses **SendGrid** (Twilio) or **Amazon SES**
- **Integration Pattern**: Event-driven architecture with webhook integrations to SendGrid
- **API Approach**: Uses EnvelopeRecipients:update API with resend_envelope parameter for email notifications

#### Email Notification Features
- **Automated Notifications**: Triggered on envelope status changes (sent, viewed, signed, completed)
- **Customizable Templates**: Brand customization and personalized messaging
- **Multi-recipient Support**: Bulk email sending with individual tracking
- **Notification Preferences**: User-configurable notification settings via My Preferences menu

#### Technical Implementation Patterns
```typescript
// DocuSign-style email notification workflow
interface EmailNotificationSystem {
  // Envelope events trigger email workflows
  onEnvelopeStatusChange: (envelope: Envelope) => void;
  
  // Configurable notification preferences
  notificationPreferences: UserNotificationSettings;
  
  // Template-based email generation
  generateEmailFromTemplate: (template: EmailTemplate, data: any) => Email;
  
  // Multi-recipient batch sending
  sendBulkEmails: (recipients: Recipient[], email: Email) => Promise<void>;
}
```

### 2. HelloSign (Dropbox Sign) Email System

#### Key Features
- **Streamlined Email Flow**: Focus on easy send, receive, and manage workflow
- **Integration Strategy**: Deep integration with Dropbox ecosystem
- **Notification System**: Event-based notifications with customizable triggers

### 3. PandaDoc Email System

#### Advanced Features
- **CRM Integration**: Built-in CRM integrations with email synchronization
- **Payment Integration**: Email notifications tied to payment collection
- **Template System**: Drag-and-drop email template creation
- **Analytics Integration**: Email tracking and engagement metrics

### 4. SignNow Email System

#### Core Characteristics
- **Mobile-First**: Strong mobile accessibility for email notifications
- **Security Focus**: SOC 2 Type II compliance and GDPR readiness in email handling
- **Simplified Workflow**: Emphasis on quick document signing via email

## Common Technical Stack Patterns

### Email Service Providers Used
1. **SendGrid (Twilio)**: Most popular choice for transactional emails
2. **Amazon SES**: Cost-effective for high-volume sending
3. **Mailgun**: Developer-friendly API and analytics
4. **Postmark**: High deliverability focus

### Architecture Patterns
1. **Event-Driven Architecture**: Document events trigger email workflows
2. **Template Engine**: Dynamic email generation from templates
3. **Queue Systems**: Asynchronous email processing
4. **Webhook Integration**: Real-time status updates via webhooks

## BuffrSign Email Implementation Strategy

### 1. Email Service Provider Recommendation

#### Primary Choice: **SendGrid (Twilio)**
**Reasons:**
- Manages technical details of email delivery, infrastructure scaling, ISP outreach, reputation monitoring
- REST interface to send email at scale with high volume handling
- Proven integration with DocuSign-style workflows
- Comprehensive analytics and deliverability features

#### Backup Choice: **Resend** (Modern Alternative)
- Developer-friendly API
- Built for modern applications
- Excellent deliverability
- Competitive pricing

### 2. Email Notification Architecture for BuffrSign

#### Core Email System Components

```typescript
// BuffrSign Email Notification System
interface BuffrSignEmailSystem {
  // Email service integration
  emailProvider: 'sendgrid' | 'resend' | 'ses';
  
  // Template management
  templates: {
    documentInvitation: EmailTemplate;
    signatureReminder: EmailTemplate;
    documentSigned: EmailTemplate;
    documentCompleted: EmailTemplate;
    documentExpiring: EmailTemplate;
    documentRejected: EmailTemplate;
  };
  
  // Notification workflows
  workflows: {
    documentSigning: SigningWorkflow;
    reminderSchedule: ReminderSchedule;
    statusUpdates: StatusUpdateFlow;
  };
  
  // User preferences
  preferences: UserEmailPreferences;
}
```

### 3. Email Template System

#### Dynamic Email Templates
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: TemplateVariable[];
  branding: BrandingOptions;
}

interface SigningInvitationTemplate extends EmailTemplate {
  // Document-specific variables
  documentTitle: string;
  senderName: string;
  signingUrl: string;
  expirationDate: Date;
  customMessage?: string;
}
```

### 4. Event-Driven Email Workflow

#### Document Lifecycle Email Events
```typescript
enum DocumentEmailEvents {
  DOCUMENT_SENT = 'document.sent',
  DOCUMENT_VIEWED = 'document.viewed',
  DOCUMENT_SIGNED = 'document.signed',
  DOCUMENT_COMPLETED = 'document.completed',
  DOCUMENT_EXPIRED = 'document.expired',
  DOCUMENT_REJECTED = 'document.rejected',
  REMINDER_DUE = 'reminder.due'
}

class DocumentEmailService {
  async sendSigningInvitation(document: Document, recipients: Recipient[]) {
    const template = await this.getTemplate('documentInvitation');
    
    for (const recipient of recipients) {
      const email = await this.generateEmail(template, {
        recipientName: recipient.name,
        documentTitle: document.title,
        signingUrl: this.generateSigningUrl(document.id, recipient.id),
        senderName: document.sender.name,
        expirationDate: document.expirationDate
      });
      
      await this.sendEmail(recipient.email, email);
      await this.trackEmailEvent('invitation_sent', document.id, recipient.id);
    }
  }
  
  async sendReminder(document: Document, recipient: Recipient) {
    if (this.shouldSendReminder(recipient)) {
      const template = await this.getTemplate('signatureReminder');
      // Send reminder logic
    }
  }
}
```

### 5. Database Schema for Email System

#### Email Tracking Tables
```sql
-- Email notifications table
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  recipient_id UUID REFERENCES document_recipients(id),
  email_type VARCHAR(50) NOT NULL, -- 'invitation', 'reminder', 'completion', etc.
  email_address VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed'
  external_message_id VARCHAR(255), -- SendGrid/Resend message ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User email preferences
CREATE TABLE user_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  receive_invitations BOOLEAN DEFAULT true,
  receive_reminders BOOLEAN DEFAULT true,
  receive_status_updates BOOLEAN DEFAULT true,
  reminder_frequency INTEGER DEFAULT 2, -- days
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Implementation Files for BuffrSign

#### File Structure
```
lib/
├── email/
│   ├── email-service.ts           # Main email service
│   ├── email-templates.ts         # Template management
│   ├── email-workflows.ts         # Workflow orchestration
│   ├── providers/
│   │   ├── sendgrid-provider.ts   # SendGrid implementation
│   │   ├── resend-provider.ts     # Resend implementation
│   │   └── email-provider.ts      # Base provider interface
│   └── hooks/
│       ├── use-email-notifications.ts
│       └── use-email-preferences.ts
└── types/
    └── email.ts                   # Email type definitions
```

### 7. Key Implementation Features

#### Multi-Language Support
```typescript
interface EmailLocalization {
  locale: string;
  templates: Record<string, EmailTemplate>;
  subjects: Record<string, string>;
}

// Namibian focus with English/Afrikaans support
const SUPPORTED_LOCALES = ['en-NA', 'af-NA', 'en-US'];
```

#### Advanced Reminder System
```typescript
class ReminderScheduler {
  // Intelligent reminder scheduling
  scheduleReminders(document: Document) {
    const reminderSchedule = this.calculateReminderSchedule(
      document.expirationDate,
      document.priority,
      document.recipients
    );
    
    // Schedule reminders at optimal times
    reminderSchedule.forEach(reminder => {
      this.scheduleEmail(reminder.date, reminder.type, document.id);
    });
  }
}
```

#### Email Analytics Integration
```typescript
interface EmailAnalytics {
  openRates: number;
  clickRates: number;
  conversionRates: number; // Documents signed after email
  bounceRates: number;
  unsubscribeRates: number;
}
```

### 8. Integration with BuffrSign's AI System

#### AI-Enhanced Email Content
```typescript
// Use LlamaIndex to generate personalized email content
class AIEmailEnhancer {
  async enhanceEmailContent(
    template: EmailTemplate, 
    document: Document, 
    recipient: Recipient
  ): Promise<EnhancedEmail> {
    const context = await this.analyzeDocumentContext(document);
    const personalizedContent = await this.generatePersonalizedMessage(
      context, 
      recipient.preferences
    );
    
    return {
      ...template,
      customMessage: personalizedContent,
      urgencyLevel: context.urgencyScore
    };
  }
}
```

### 9. Security and Compliance Considerations

#### Email Security Features
- **Encryption**: End-to-end email content encryption
- **Authentication**: SPF, DKIM, DMARC setup
- **Privacy**: GDPR-compliant email handling
- **Tracking**: Secure tracking pixels and link analytics

#### ETA 2019 Compliance
- **Audit Trail**: Complete email audit logging
- **Legal Notifications**: Compliant legal language in emails
- **Data Retention**: Proper email data retention policies

### 10. Cost Analysis for BuffrSign

#### SendGrid Pricing (Primary Choice)
- **Free Tier**: 100 emails/day
- **Essentials**: $14.95/month (40,000 emails)
- **Pro**: $89.95/month (100,000 emails)
- **Cost per email**: ~$0.00036 per email at scale

#### Implementation Budget
- **Development Time**: 2-3 weeks for full email system
- **Monthly Email Costs**: $15-90 USD (~N$264-1,584)
- **Template Design**: $500-1,000 for professional templates
- **Testing & QA**: 1 week for comprehensive testing

## Conclusion and Recommendations

### Immediate Implementation Steps

1. **Phase 1**: Basic email notifications with SendGrid
   - Document invitation emails
   - Status update notifications
   - Simple reminder system

2. **Phase 2**: Advanced features
   - AI-enhanced personalization
   - Advanced analytics
   - Multi-language support

3. **Phase 3**: Enterprise features
   - Custom branding
   - Advanced workflow orchestration
   - Compliance reporting

### Success Metrics
- **Email Delivery Rate**: >99%
- **Open Rates**: >40% (industry average: 25-35%)
- **Click-through Rates**: >15% (industry average: 3-5%)
- **Document Completion Rate**: >80% after email invitation

The implementation of this email system will position BuffrSign competitively with DocuSign and other major platforms while maintaining the focus on speed and AI enhancement that differentiates the platform.; // ===================================================================
// BuffrSign Email Notification System Implementation
// Complete email system for document signing workflows
// ===================================================================

// ==================== TYPES AND INTERFACES ====================

// lib/types/email.ts
export interface EmailProvider {
  name: 'sendgrid' | 'resend' | 'ses';
  send: (email: Email) => Promise<EmailResponse>;
  sendBulk: (emails: Email[]) => Promise<EmailResponse[]>;
  getDeliveryStatus: (messageId: string) => Promise<DeliveryStatus>;
}

export interface Email {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text: string;
  templateId?: string;
  templateData?: Record<string, any>;
  trackingEnabled?: boolean;
  customArgs?: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: EmailTemplateType;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: TemplateVariable[];
  isActive: boolean;
  brandingOptions?: BrandingOptions;
}

export type EmailTemplateType = 
  | 'document_invitation'
  | 'signature_reminder'
  | 'document_signed'
  | 'document_completed'
  | 'document_expired'
  | 'document_rejected'
  | 'document_viewed';

export interface TemplateVariable {
  name: string;
  type: 'string' | 'date' | 'number' | 'url';
  required: boolean;
  defaultValue?: any;
}

export interface EmailNotification {
  id: string;
  documentId: string;
  recipientId: string;
  emailType: EmailTemplateType;
  emailAddress: string;
  subject: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  externalMessageId?: string;
}

export interface UserEmailPreferences {
  userId: string;
  receiveInvitations: boolean;
  receiveReminders: boolean;
  receiveStatusUpdates: boolean;
  reminderFrequency: number; // days
}

// ==================== EMAIL SERVICE PROVIDERS ====================

// lib/email/providers/sendgrid-provider.ts
import sgMail from '@sendgrid/mail';

export class SendGridProvider implements EmailProvider {
  name = 'sendgrid' as const;

  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async send(email: Email): Promise<EmailResponse> {
    try {
      const msg = {
        to: email.to,
        from: email.from,
        subject: email.subject,
        html: email.html,
        text: email.text,
        trackingSettings: {
          clickTracking: { enable: email.trackingEnabled || true },
          openTracking: { enable: email.trackingEnabled || true }
        },
        customArgs: email.customArgs || {}
      };

      const response = await sgMail.send(msg);
      
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        provider: 'sendgrid'
      };
    } catch (error) {
      console.error('SendGrid email send failed:', error);
      return {
        success: false,
        error: error.message,
        provider: 'sendgrid'
      };
    }
  }

  async sendBulk(emails: Email[]): Promise<EmailResponse[]> {
    const responses = await Promise.allSettled(
      emails.map(email => this.send(email))
    );

    return responses.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: result.reason,
        provider: 'sendgrid'
      }
    );
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    // Implementation depends on SendGrid's Event Webhook or Activity API
    // For now, return a placeholder
    return {
      messageId,
      status: 'unknown',
      timestamp: new Date()
    };
  }
}

// lib/email/providers/resend-provider.ts
import { Resend } from 'resend';

export class ResendProvider implements EmailProvider {
  name = 'resend' as const;
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(email: Email): Promise<EmailResponse> {
    try {
      const response = await this.resend.emails.send({
        from: email.from,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text
      });

      return {
        success: true,
        messageId: response.data?.id,
        provider: 'resend'
      };
    } catch (error) {
      console.error('Resend email send failed:', error);
      return {
        success: false,
        error: error.message,
        provider: 'resend'
      };
    }
  }

  async sendBulk(emails: Email[]): Promise<EmailResponse[]> {
    const responses = await Promise.allSettled(
      emails.map(email => this.send(email))
    );

    return responses.map(result => 
      result.status === 'fulfilled' ? result.value : {
        success: false,
        error: result.reason,
        provider: 'resend'
      }
    );
  }

  async getDeliveryStatus(messageId: string): Promise<DeliveryStatus> {
    try {
      const email = await this.resend.emails.get(messageId);
      return {
        messageId,
        status: this.mapResendStatus(email.data?.last_event),
        timestamp: new Date(email.data?.created_at || Date.now())
      };
    } catch (error) {
      return {
        messageId,
        status: 'unknown',
        timestamp: new Date()
      };
    }
  }

  private mapResendStatus(event: string | undefined): DeliveryStatus['status'] {
    switch (event) {
      case 'delivered': return 'delivered';
      case 'opened': return 'opened';
      case 'clicked': return 'clicked';
      case 'bounced': return 'bounced';
      default: return 'sent';
    }
  }
}

// ==================== EMAIL TEMPLATE ENGINE ====================

// lib/email/email-templates.ts
export class EmailTemplateEngine {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.loadDefaultTemplates();
  }

  private loadDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'document_invitation',
        name: 'Document Signing Invitation',
        type: 'document_invitation',
        subject: 'Please sign: {{documentTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">BuffrSign</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Digital Signature Platform</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #333; margin-bottom: 20px;">{{senderName}} has requested your signature</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #666;"><strong>Document:</strong> {{documentTitle}}</p>
                <p style="margin: 10px 0 0 0; color: #666;"><strong>Due:</strong> {{expirationDate}}</p>
              </div>
              
              {{#if customMessage}}
              <div style="border-left: 4px solid #667eea; padding-left: 20px; margin: 20px 0;">
                <p style="color: #555; font-style: italic;">{{customMessage}}</p>
              </div>
              {{/if}}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{signingUrl}}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Review & Sign Document
                </a>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
                <p>This email was sent by BuffrSign on behalf of {{senderName}}.</p>
                <p>If you have questions, please contact {{senderEmail}}.</p>
              </div>
            </div>
          </div>
        `,
        textContent: `
Hi there,

{{senderName}} has requested your signature on the following document:

Document: {{documentTitle}}
Due: {{expirationDate}}

{{#if customMessage}}
Message from {{senderName}}: {{customMessage}}
{{/if}}

Please review and sign the document here: {{signingUrl}}

If you have questions, please contact {{senderEmail}}.

Best regards,
BuffrSign Team
        `,
        variables: [
          { name: 'recipientName', type: 'string', required: true },
          { name: 'senderName', type: 'string', required: true },
          { name: 'senderEmail', type: 'string', required: true },
          { name: 'documentTitle', type: 'string', required: true },
          { name: 'signingUrl', type: 'url', required: true },
          { name: 'expirationDate', type: 'date', required: true },
          { name: 'customMessage', type: 'string', required: false }
        ],
        isActive: true
      },
      {
        id: 'signature_reminder',
        name: 'Signature Reminder',
        type: 'signature_reminder',
        subject: 'Reminder: Please sign {{documentTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ff6b35; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Signature Reminder</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #333;">Don't forget to sign your document</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Hi {{recipientName}},<br><br>
                This is a friendly reminder that {{senderName}} is still waiting for your signature on:
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>{{documentTitle}}</strong></p>
                <p style="margin: 10px 0 0 0; color: #856404;">Due: {{expirationDate}}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{signingUrl}}" 
                   style="background: #ff6b35; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Sign Now
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: `
Hi {{recipientName}},

This is a friendly reminder that {{senderName}} is still waiting for your signature on:

Document: {{documentTitle}}
Due: {{expirationDate}}

Please sign the document here: {{signingUrl}}

Best regards,
BuffrSign Team
        `,
        variables: [
          { name: 'recipientName', type: 'string', required: true },
          { name: 'senderName', type: 'string', required: true },
          { name: 'documentTitle', type: 'string', required: true },
          { name: 'signingUrl', type: 'url', required: true },
          { name: 'expirationDate', type: 'date', required: true }
        ],
        isActive: true
      },
      {
        id: 'document_completed',
        name: 'Document Completed',
        type: 'document_completed',
        subject: 'Document completed: {{documentTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #00b894; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✓ Document Signed!</h1>
            </div>
            
            <div style="padding: 40px 30px;">
              <h2 style="color: #333;">Your document has been completed</h2>
              
              <p style="color: #666; line-height: 1.6;">
                Great news! All parties have signed <strong>{{documentTitle}}</strong>.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #155724;">
                  <strong>Status:</strong> Completed<br>
                  <strong>Completed on:</strong> {{completionDate}}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{documentUrl}}" 
                   style="background: #00b894; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;">
                  Download Signed Document
                </a>
              </div>
            </div>
          </div>
        `,
        textContent: `
Great news!

All parties have signed {{documentTitle}}.

Status: Completed
Completed on: {{completionDate}}

Download your signed document: {{documentUrl}}

Best regards,
BuffrSign Team
        `,
        variables: [
          { name: 'recipientName', type: 'string', required: true },
          { name: 'documentTitle', type: 'string', required: true },
          { name: 'completionDate', type: 'date', required: true },
          { name: 'documentUrl', type: 'url', required: true }
        ],
        isActive: true
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  generateEmail(templateId: string, data: Record<string, any>): { html: string; text: string; subject: string } {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Simple template engine (in production, use Handlebars or similar)
    const renderTemplate = (content: string): string => {
      let rendered = content;
      
      // Handle {{variable}} replacements
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, String(value || ''));
      });
      
      // Handle {{#if variable}} conditional blocks
      rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, block) => {
        return data[variable] ? block : '';
      });
      
      return rendered;
    };

    return {
      html: renderTemplate(template.htmlContent),
      text: renderTemplate(template.textContent),
      subject: renderTemplate(template.subject)
    };
  }

  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  updateTemplate(id: string, updates: Partial<EmailTemplate>): void {
    const existing = this.templates.get(id);
    if (existing) {
      this.templates.set(id, { ...existing, ...updates });
    }
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  listTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.isActive);
  }
}

// ==================== MAIN EMAIL SERVICE ====================

// lib/email/email-service.ts
import { createClient } from '@supabase/supabase-js';
import { SendGridProvider } from './providers/sendgrid-provider';
import { ResendProvider } from './providers/resend-provider';
import { EmailTemplateEngine } from './email-templates';

interface EmailServiceConfig {
  provider: 'sendgrid' | 'resend';
  apiKey: string;
  fromEmail: string;
  fromName?: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export class EmailService {
  private provider: EmailProvider;
  private templateEngine: EmailTemplateEngine;
  private supabase: any;
  private fromEmail: string;
  private fromName: string;

  constructor(config: EmailServiceConfig) {
    // Initialize email provider
    switch (config.provider) {
      case 'sendgrid':
        this.provider = new SendGridProvider(config.apiKey);
        break;
      case 'resend':
        this.provider = new ResendProvider(config.apiKey);
        break;
      default:
        throw new Error(`Unsupported email provider: ${config.provider}`);
    }

    this.templateEngine = new EmailTemplateEngine();
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName || 'BuffrSign';
  }

  // ==================== DOCUMENT WORKFLOW EMAILS ====================

  async sendDocumentInvitation(documentId: string, recipients: string[]): Promise<void> {
    try {
      // Get document and sender information
      const { data: document } = await this.supabase
        .from('documents')
        .select(`
          *,
          sender:profiles!documents_sender_id_fkey(full_name, email),
          recipients:document_recipients(*)
        `)
        .eq('id', documentId)
        .single();

      if (!document) throw new Error('Document not found');

      // Generate signing URLs and send invitations
      const emailPromises = recipients.map(async (recipientEmail) => {
        const recipient = document.recipients.find((r: any) => r.email === recipientEmail);
        if (!recipient) return;

        const signingUrl = this.generateSigningUrl(documentId, recipient.id);
        
        const templateData = {
          recipientName: recipient.name || recipientEmail,
          senderName: document.sender.full_name,
          senderEmail: document.sender.email,
          documentTitle: document.title,
          signingUrl,
          expirationDate: this.formatDate(document.expires_at),
          customMessage: document.message
        };

        const emailContent = this.templateEngine.generateEmail('document_invitation', templateData);
        
        const email: Email = {
          to: recipientEmail,
          from: `${this.fromName} <${this.fromEmail}>`,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          trackingEnabled: true,
          customArgs: {
            document_id: documentId,
            recipient_id: recipient.id,
            email_type: 'invitation'
          }
        };

        const response = await this.provider.send(email);
        
        // Log email notification
        await this.logEmailNotification({
          documentId,
          recipientId: recipient.id,
          emailType: 'document_invitation',
          emailAddress: recipientEmail,
          subject: email.subject,
          status: response.success ? 'sent' : 'failed',
          externalMessageId: response.messageId
        });

        return response;
      });

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Failed to send document invitation:', error);
      throw error;
    }
  }

  async sendSignatureReminder(documentId: string, recipientId: string): Promise<void> {
    try {
      const { data: document } = await this.supabase
        .from('documents')
        .select(`
          *,
          sender:profiles!documents_sender_id_fkey(full_name),
          recipients:document_recipients!inner(*)
        `)
        .eq('id', documentId)
        .eq('recipients.id', recipientId)
        .single();

      if (!document) throw new Error('Document or recipient not found');

      const recipient = document.recipients[0];
      
      // Check if reminder should be sent (respects user preferences)
      const shouldSend = await this.shouldSendReminder(recipient.email, documentId);
      if (!shouldSend) return;

      const signingUrl = this.generateSigningUrl(documentId, recipientId);
      
      const templateData = {
        recipientName: recipient.name || recipient.email,
        senderName: document.sender.full_name,
        documentTitle: document.title,
        signingUrl,
        expirationDate: this.formatDate(document.expires_at)
      };

      const emailContent = this.templateEngine.generateEmail('signature_reminder', templateData);
      
      const email: Email = {
        to: recipient.email,
        from: `${this.fromName} <${this.fromEmail}>`,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        trackingEnabled: true,
        customArgs: {
          document_id: documentId,
          recipient_id: recipientId,
          email_type: 'reminder'
        }
      };

      const response = await this.provider.send(email);
      
      await this.logEmailNotification({
        documentId,
        recipientId,
        emailType: 'signature_reminder',
        emailAddress: recipient.email,
        subject: email.subject,
        status: response.success ? 'sent' : 'failed',
        externalMessageId: response.messageId
      });

    } catch (error) {
      console.error('Failed to send signature reminder:', error);
      throw error;
    }
  }

  async sendDocumentCompleted(documentId: string): Promise<void> {
    try {
      const { data: document } = await this.supabase
        .from('documents')
        .select(`
          *,
          sender:profiles!documents_sender_id_fkey(full_name, email),
          recipients:document_recipients(*)
        `)
        .eq('id', documentId)
        .single();

      if (!document) throw new Error('Document not found');

      // Send completion notification to all parties (sender + recipients)
      const allParties = [
        { email: document.sender.email, name: document.sender.full_name },
        ...document.recipients.map((r: any) => ({ email: r.email, name: r.name }))
      ];

      const emailPromises = allParties.map(async (party) => {
        const templateData = {
          recipientName: party.name || party.email,
          documentTitle: document.title,
          completionDate: this.formatDate(document.completed_at || new Date()),
          documentUrl: this.generateDocumentDownloadUrl(documentId)
        };

        const emailContent = this.templateEngine.generateEmail('document_completed', templateData);
        
        const email: Email = {
          to: party.email,
          from: `${this.fromName} <${this.fromEmail}>`,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          trackingEnabled: true,
          customArgs: {
            document_id: documentId,
            email_type: 'completion'
          }
        };

        const response = await this.provider.send(email);
        
        await this.logEmailNotification({
          documentId,
          recipientId: party.email, // Use email as fallback for sender
          emailType: 'document_completed',
          emailAddress: party.email,
          subject: email.subject,
          status: response.success ? 'sent' : 'failed',
          externalMessageId: response.messageId
        });

        return response;
      });

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Failed to send document completion notification:', error);
      throw error;
    }
  }

  async sendDocumentExpired(documentId: string): Promise<void> {
    try {
      const { data: document } = await this.supabase
        .from('documents')
        .select(`
          *,
          sender:profiles!documents_sender_id_fkey(full_name, email),
          recipients:document_recipients(*)
        `)
        .eq('id', documentId)
        .single();

      if (!document) throw new Error('Document not found');

      // Send expiration notification to sender and unsigned recipients
      const unsignedRecipients = document.recipients.filter((r: any) => r.status !== 'signed');
      const parties = [
        { email: document.sender.email, name: document.sender.full_name, role: 'sender' },
        ...unsignedRecipients.map((r: any) => ({ email: r.email, name: r.name, role: 'recipient' }))
      ];

      const emailPromises = parties.map(async (party) => {
        // Use different template based on role
        const templateId = party.role === 'sender' ? 'document_expired_sender' : 'document_expired_recipient';
        
        const templateData = {
          recipientName: party.name || party.email,
          documentTitle: document.title,
          expirationDate: this.formatDate(document.expires_at),
          renewUrl: this.generateRenewalUrl(documentId)
        };

        // For this example, we'll use a basic expired template
        const subject = `Document expired: ${document.title}`;
        const html = `
          <h2>Document Expired</h2>
          <p>Hi ${party.name || party.email},</p>
          <p>The document "${document.title}" has expired on ${this.formatDate(document.expires_at)}.</p>
          ${party.role === 'sender' ? '<p><a href="' + templateData.renewUrl + '">Renew Document</a></p>' : ''}
        `;

        const email: Email = {
          to: party.email,
          from: `${this.fromName} <${this.fromEmail}>`,
          subject,
          html,
          text: html.replace(/<[^>]*>/g, ''), // Simple HTML to text conversion
          trackingEnabled: true,
          customArgs: {
            document_id: documentId,
            email_type: 'expiration'
          }
        };

        return await this.provider.send(email);
      });

      await Promise.all(emailPromises);
    } catch (error) {
      console.error('Failed to send document expiration notification:', error);
      throw error;
    }
  }

  // ==================== REMINDER SCHEDULING ====================

  async scheduleReminders(documentId: string): Promise<void> {
    try {
      const { data: document } = await this.supabase
        .from('documents')
        .select('*, recipients:document_recipients(*)')
        .eq('id', documentId)
        .single();

      if (!document || !document.expires_at) return;

      const expirationDate = new Date(document.expires_at);
      const now = new Date();
      const timeUntilExpiration = expirationDate.getTime() - now.getTime();
      const daysUntilExpiration = Math.ceil(timeUntilExpiration / (1000 * 60 * 60 * 24));

      // Schedule reminders at strategic intervals
      const reminderSchedule = this.calculateReminderSchedule(daysUntilExpiration);
      
      for (const reminderDay of reminderSchedule) {
        const reminderDate = new Date();
        reminderDate.setDate(now.getDate() + reminderDay);
        
        // Insert reminder jobs into database
        await this.supabase
          .from('scheduled_reminders')
          .insert({
            document_id: documentId,
            scheduled_for: reminderDate.toISOString(),
            reminder_type: 'signature_reminder',
            status: 'pending'
          });
      }
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
    }
  }

  private calculateReminderSchedule(daysUntilExpiration: number): number[] {
    const schedule: number[] = [];
    
    if (daysUntilExpiration > 7) {
      schedule.push(3); // 3 days after sending
      schedule.push(Math.floor(daysUntilExpiration / 2)); // Halfway point
      schedule.push(daysUntilExpiration - 2); // 2 days before expiration
    } else if (daysUntilExpiration > 3) {
      schedule.push(1); // 1 day after sending
      schedule.push(daysUntilExpiration - 1); // 1 day before expiration
    } else {
      schedule.push(1); // 1 day after sending only
    }
    
    return schedule.filter(day => day > 0 && day < daysUntilExpiration);
  }

  // ==================== UTILITY METHODS ====================

  private generateSigningUrl(documentId: string, recipientId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buffrsign.ai';
    return `${baseUrl}/sign/${documentId}?recipient=${recipientId}`;
  }

  private generateDocumentDownloadUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buffrsign.ai';
    return `${baseUrl}/documents/${documentId}/download`;
  }

  private generateRenewalUrl(documentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buffrsign.ai';
    return `${baseUrl}/documents/${documentId}/renew`;
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-NA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private async shouldSendReminder(email: string, documentId: string): Promise<boolean> {
    try {
      // Check user preferences
      const { data: user } = await this.supabase
        .from('profiles')
        .select('*, email_preferences:user_email_preferences(*)')
        .eq('email', email)
        .single();

      if (!user?.email_preferences?.receive_reminders) {
        return false;
      }

      // Check last reminder sent
      const { data: lastReminder } = await this.supabase
        .from('email_notifications')
        .select('sent_at')
        .eq('document_id', documentId)
        .eq('email_address', email)
        .eq('email_type', 'signature_reminder')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (lastReminder) {
        const daysSinceLastReminder = Math.floor(
          (Date.now() - new Date(lastReminder.sent_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const reminderFrequency = user.email_preferences.reminder_frequency || 2;
        return daysSinceLastReminder >= reminderFrequency;
      }

      return true;
    } catch (error) {
      console.error('Error checking reminder eligibility:', error);
      return true; // Default to sending if we can't check
    }
  }

  private async logEmailNotification(notification: Omit<EmailNotification, 'id' | 'sentAt'>): Promise<void> {
    try {
      await this.supabase
        .from('email_notifications')
        .insert({
          document_id: notification.documentId,
          recipient_id: notification.recipientId,
          email_type: notification.emailType,
          email_address: notification.emailAddress,
          subject: notification.subject,
          status: notification.status,
          external_message_id: notification.externalMessageId
        });
    } catch (error) {
      console.error('Failed to log email notification:', error);
    }
  }

  // ==================== WEBHOOK HANDLERS ====================

  async handleEmailWebhook(payload: any): Promise<void> {
    try {
      // Handle SendGrid webhook events
      if (payload.length) {
        for (const event of payload) {
          await this.processEmailEvent(event);
        }
      } else {
        // Handle single event (Resend format)
        await this.processEmailEvent(payload);
      }
    } catch (error) {
      console.error('Failed to process email webhook:', error);
    }
  }

  private async processEmailEvent(event: any): Promise<void> {
    const messageId = event.sg_message_id || event.message_id || event.id;
    if (!messageId) return;

    let status: string;
    let timestamp: Date;

    // Map event types to our status system
    switch (event.event || event.type) {
      case 'delivered':
        status = 'delivered';
        timestamp = new Date(event.timestamp * 1000 || event.created_at);
        break;
      case 'open':
        status = 'opened';
        timestamp = new Date(event.timestamp * 1000 || event.created_at);
        break;
      case 'click':
        status = 'clicked';
        timestamp = new Date(event.timestamp * 1000 || event.created_at);
        break;
      case 'bounce':
        status = 'bounced';
        timestamp = new Date(event.timestamp * 1000 || event.created_at);
        break;
      default:
        return; // Ignore unknown events
    }

    // Update email notification status
    await this.supabase
      .from('email_notifications')
      .update({
        status,
        [`${status}_at`]: timestamp.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('external_message_id', messageId);
  }

  // ==================== ANALYTICS AND REPORTING ====================

  async getEmailAnalytics(documentId?: string, startDate?: Date, endDate?: Date): Promise<EmailAnalytics> {
    try {
      let query = this.supabase
        .from('email_notifications')
        .select('*');

      if (documentId) {
        query = query.eq('document_id', documentId);
      }

      if (startDate) {
        query = query.gte('sent_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('sent_at', endDate.toISOString());
      }

      const { data: notifications } = await query;

      if (!notifications) return this.getEmptyAnalytics();

      const totalSent = notifications.length;
      const delivered = notifications.filter(n => n.delivered_at).length;
      const opened = notifications.filter(n => n.opened_at).length;
      const clicked = notifications.filter(n => n.clicked_at).length;
      const bounced = notifications.filter(n => n.status === 'bounced').length;

      return {
        totalSent,
        deliveryRate: totalSent > 0 ? (delivered / totalSent) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
        bounceRate: totalSent > 0 ? (bounced / totalSent) * 100 : 0,
        conversionRate: 0 // Would need to calculate from document signatures
      };
    } catch (error) {
      console.error('Failed to get email analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  private getEmptyAnalytics(): EmailAnalytics {
    return {
      totalSent: 0,
      deliveryRate: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      conversionRate: 0
    };
  }
}

// ==================== REACT HOOKS ====================

// lib/email/hooks/use-email-notifications.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';

interface UseEmailNotificationsReturn {
  notifications: EmailNotification[];
  loading: boolean;
  error: string | null;
  sendDocumentInvitation: (documentId: string, recipients: string[]) => Promise<void>;
  sendReminder: (documentId: string, recipientId: string) => Promise<void>;
  analytics: EmailAnalytics | null;
}

export function useEmailNotifications(documentId?: string): UseEmailNotificationsReturn {
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSupabaseClient } = useAuth();

  // Initialize email service
  const emailService = new EmailService({
    provider: 'sendgrid', // or 'resend'
    apiKey: process.env.SENDGRID_API_KEY || process.env.RESEND_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@buffrsign.ai',
    fromName: 'BuffrSign',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  });

  useEffect(() => {
    if (documentId) {
      fetchNotifications();
      fetchAnalytics();
    }
  }, [documentId]);

  const fetchNotifications = async () => {
    if (!documentId) return;
    
    try {
      setLoading(true);
      const supabase = getSupabaseClient();
      
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('document_id', documentId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    if (!documentId) return;
    
    try {
      const analyticsData = await emailService.getEmailAnalytics(documentId);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to fetch email analytics:', err);
    }
  };

  const sendDocumentInvitation = async (docId: string, recipients: string[]) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.sendDocumentInvitation(docId, recipients);
      if (docId === documentId) {
        await fetchNotifications();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (docId: string, recipientId: string) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.sendSignatureReminder(docId, recipientId);
      if (docId === documentId) {
        await fetchNotifications();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reminder');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    notifications,
    loading,
    error,
    sendDocumentInvitation,
    sendReminder,
    analytics
  };
}

// ==================== API ROUTES ====================

// pages/api/email/send-invitation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { EmailService } from '@/lib/email/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { documentId, recipients } = req.body;

    if (!documentId || !recipients || !Array.isArray(recipients)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const emailService = new EmailService({
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@buffrsign.ai',
      fromName: 'BuffrSign',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    });

    await emailService.sendDocumentInvitation(documentId, recipients);

    res.status(200).json({ success: true, message: 'Invitations sent successfully' });
  } catch (error) {
    console.error('Email invitation API error:', error);
    res.status(500).json({ error: 'Failed to send invitations' });
  }
}

// pages/api/email/webhook.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { EmailService } from '@/lib/email/email-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const emailService = new EmailService({
      provider: 'sendgrid',
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.FROM_EMAIL || 'noreply@buffrsign.ai',
      fromName: 'BuffrSign',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    });

    await emailService.handleEmailWebhook(req.body);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Email webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// ==================== SUPPORTING TYPES ====================

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

interface DeliveryStatus {
  messageId: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'unknown';
  timestamp: Date;
}

interface BrandingOptions {
  primaryColor?: string;
  logo?: string;
  companyName?: string;
}

interface EmailAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  conversionRate: number;
}; -- ===================================================================
-- BuffrSign Email System Database Schema & Migrations
-- Complete database setup for email notification system
-- ===================================================================

-- Migration: Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  recipient_id UUID, -- Can reference document_recipients(id) or be null for senders
  email_type VARCHAR(50) NOT NULL CHECK (email_type IN (
    'document_invitation',
    'signature_reminder', 
    'document_signed',
    'document_completed',
    'document_expired',
    'document_rejected',
    'document_viewed'
  )),
  email_address VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  html_content TEXT,
  text_content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN (
    'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  )),
  external_message_id VARCHAR(255), -- SendGrid/Resend message ID
  provider VARCHAR(20) DEFAULT 'sendgrid' CHECK (provider IN ('sendgrid', 'resend', 'ses')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_document_id ON email_notifications(document_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_id ON email_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_email_address ON email_notifications(email_address);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_email_notifications_email_type ON email_notifications(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_sent_at ON email_notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_external_message_id ON email_notifications(external_message_id);

-- Migration: Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN (
    'document_invitation',
    'signature_reminder',
    'document_signed',
    'document_completed',
    'document_expired',
    'document_rejected',
    'document_viewed',
    'welcome_email',
    'password_reset'
  )),
  subject_template TEXT NOT NULL,
  html_template TEXT NOT NULL,
  text_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  branding_options JSONB DEFAULT '{}'::jsonb,
  locale VARCHAR(10) DEFAULT 'en-NA',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for email templates
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_email_templates_locale ON email_templates(locale);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_templates_default ON email_templates(is_default);

-- Migration: Create user_email_preferences table
CREATE TABLE IF NOT EXISTS user_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receive_invitations BOOLEAN DEFAULT true,
  receive_reminders BOOLEAN DEFAULT true,
  receive_status_updates BOOLEAN DEFAULT true,
  receive_marketing BOOLEAN DEFAULT false,
  reminder_frequency INTEGER DEFAULT 2 CHECK (reminder_frequency > 0), -- days between reminders
  preferred_language VARCHAR(10) DEFAULT 'en-NA',
  timezone VARCHAR(50) DEFAULT 'Africa/Windhoek',
  email_format VARCHAR(10) DEFAULT 'html' CHECK (email_format IN ('html', 'text')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for user email preferences
CREATE INDEX IF NOT EXISTS idx_user_email_preferences_user_id ON user_email_preferences(user_id);

-- Migration: Create scheduled_reminders table
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  recipient_id UUID, -- Can reference document_recipients(id)
  reminder_type VARCHAR(50) NOT NULL CHECK (reminder_type IN (
    'signature_reminder',
    'expiration_warning',
    'final_notice'
  )),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'cancelled'
  )),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for scheduled reminders
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_document_id ON scheduled_reminders(document_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_scheduled_for ON scheduled_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_reminders_status ON scheduled_reminders(status);

-- Migration: Create email_analytics table for aggregated stats
CREATE TABLE IF NOT EXISTS email_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  delivery_rate DECIMAL(5,2) DEFAULT 0.00,
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  click_rate DECIMAL(5,2) DEFAULT 0.00,
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, email_type)
);

-- Create indexes for email analytics
CREATE INDEX IF NOT EXISTS idx_email_analytics_date ON email_analytics(date);
CREATE INDEX IF NOT EXISTS idx_email_analytics_type ON email_analytics(email_type);

-- Migration: Create email_blacklist table for bounced/invalid emails
CREATE TABLE IF NOT EXISTS email_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address VARCHAR(255) NOT NULL UNIQUE,
  reason VARCHAR(50) NOT NULL CHECK (reason IN (
    'bounced', 'complained', 'unsubscribed', 'invalid', 'blocked'
  )),
  blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  blacklisted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email blacklist
CREATE INDEX IF NOT EXISTS idx_email_blacklist_email ON email_blacklist(email_address);
CREATE INDEX IF NOT EXISTS idx_email_blacklist_active ON email_blacklist(is_active);

-- ===================================================================
-- Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS on all email tables
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_blacklist ENABLE ROW LEVEL SECURITY;

-- Email notifications policies
CREATE POLICY "Users can view their document email notifications" ON email_notifications
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents 
      WHERE sender_id = auth.uid() 
      OR id IN (
        SELECT document_id FROM document_recipients 
        WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "Service role can manage all email notifications" ON email_notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Email templates policies  
CREATE POLICY "Users can view active email templates" ON email_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- User email preferences policies
CREATE POLICY "Users can manage their own email preferences" ON user_email_preferences
  FOR ALL USING (user_id = auth.uid());

-- Scheduled reminders policies
CREATE POLICY "Users can view reminders for their documents" ON scheduled_reminders
  FOR SELECT USING (
    document_id IN (
      SELECT id FROM documents WHERE sender_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all scheduled reminders" ON scheduled_reminders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Email analytics policies
CREATE POLICY "Admins can view email analytics" ON email_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Email blacklist policies
CREATE POLICY "Service role can manage email blacklist" ON email_blacklist
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ===================================================================
-- Triggers and Functions
-- ===================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_email_notifications_updated_at BEFORE UPDATE ON email_notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_email_preferences_updated_at BEFORE UPDATE ON user_email_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_reminders_updated_at BEFORE UPDATE ON scheduled_reminders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_analytics_updated_at BEFORE UPDATE ON email_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_blacklist_updated_at BEFORE UPDATE ON email_blacklist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default email preferences for new users
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO user_email_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$ language 'plpgsql';

-- Trigger to create default email preferences when user signs up
CREATE TRIGGER create_user_email_preferences_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_email_preferences();

-- Function to update email analytics daily
CREATE OR REPLACE FUNCTION update_daily_email_analytics()
RETURNS void AS $
DECLARE
    analytics_date DATE;
    email_type_record RECORD;
BEGIN
    analytics_date := CURRENT_DATE - INTERVAL '1 day';
    
    -- Loop through each email type
    FOR email_type_record IN 
        SELECT DISTINCT email_type FROM email_notifications 
        WHERE sent_at::date = analytics_date
    LOOP
        INSERT INTO email_analytics (
            date, email_type, total_sent, total_delivered, 
            total_opened, total_clicked, total_bounced, total_failed,
            delivery_rate, open_rate, click_rate, bounce_rate
        )
        SELECT 
            analytics_date,
            email_type_record.email_type,
            COUNT(*) as total_sent,
            COUNT(*) FILTER (WHERE status = 'delivered') as total_delivered,
            COUNT(*) FILTER (WHERE status = 'opened') as total_opened,
            COUNT(*) FILTER (WHERE status = 'clicked') as total_clicked,
            COUNT(*) FILTER (WHERE status = 'bounced') as total_bounced,
            COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
            CASE WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*)), 2)
                ELSE 0 
            END as delivery_rate,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'delivered') > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'opened') * 100.0 / COUNT(*) FILTER (WHERE status = 'delivered')), 2)
                ELSE 0
            END as open_rate,
            CASE WHEN COUNT(*) FILTER (WHERE status = 'opened') > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'clicked') * 100.0 / COUNT(*) FILTER (WHERE status = 'opened')), 2)
                ELSE 0
            END as click_rate,
            CASE WHEN COUNT(*) > 0 THEN
                ROUND((COUNT(*) FILTER (WHERE status = 'bounced') * 100.0 / COUNT(*)), 2)
                ELSE 0
            END as bounce_rate
        FROM email_notifications 
        WHERE sent_at::date = analytics_date 
        AND email_type = email_type_record.email_type
        ON CONFLICT (date, email_type) 
        DO UPDATE SET
            total_sent = EXCLUDED.total_sent,
            total_delivered = EXCLUDED.total_delivered,
            total_opened = EXCLUDED.total_opened,
            total_clicked = EXCLUDED.total_clicked,
            total_bounced = EXCLUDED.total_bounced,
            total_failed = EXCLUDED.total_failed,
            delivery_rate = EXCLUDED.delivery_rate,
            open_rate = EXCLUDED.open_rate,
            click_rate = EXCLUDED.click_rate,
            bounce_rate = EXCLUDED.bounce_rate,
            updated_at = NOW();
    END LOOP;
END;
$ language 'plpgsql';

-- Function to process scheduled reminders
CREATE OR REPLACE FUNCTION process_scheduled_reminders()
RETURNS void AS $
DECLARE
    reminder_record RECORD;
BEGIN
    -- Get all pending reminders that are due
    FOR reminder_record IN 
        SELECT * FROM scheduled_reminders 
        WHERE status = 'pending' 
        AND scheduled_for <= NOW()
        AND attempts < 3
    LOOP
        -- Update reminder status to indicate processing
        UPDATE scheduled_reminders 
        SET 
            status = 'sent',
            attempts = attempts + 1,
            last_attempt_at = NOW(),
            updated_at = NOW()
        WHERE id = reminder_record.id;
        
        -- The actual email sending would be handled by the application
        -- This function just marks reminders as ready for processing
    END LOOP;
END;
$ language 'plpgsql';

-- ===================================================================
-- Default Data Insertion
-- ===================================================================

-- Insert default email templates
INSERT INTO email_templates (name, template_type, subject_template, html_template, text_template, variables, is_default, locale) 
VALUES 
  (
    'Default Document Invitation',
    'document_invitation',
    'Please sign: {{documentTitle}}',
    '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Signature Request</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">BuffrSign</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Digital Signature Platform</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">{{senderName}} has requested your signature</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 16px;"><strong>Document:</strong> {{documentTitle}}</p>
                <p style="margin: 0; color: #666; font-size: 16px;"><strong>Due:</strong> {{expirationDate}}</p>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="{{signingUrl}}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;
                          text-transform: uppercase;
                          letter-spacing: 1px;">
                  Review & Sign Document
                </a>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
                <p style="margin: 0 0 10px 0;">This email was sent by BuffrSign on behalf of {{senderName}}.</p>
                <p style="margin: 0;">If you have questions, please contact {{senderEmail}}.</p>
            </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
            <p style="margin: 0; color: #666; font-size: 12px;">
                © 2025 BuffrSign. All rights reserved.<br>
                Windhoek, Namibia
            </p>
        </div>
    </body>
    </html>',
    'Hi {{recipientName}},

{{senderName}} has requested your signature on the following document:

Document: {{documentTitle}}
Due: {{expirationDate}}

Please review and sign the document here: {{signingUrl}}

If you have questions, please contact {{senderEmail}}.

Best regards,
BuffrSign Team

---
This email was sent by BuffrSign on behalf of {{senderName}}.
© 2025 BuffrSign. All rights reserved.',
    '[
      {"name": "recipientName", "type": "string", "required": true},
      {"name": "senderName", "type": "string", "required": true},
      {"name": "senderEmail", "type": "string", "required": true},
      {"name": "documentTitle", "type": "string", "required": true},
      {"name": "signingUrl", "type": "url", "required": true},
      {"name": "expirationDate", "type": "date", "required": true},
      {"name": "customMessage", "type": "string", "required": false}
    ]'::jsonb,
    true,
    'en-NA'
  ),
  (
    'Default Signature Reminder',
    'signature_reminder', 
    'Reminder: Please sign {{documentTitle}}',
    '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Signature Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ff6b35; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">⏰ Signature Reminder</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Don''t forget to sign your document</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Hi {{recipientName}},<br><br>
                This is a friendly reminder that {{senderName}} is still waiting for your signature on:
            </p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: bold;">{{documentTitle}}</p>
                <p style="margin: 0; color: #856404; font-size: 14px;">Due: {{expirationDate}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{signingUrl}}" 
                   style="background: #ff6b35; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;
                          text-transform: uppercase;">
                  Sign Now
                </a>
            </div>
        </div>
    </body>
    </html>',
    'Hi {{recipientName}},

This is a friendly reminder that {{senderName}} is still waiting for your signature on:

Document: {{documentTitle}}
Due: {{expirationDate}}

Please sign the document here: {{signingUrl}}

Best regards,
BuffrSign Team',
    '[
      {"name": "recipientName", "type": "string", "required": true},
      {"name": "senderName", "type": "string", "required": true},
      {"name": "documentTitle", "type": "string", "required": true},
      {"name": "signingUrl", "type": "url", "required": true},
      {"name": "expirationDate", "type": "date", "required": true}
    ]'::jsonb,
    true,
    'en-NA'
  ),
  (
    'Default Document Completed',
    'document_completed',
    'Document completed: {{documentTitle}}',
    '<!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document Completed</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #00b894; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✅ Document Signed!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
            <h2 style="color: #333; margin-bottom: 20px;">Your document has been completed</h2>
            
            <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Great news! All parties have signed <strong>{{documentTitle}}</strong>.
            </p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #155724; font-size: 16px;">
                  <strong>Status:</strong> Completed<br>
                  <strong>Completed on:</strong> {{completionDate}}
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{documentUrl}}" 
                   style="background: #00b894; 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          display: inline-block; 
                          font-weight: bold;
                          font-size: 16px;
                          text-transform: uppercase;">
                  Download Signed Document
                </a>
            </div>
        </div>
    </body>
    </html>',
    'Great news!

All parties have signed {{documentTitle}}.

Status: Completed
Completed on: {{completionDate}}

Download your signed document: {{documentUrl}}

Best regards,
BuffrSign Team',
    '[
      {"name": "recipientName", "type": "string", "required": true},
      {"name": "documentTitle", "type": "string", "required": true},
      {"name": "completionDate", "type": "date", "required": true},
      {"name": "documentUrl", "type": "url", "required": true}
    ]'::jsonb,
    true,
    'en-NA'
  )
ON CONFLICT (name) DO NOTHING;

-- ===================================================================
-- Views for Common Queries
-- ===================================================================

-- View for email notification statistics
CREATE OR REPLACE VIEW email_notification_stats AS
SELECT 
    document_id,
    email_type,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE status = 'opened') as opened,
    COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(
        CASE WHEN COUNT(*) > 0 THEN 
            (COUNT(*) FILTER (WHERE status = 'delivered') * 100.0 / COUNT(*))
            ELSE 0 
        END, 2
    ) as delivery_rate,
    ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE status = 'delivered') > 0 THEN
            (COUNT(*) FILTER (WHERE status = 'opened') * 100.0 / COUNT(*) FILTER (WHERE status = 'delivered'))
            ELSE 0
        END, 2
    ) as open_rate,
    ROUND(
        CASE WHEN COUNT(*) FILTER (WHERE status = 'opened') > 0 THEN
            (COUNT(*) FILTER (WHERE status = 'clicked') * 100.0 / COUNT(*) FILTER (WHERE status = 'opened'))
            ELSE 0
        END, 2
    ) as click_rate
FROM email_notifications
GROUP BY document_id, email_type;

-- View for recent email activity
CREATE OR REPLACE VIEW recent_email_activity AS
SELECT 
    en.*,
    d.title as document_title,
    p.full_name as sender_name
FROM email_notifications en
JOIN documents d ON en.document_id = d.id
JOIN profiles p ON d.sender_id = p.id
WHERE en.sent_at >= NOW() - INTERVAL '30 days'
ORDER BY en.sent_at DESC;

-- ===================================================================
-- Performance Optimization
-- ===================================================================

-- Partitioning for email_notifications table (optional for high volume)
-- This would be implemented if we expect very high email volumes
-- CREATE TABLE email_notifications_2025_01 PARTITION OF email_notifications
--     FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Additional indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_notifications_document_status ON email_notifications(document_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_notifications_type_status ON email_notifications(email_type, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_notifications_sent_at_desc ON email_notifications(sent_at DESC);

-- Composite index for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_notifications_analytics ON email_notifications(sent_at, email_type, status);

-- ===================================================================
-- Security and Audit Functions
-- ===================================================================

-- Function to log sensitive email operations
CREATE OR REPLACE FUNCTION log_email_operation(
    operation_type VARCHAR,
    email_address VARCHAR,
    document_id UUID,
    user_id UUID DEFAULT auth.uid()
)
RETURNS void AS $
BEGIN
    INSERT INTO audit_logs (
        table_name,
        operation_type,
        record_id,
        user_id,
        changes,
        created_at
    ) VALUES (
        'email_notifications',
        operation_type,
        document_id,
        user_id,
        jsonb_build_object(
            'email_address', email_address,
            'document_id', document_id,
            'timestamp', NOW()
        ),
        NOW()
    );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if email is blacklisted
CREATE OR REPLACE FUNCTION is_email_blacklisted(email_addr VARCHAR)
RETURNS BOOLEAN AS $
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM email_blacklist 
        WHERE email_address = email_addr 
        AND is_active = true
    );
END;
$ LANGUAGE plpgsql;

-- Function to add email to blacklist
CREATE OR REPLACE FUNCTION blacklist_email(
    email_addr VARCHAR,
    blacklist_reason VARCHAR,
    notes_text TEXT DEFAULT NULL
)
RETURNS void AS $
BEGIN
    INSERT INTO email_blacklist (
        email_address,
        reason,
        blacklisted_by,
        notes
    ) VALUES (
        email_addr,
        blacklist_reason,
        auth.uid(),
        notes_text
    )
    ON CONFLICT (email_address) 
    DO UPDATE SET
        reason = EXCLUDED.reason,
        is_active = true,
        blacklisted_at = NOW(),
        blacklisted_by = auth.uid(),
        notes = EXCLUDED.notes,
        updated_at = NOW();
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- Email Queue Management
-- ===================================================================

-- Create email queue table for reliable email delivery
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 = highest priority
    email_data JSONB NOT NULL,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'cancelled')),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for email queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status_priority ON email_queue(status, priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_attempts ON email_queue(attempts);

-- Function to enqueue email
CREATE OR REPLACE FUNCTION enqueue_email(
    email_json JSONB,
    priority_level INTEGER DEFAULT 5,
    schedule_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS UUID AS $
DECLARE
    queue_id UUID;
BEGIN
    INSERT INTO email_queue (
        email_data,
        priority,
        scheduled_for
    ) VALUES (
        email_json,
        priority_level,
        schedule_time
    ) RETURNING id INTO queue_id;
    
    RETURN queue_id;
END;
$ LANGUAGE plpgsql;

-- Function to process email queue
CREATE OR REPLACE FUNCTION process_email_queue(batch_size INTEGER DEFAULT 10)
RETURNS TABLE(
    queue_id UUID,
    email_data JSONB,
    attempts INTEGER
) AS $
BEGIN
    -- Update status to processing and return batch
    RETURN QUERY
    UPDATE email_queue 
    SET 
        status = 'processing',
        updated_at = NOW()
    WHERE id IN (
        SELECT eq.id 
        FROM email_queue eq
        WHERE eq.status = 'queued'
        AND eq.scheduled_for <= NOW()
        AND eq.attempts < eq.max_attempts
        ORDER BY eq.priority ASC, eq.scheduled_for ASC
        LIMIT batch_size
    )
    RETURNING email_queue.id, email_queue.email_data, email_queue.attempts;
END;
$ LANGUAGE plpgsql;

-- Function to mark email queue item as completed
CREATE OR REPLACE FUNCTION complete_email_queue_item(
    queue_id UUID,
    success BOOLEAN,
    error_msg TEXT DEFAULT NULL
)
RETURNS void AS $
BEGIN
    IF success THEN
        UPDATE email_queue 
        SET 
            status = 'sent',
            processed_at = NOW(),
            updated_at = NOW()
        WHERE id = queue_id;
    ELSE
        UPDATE email_queue 
        SET 
            status = CASE 
                WHEN attempts + 1 >= max_attempts THEN 'failed'
                ELSE 'queued'
            END,
            attempts = attempts + 1,
            error_message = error_msg,
            scheduled_for = CASE 
                WHEN attempts + 1 < max_attempts THEN NOW() + INTERVAL '5 minutes' * POWER(2, attempts)
                ELSE scheduled_for
            END,
            updated_at = NOW()
        WHERE id = queue_id;
    END IF;
END;
$ LANGUAGE plpgsql;

-- ===================================================================
-- Email Template Management Functions
-- ===================================================================

-- Function to get active template by type and locale
CREATE OR REPLACE FUNCTION get_email_template(
    template_type_param VARCHAR,
    locale_param VARCHAR DEFAULT 'en-NA'
)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    subject_template TEXT,
    html_template TEXT,
    text_template TEXT,
    variables JSONB
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        et.id,
        et.name,
        et.subject_template,
        et.html_template,
        et.text_template,
        et.variables
    FROM email_templates et
    WHERE et.template_type = template_type_param
    AND et.locale = locale_param
    AND et.is_active = true
    ORDER BY et.is_default DESC, et.created_at DESC
    LIMIT 1;
    
    -- If no template found for specific locale, try default locale
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            et.id,
            et.name,
            et.subject_template,
            et.html_template,
            et.text_template,
            et.variables
        FROM email_templates et
        WHERE et.template_type = template_type_param
        AND et.locale = 'en-NA'
        AND et.is_active = true
        ORDER BY et.is_default DESC, et.created_at DESC
        LIMIT 1;
    END IF;
END;
$ LANGUAGE plpgsql;

-- ===================================================================
-- Maintenance and Cleanup Functions
-- ===================================================================

-- Function to clean up old email notifications (keep for audit compliance)
CREATE OR REPLACE FUNCTION cleanup_old_email_notifications(
    retention_days INTEGER DEFAULT 365
)
RETURNS INTEGER AS $
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Archive old notifications to a separate table if needed
    -- For now, we'll keep them for audit purposes
    
    -- Clean up failed queue items older than 30 days
    DELETE FROM email_queue 
    WHERE status = 'failed' 
    AND created_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Clean up completed queue items older than 7 days
    DELETE FROM email_queue 
    WHERE status = 'sent' 
    AND processed_at < NOW() - INTERVAL '7 days';
    
    RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- Function to update email analytics (to be run daily)
CREATE OR REPLACE FUNCTION refresh_email_analytics()
RETURNS void AS $
BEGIN
    -- Call the existing function
    PERFORM update_daily_email_analytics();
    
    -- Clean up old analytics data (keep 2 years)
    DELETE FROM email_analytics 
    WHERE date < CURRENT_DATE - INTERVAL '2 years';
    
    -- Update aggregate statistics
    REFRESH MATERIALIZED VIEW IF EXISTS email_performance_summary;
END;
$ LANGUAGE plpgsql;

-- ===================================================================
-- Materialized Views for Performance
-- ===================================================================

-- Materialized view for email performance summary
CREATE MATERIALIZED VIEW IF NOT EXISTS email_performance_summary AS
SELECT 
    DATE_TRUNC('month', sent_at) as month,
    email_type,
    COUNT(*) as total_emails,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE status = 'opened') as opened,
    COUNT(*) FILTER (WHERE status = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
    ROUND(AVG(
        CASE WHEN status = 'delivered' THEN 100.0 ELSE 0 END
    ), 2) as avg_delivery_rate,
    ROUND(AVG(
        CASE WHEN status = 'opened' THEN 100.0 ELSE 0 END
    ), 2) as avg_open_rate
FROM email_notifications
WHERE sent_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY DATE_TRUNC('month', sent_at), email_type
ORDER BY month DESC, email_type;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_email_performance_summary_month ON email_performance_summary(month);
CREATE INDEX IF NOT EXISTS idx_email_performance_summary_type ON email_performance_summary(email_type);

-- ===================================================================
-- Scheduled Jobs (to be run via cron or scheduler)
-- ===================================================================

-- Daily maintenance job
CREATE OR REPLACE FUNCTION daily_email_maintenance()
RETURNS void AS $
BEGIN
    -- Update analytics
    PERFORM refresh_email_analytics();
    
    -- Process any pending reminders
    PERFORM process_scheduled_reminders();
    
    -- Clean up old data
    PERFORM cleanup_old_email_notifications();
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY email_performance_summary;
    
    -- Log maintenance completion
    INSERT INTO system_logs (component, message, created_at) 
    VALUES ('email_system', 'Daily email maintenance completed', NOW());
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail
        INSERT INTO system_logs (component, message, log_level, created_at) 
        VALUES ('email_system', 'Daily email maintenance failed: ' || SQLERRM, 'ERROR', NOW());
END;
$ LANGUAGE plpgsql;

-- ===================================================================
-- Email System Configuration Table
-- ===================================================================

CREATE TABLE IF NOT EXISTS email_system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO email_system_config (config_key, config_value, description) VALUES
(
    'default_sender',
    '{"email": "noreply@buffrsign.ai", "name": "BuffrSign"}'::jsonb,
    'Default sender information for all system emails'
),
(
    'provider_settings',
    '{
        "primary": "sendgrid",
        "fallback": "resend",
        "retry_attempts": 3,
        "retry_delay_minutes": [5, 15, 60]
    }'::jsonb,
    'Email provider configuration and retry settings'
),
(
    'rate_limits',
    '{
        "per_minute": 100,
        "per_hour": 3000,
        "per_day": 50000
    }'::jsonb,
    'Rate limiting configuration for email sending'
),
(
    'template_defaults',
    '{
        "locale": "en-NA",
        "timezone": "Africa/Windhoek",
        "date_format": "YYYY-MM-DD HH:mm:ss",
        "currency": "NAD"
    }'::jsonb,
    'Default values for email template rendering'
)
ON CONFLICT (config_key) DO NOTHING;

-- Function to get email system configuration
CREATE OR REPLACE FUNCTION get_email_config(key VARCHAR)
RETURNS JSONB AS $
DECLARE
    config_value JSONB;
BEGIN
    SELECT esc.config_value INTO config_value
    FROM email_system_config esc
    WHERE esc.config_key = key
    AND esc.is_active = true;
    
    RETURN COALESCE(config_value, '{}'::jsonb);
END;
$ LANGUAGE plpgsql;

-- ===================================================================
-- Final Setup and Validation
-- ===================================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT ON email_notifications TO authenticated;
GRANT SELECT ON email_templates TO authenticated;
GRANT ALL ON user_email_preferences TO authenticated;
GRANT SELECT ON email_analytics TO authenticated;

-- Grant service role permissions for email processing
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create comments on tables for documentation
COMMENT ON TABLE email_notifications IS 'Tracks all email notifications sent through the system with delivery status';
COMMENT ON TABLE email_templates IS 'Stores email templates for different notification types and locales';
COMMENT ON TABLE user_email_preferences IS 'User-specific email preferences and notification settings';
COMMENT ON TABLE scheduled_reminders IS 'Queue of scheduled reminder emails to be sent';
COMMENT ON TABLE email_analytics IS 'Daily aggregated email performance statistics';
COMMENT ON TABLE email_blacklist IS 'Blacklisted email addresses that should not receive emails';
COMMENT ON TABLE email_queue IS 'Queue for reliable email delivery with retry logic';
COMMENT ON TABLE email_system_config IS 'System-wide email configuration settings';

-- Validation function to check email system health
CREATE OR REPLACE FUNCTION validate_email_system()
RETURNS TABLE(
    component VARCHAR,
    status VARCHAR,
    message TEXT
) AS $
BEGIN
    -- Check if default templates exist
    IF (SELECT COUNT(*) FROM email_templates WHERE is_active = true) = 0 THEN
        RETURN QUERY SELECT 'templates'::VARCHAR, 'ERROR'::VARCHAR, 'No active email templates found'::TEXT;
    ELSE
        RETURN QUERY SELECT 'templates'::VARCHAR, 'OK'::VARCHAR, 'Email templates configured'::TEXT;
    END IF;
    
    -- Check if system configuration exists
    IF (SELECT COUNT(*) FROM email_system_config WHERE is_active = true) = 0 THEN
        RETURN QUERY SELECT 'configuration'::VARCHAR, 'ERROR'::VARCHAR, 'No system configuration found'::TEXT;
    ELSE
        RETURN QUERY SELECT 'configuration'::VARCHAR, 'OK'::VARCHAR, 'System configuration ready'::TEXT;
    END IF;
    
    -- Check for recent email activity
    IF (SELECT COUNT(*) FROM email_notifications WHERE sent_at >= NOW() - INTERVAL '7 days') > 0 THEN
        RETURN QUERY SELECT 'activity'::VARCHAR, 'OK'::VARCHAR, 'Recent email activity detected'::TEXT;
    ELSE
        RETURN QUERY SELECT 'activity'::VARCHAR, 'INFO'::VARCHAR, 'No recent email activity'::TEXT;
    END IF;
    
    -- Check queue health
    DECLARE
        failed_count INTEGER;
        pending_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO failed_count FROM email_queue WHERE status = 'failed';
        SELECT COUNT(*) INTO pending_count FROM email_queue WHERE status = 'queued' AND scheduled_for <= NOW();
        
        IF failed_count > 100 THEN
            RETURN QUERY SELECT 'queue'::VARCHAR, 'WARNING'::VARCHAR, 
                ('High number of failed emails: ' || failed_count)::TEXT;
        ELSIF pending_count > 50 THEN
            RETURN QUERY SELECT 'queue'::VARCHAR, 'WARNING'::VARCHAR, 
                ('High number of pending emails: ' || pending_count)::TEXT;
        ELSE
            RETURN QUERY SELECT 'queue'::VARCHAR, 'OK'::VARCHAR, 'Email queue healthy'::TEXT;
        END IF;
    END;
END;
$ LANGUAGE plpgsql;

-- Run validation on setup
SELECT * FROM validate_email_system();; if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 mr-3 text-gray-600" />
        <h2 className="text-xl font-semibold">Email Preferences</h2>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); savePreferences(); }} className="space-y-6">
        {/* Notification Types */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Types
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Document Invitations</label>
                <p className="text-sm text-gray-500">Receive emails when someone requests your signature</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={preferences.receiveInvitations}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  receiveInvitations: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Signature Reminders</label>
                <p className="text-sm text-gray-500">Receive reminder emails for pending signatures</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={preferences.receiveReminders}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  receiveReminders: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Status Updates</label>
                <p className="text-sm text-gray-500">Receive emails when documents are signed or completed</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={preferences.receiveStatusUpdates}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  receiveStatusUpdates: e.target.checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Marketing & Updates</label>
                <p className="text-sm text-gray-500">Receive emails about new features and promotions</p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={preferences.receiveMarketing}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  receiveMarketing: e.target.checked
                }))}
              />
            </div>
          </div>
        </div>

        {/* Reminder Frequency */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Reminder Frequency
          </h3>
          
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-900">Send reminders every</label>
            <select
              className="select select-bordered"
              value={preferences.reminderFrequency}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                reminderFrequency: parseInt(e.target.value)
              }))}
              disabled={!preferences.receiveReminders}
            >
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
              <option value={3}>3 days</option>
              <option value={7}>1 week</option>
            </select>
          </div>
        </div>

        {/* Language & Format */}
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Language & Format
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-900 mb-2">Preferred Language</label>
              <select
                className="select select-bordered w-full"
                value={preferences.preferredLanguage}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  preferredLanguage: e.target.value
                }))}
              >
                <option value="en-NA">English (Namibia)</option>
                <option value="af-NA">Afrikaans (Namibia)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-900 mb-2">Email Format</label>
              <select
                className="select select-bordered w-full"
                value={preferences.emailFormat}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  emailFormat: e.target.value as 'html' | 'text'
                }))}
              >
                <option value="html">HTML (Formatted)</option>
                <option value="text">Plain Text</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// components/email/EmailTemplateManager.tsx
import React, { useState, useEffect } from 'react';
import { Template, Edit, Plus, Trash2, Eye, Save, X } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface EmailTemplate {
  id: string;
  name: string;
  templateType: string;
  subjectTemplate: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: Array<{
    name: string;
    type: string;
    required: boolean;
  }>;
  isActive: boolean;
  isDefault: boolean;
  locale: string;
}

export const EmailTemplateManager: React.FC = () => {
  const { user, getSupabaseClient } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const templateTypes = [
    { value: 'document_invitation', label: 'Document Invitation' },
    { value: 'signature_reminder', label: 'Signature Reminder' },
    { value: 'document_completed', label: 'Document Completed' },
    { value: 'document_expired', label: 'Document Expired' },
    { value: 'document_signed', label: 'Document Signed' },
    { value: 'document_rejected', label: 'Document Rejected' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type', { ascending: true })
        .order('is_default', { ascending: false });

      if (error) throw error;

      setTemplates(data.map(t => ({
        id: t.id,
        name: t.name,
        templateType: t.template_type,
        subjectTemplate: t.subject_template,
        htmlTemplate: t.html_template,
        textTemplate: t.text_template,
        variables: t.variables || [],
        isActive: t.is_active,
        isDefault: t.is_default,
        locale: t.locale
      })));
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (template: Partial<EmailTemplate>) => {
    try {
      const supabase = getSupabaseClient();
      const templateData = {
        name: template.name,
        template_type: template.templateType,
        subject_template: template.subjectTemplate,
        html_template: template.htmlTemplate,
        text_template: template.textTemplate,
        variables: template.variables || [],
        is_active: template.isActive,
        is_default: template.isDefault,
        locale: template.locale || 'en-NA'
      };

      let error;
      if (template.id) {
        // Update existing template
        ({ error } = await supabase
          .from('email_templates')
          .update(templateData)
          .eq('id', template.id));
      } else {
        // Create new template
        ({ error } = await supabase
          .from('email_templates')
          .insert(templateData));
      }

      if (error) throw error;

      await loadTemplates();
      setEditingTemplate(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const TemplateForm: React.FC<{
    template?: EmailTemplate;
    onSave: (template: Partial<EmailTemplate>) => void;
    onCancel: () => void;
  }> = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<EmailTemplate>>(
      template || {
        name: '',
        templateType: 'document_invitation',
        subjectTemplate: '',
        htmlTemplate: '',
        textTemplate: '',
        variables: [],
        isActive: true,
        isDefault: false,
        locale: 'en-NA'
      }
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              {template ? 'Edit Template' : 'Create Template'}
            </h3>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Type
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.templateType || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateType: e.target.value }))}
                  required
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Template
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.subjectTemplate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, subjectTemplate: e.target.value }))}
                placeholder="e.g., Please sign: {{documentTitle}}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML Template
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32"
                value={formData.htmlTemplate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, htmlTemplate: e.target.value }))}
                placeholder="HTML email content with {{variables}}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Text Template (fallback)
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                value={formData.textTemplate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, textTemplate: e.target.value }))}
                placeholder="Plain text version of the email"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                />
                Active
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary mr-2"
                  checked={formData.isDefault || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                />
                Default Template
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-6 border-t border-gray-200">
              <button type="button" onClick={onCancel} className="btn btn-ghost">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const TemplatePreview: React.FC<{
    template: EmailTemplate;
    onClose: () => void;
  }> = ({ template, onClose }) => {
    const sampleData = {
      recipientName: 'John Doe',
      senderName: 'Jane Smith',
      senderEmail: 'jane@company.com',
      documentTitle: 'Employment Contract - 2025',
      signingUrl: 'https://buffrsign.ai/sign/sample',
      expirationDate: 'December 31, 2025',
      customMessage: 'Please review and sign this important document.'
    };

    const renderTemplate = (content: string) => {
      let rendered = content;
      Object.entries(sampleData).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, value);
      });
      return rendered;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Template Preview: {template.name}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Subject:</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {renderTemplate(template.subjectTemplate)}
              </p>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">HTML Content:</h4>
              <div className="border border-gray-200 rounded p-4 bg-white">
                <div dangerouslySetInnerHTML={{ __html: renderTemplate(template.htmlTemplate) }} />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Text Content:</h4>
              <pre className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-wrap text-sm">
                {renderTemplate(template.textTemplate)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Template className="w-6 h-6 mr-3" />
          Email Templates
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500">
                  {templateTypes.find(t => t.value === template.templateType)?.label}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                {template.isDefault && (
                  <span className="badge badge-primary badge-sm">Default</span>
                )}
                {!template.isActive && (
                  <span className="badge badge-ghost badge-sm">Inactive</span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {template.subjectTemplate}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{template.locale}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="btn btn-ghost btn-sm"
                  title="Preview template"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="btn btn-ghost btn-sm"
                  title="Edit template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {!template.isDefault && (
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="btn btn-ghost btn-sm text-red-600 hover:text-red-700"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Template Modal */}
      {(showCreateForm || editingTemplate) && (
        <TemplateForm
          template={editingTemplate || undefined}
          onSave={saveTemplate}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </div>
  );
};

// components/email/EmailAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Mail, Eye, MousePointer, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface EmailAnalytics {
  totalSent: number;
  deliveryRate: number;
  openRate: // ===================================================================
// BuffrSign Email System React Components
// Complete UI components for email notification management
// ===================================================================

// components/email/EmailNotificationPanel.tsx
import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, Send, Eye, MousePointer } from 'lucide-react';
import { useEmailNotifications } from '@/lib/email/hooks/use-email-notifications';

interface EmailNotificationPanelProps {
  documentId: string;
}

export const EmailNotificationPanel: React.FC<EmailNotificationPanelProps> = ({ documentId }) => {
  const { 
    notifications, 
    loading, 
    error, 
    sendDocumentInvitation, 
    sendReminder, 
    analytics 
  } = useEmailNotifications(documentId);
  
  const [sendingInvitation, setSendingInvitation] = useState(false);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="w-4 h-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'opened': return <Eye className="w-4 h-4 text-purple-500" />;
      case 'clicked': return <MousePointer className="w-4 h-4 text-orange-500" />;
      case 'bounced': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'opened': return 'bg-purple-100 text-purple-800';
      case 'clicked': return 'bg-orange-100 text-orange-800';
      case 'bounced': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendReminder = async (recipientId: string) => {
    setSendingReminder(recipientId);
    try {
      await sendReminder(documentId, recipientId);
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingReminder(null);
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle className="w-5 h-5" />
        <span>Failed to load email notifications: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Analytics Summary */}
      {analytics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Performance
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analytics.totalSent}</div>
              <div className="text-sm text-gray-500">Total Sent</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics.deliveryRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Delivered</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.openRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Opened</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.clickRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Clicked</div>
            </div>
          </div>
        </div>
      )}

      {/* Email Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Notifications
            {loading && (
              <div className="ml-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No email notifications yet</p>
              <p className="text-sm">Email notifications will appear here once sent</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(notification.status)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {notification.emailAddress}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.subject}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                      {notification.status}
                    </span>
                    
                    <div className="text-sm text-gray-500">
                      {new Date(notification.sentAt).toLocaleString()}
                    </div>
                    
                    {/* Reminder button for pending signatures */}
                    {notification.emailType === 'document_invitation' && 
                     notification.status !== 'failed' && (
                      <button
                        onClick={() => handleSendReminder(notification.recipientId)}
                        disabled={sendingReminder === notification.recipientId}
                        className="btn btn-sm btn-ghost btn-circle"
                        title="Send reminder"
                      >
                        {sendingReminder === notification.recipientId ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Delivery Timeline */}
                {(notification.deliveredAt || notification.openedAt || notification.clickedAt) && (
                  <div className="mt-3 ml-7">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {notification.deliveredAt && (
                        <div className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                          Delivered {new Date(notification.deliveredAt).toLocaleString()}
                        </div>
                      )}
                      
                      {notification.openedAt && (
                        <div className="flex items-center">
                          <Eye className="w-3 h-3 mr-1 text-purple-500" />
                          Opened {new Date(notification.openedAt).toLocaleString()}
                        </div>
                      )}
                      
                      {notification.clickedAt && (
                        <div className="flex items-center">
                          <MousePointer className="w-3 h-3 mr-1 text-orange-500" />
                          Clicked {new Date(notification.clickedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// components/email/EmailPreferencesSettings.tsx
import { useState, useEffect } from 'react';
import { Settings, Mail, Clock, Bell, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface EmailPreferences {
  receiveInvitations: boolean;
  receiveReminders: boolean;
  receiveStatusUpdates: boolean;
  receiveMarketing: boolean;
  reminderFrequency: number;
  preferredLanguage: string;
  emailFormat: 'html' | 'text';
}

export const EmailPreferencesSettings: React.FC = () => {
  const { user, getSupabaseClient } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferences>({
    receiveInvitations: true,
    receiveReminders: true,
    receiveStatusUpdates: true,
    receiveMarketing: false,
    reminderFrequency: 2,
    preferredLanguage: 'en-NA',
    emailFormat: 'html'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setPreferences({
          receiveInvitations: data.receive_invitations,
          receiveReminders: data.receive_reminders,
          receiveStatusUpdates: data.receive_status_updates,
          receiveMarketing: data.receive_marketing,
          reminderFrequency: data.reminder_frequency,
          preferredLanguage: data.preferred_language,
          emailFormat: data.email_format
        });
      }
    } catch (error) {
      console.error('Failed to load email preferences:', error);
      setMessage({ type: 'error', text: 'Failed to load preferences' });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('user_email_preferences')
        .upsert({
          user_id: user?.id,
          receive_invitations: preferences.receiveInvitations,
          receive_reminders: preferences.receiveReminders,
          receive_status_updates: preferences.receiveStatusUpdates,
          receive_marketing: preferences.receiveMarketing,
          reminder_frequency: preferences.reminderFrequency,
          preferred_language: preferences.preferredLanguage,
          email_format: preferences.emailFormat
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Email preferences saved successfully' });
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (