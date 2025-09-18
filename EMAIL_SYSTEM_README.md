# BuffrSign Email Notification System

## 🚀 Overview

The BuffrSign Email Notification System is a comprehensive, enterprise-grade email solution designed for document signing workflows. It provides reliable, scalable, and feature-rich email notifications with multi-provider support, dynamic templates, analytics, and real-time webhook integration.

## ✨ Key Features

- **Multi-Provider Support**: SendGrid, Resend, and AWS SES
- **Dynamic Templates**: Variable substitution, conditional blocks, multi-language support
- **User Preferences**: Granular control over notification types and frequency
- **Analytics Dashboard**: Comprehensive email performance tracking
- **Queue System**: Reliable delivery with retry logic and failure handling
- **Webhook Integration**: Real-time status updates from email providers
- **Blacklist Management**: Automatic handling of bounced and spam emails
- **Rate Limiting**: Built-in protection against abuse
- **Security**: RLS policies, audit logging, and secure API endpoints

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Usage Examples](#usage-examples)
5. [API Reference](#api-reference)
6. [Database Schema](#database-schema)
7. [Components](#components)
8. [Hooks](#hooks)
9. [Templates](#templates)
10. [Webhooks](#webhooks)
11. [Analytics](#analytics)
12. [Troubleshooting](#troubleshooting)
13. [Deployment](#deployment)

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and configure your email provider:

```bash
cp env.template .env.local
```

Edit `.env.local` with your email provider credentials:

```bash
# Email Provider Configuration
EMAIL_PROVIDER=sendgrid  # or 'resend' or 'ses'
SENDGRID_API_KEY=your_sendgrid_api_key
RESEND_API_KEY=your_resend_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Email Configuration
FROM_EMAIL=noreply@buffrsign.ai
FROM_NAME=BuffrSign
NEXT_PUBLIC_APP_URL=https://buffrsign.ai
```

### 2. Test Installation

Run the email system test to verify everything is working:

```bash
npm run test:email
```

### 3. Basic Usage

```typescript
import { EmailService } from '@/lib/services/email';

const emailService = new EmailService();

// Send document invitation
await emailService.sendDocumentInvitation({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  senderName: 'Jane Smith',
  expiresAt: new Date('2024-12-31'),
  customMessage: 'Please review and sign this contract.'
});
```

## 📦 Installation

The email system is already integrated into the BuffrSign project. No additional installation is required.

### Dependencies

The system uses the following dependencies (already included):

- `@supabase/supabase-js` - Database operations
- `@sendgrid/mail` - SendGrid email provider
- `resend` - Resend email provider
- `@aws-sdk/client-ses` - AWS SES provider
- `lucide-react` - Icons for UI components
- `recharts` - Analytics charts

## ⚙️ Configuration

### Email Provider Setup

#### SendGrid
1. Create a SendGrid account
2. Generate an API key
3. Set `EMAIL_PROVIDER=sendgrid`
4. Set `SENDGRID_API_KEY=your_api_key`

#### Resend
1. Create a Resend account
2. Generate an API key
3. Set `EMAIL_PROVIDER=resend`
4. Set `RESEND_API_KEY=your_api_key`

#### AWS SES
1. Set up AWS SES in your region
2. Verify your domain/email
3. Set `EMAIL_PROVIDER=ses`
4. Set AWS credentials and region

### System Configuration

```bash
# Queue Settings
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000
EMAIL_BATCH_SIZE=100
EMAIL_RATE_LIMIT=1000
```

## 💡 Usage Examples

### React Components

#### Email Preferences Form
```tsx
import { EmailPreferencesForm } from '@/components/email';

function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Preferences</h1>
      <EmailPreferencesForm />
    </div>
  );
}
```

#### Email Analytics Dashboard
```tsx
import { EmailAnalyticsChart } from '@/components/email';

function AnalyticsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Email Analytics</h1>
      <EmailAnalyticsChart />
    </div>
  );
}
```

#### Document Notifications
```tsx
import { EmailNotificationList } from '@/components/email';

function DocumentPage({ documentId }: { documentId: string }) {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Document Notifications</h1>
      <EmailNotificationList documentId={documentId} />
    </div>
  );
}
```

### React Hooks

#### useEmailNotifications
```tsx
import { useEmailNotifications } from '@/lib/hooks';

function DocumentComponent({ documentId }: { documentId: string }) {
  const {
    notifications,
    analytics,
    sendInvitation,
    sendReminder,
    loading,
    error
  } = useEmailNotifications(documentId);

  const handleSendInvitation = async () => {
    try {
      await sendInvitation({
        recipientEmail: 'user@example.com',
        recipientName: 'John Doe',
        customMessage: 'Please review this document.'
      });
      alert('Invitation sent successfully!');
    } catch (error) {
      alert('Failed to send invitation');
    }
  };

  return (
    <div>
      <h2>Email Notifications</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="mb-4">
        <button 
          onClick={handleSendInvitation}
          className="btn btn-primary"
          disabled={loading}
        >
          Send Invitation
        </button>
      </div>

      <div className="space-y-2">
        {notifications.map(notification => (
          <div key={notification.id} className="border p-3 rounded">
            <p><strong>To:</strong> {notification.recipient_email}</p>
            <p><strong>Status:</strong> {notification.status}</p>
            <p><strong>Sent:</strong> {new Date(notification.sent_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### useEmailPreferences
```tsx
import { useEmailPreferences } from '@/lib/hooks';

function PreferencesComponent() {
  const {
    preferences,
    updatePreferences,
    loading,
    error
  } = useEmailPreferences();

  const handleToggleReminders = () => {
    updatePreferences({
      receive_reminders: !preferences.receive_reminders
    });
  };

  if (loading) return <p>Loading preferences...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-4">
      <h2>Email Preferences</h2>
      
      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Receive Document Invitations</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={preferences.receive_invitations}
            onChange={() => updatePreferences({
              receive_invitations: !preferences.receive_invitations
            })}
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Receive Signature Reminders</span>
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={preferences.receive_reminders}
            onChange={handleToggleReminders}
          />
        </label>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Reminder Frequency (days)</span>
        </label>
        <select
          className="select select-bordered"
          value={preferences.reminder_frequency}
          onChange={(e) => updatePreferences({
            reminder_frequency: parseInt(e.target.value)
          })}
        >
          <option value={1}>Daily</option>
          <option value={2}>Every 2 days</option>
          <option value={3}>Every 3 days</option>
          <option value={7}>Weekly</option>
        </select>
      </div>
    </div>
  );
}
```

### Email Service Usage

#### Send Document Invitation
```typescript
import { EmailService } from '@/lib/services/email';

const emailService = new EmailService();

// Basic invitation
await emailService.sendDocumentInvitation({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  senderName: 'Jane Smith',
  expiresAt: new Date('2024-12-31')
});

// With custom message
await emailService.sendDocumentInvitation({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  senderName: 'Jane Smith',
  expiresAt: new Date('2024-12-31'),
  customMessage: 'This is an urgent contract that needs your signature by end of week.'
});
```

#### Send Signature Reminder
```typescript
// Send reminder
await emailService.sendSignatureReminder({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  daysRemaining: 3
});
```

#### Send Completion Notification
```typescript
// Send completion notification
await emailService.sendDocumentCompleted({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  completedAt: new Date()
});
```

## 📚 API Reference

### Email Endpoints

#### POST /api/email/send
Send an email notification.

**Request Body:**
```json
{
  "type": "document_invitation",
  "documentId": "doc-123",
  "recipientEmail": "user@example.com",
  "recipientName": "John Doe",
  "templateData": {
    "document_title": "Contract Agreement",
    "sender_name": "Jane Smith",
    "expires_at": "2024-12-31",
    "custom_message": "Please review and sign"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "msg-123",
  "status": "queued"
}
```

#### GET /api/email/analytics
Get email analytics data.

**Query Parameters:**
- `startDate` (optional): Start date in YYYY-MM-DD format
- `endDate` (optional): End date in YYYY-MM-DD format
- `documentId` (optional): Filter by document ID

**Response:**
```json
{
  "totalSent": 150,
  "delivered": 145,
  "bounced": 3,
  "opened": 120,
  "clicked": 45,
  "openRate": 80.0,
  "clickRate": 30.0,
  "bounceRate": 2.0
}
```

#### GET /api/email/preferences
Get user email preferences.

**Response:**
```json
{
  "receive_invitations": true,
  "receive_reminders": true,
  "receive_status_updates": true,
  "receive_marketing": false,
  "reminder_frequency": 2,
  "preferred_language": "en-US",
  "email_format": "html"
}
```

#### PUT /api/email/preferences
Update user email preferences.

**Request Body:**
```json
{
  "receive_invitations": true,
  "receive_reminders": false,
  "reminder_frequency": 3
}
```

#### POST /api/email/retry/[id]
Retry a failed email from the queue.

**Response:**
```json
{
  "success": true,
  "message": "Email queued for retry"
}
```

#### DELETE /api/email/cancel/[id]
Cancel a scheduled email.

**Response:**
```json
{
  "success": true,
  "message": "Email cancelled"
}
```

### Webhook Endpoints

#### POST /api/email/webhook/sendgrid
Handle SendGrid webhook events.

#### POST /api/email/webhook/resend
Handle Resend webhook events.

#### POST /api/email/webhook/ses
Handle AWS SES webhook events.

## 🗄️ Database Schema

### Tables

#### email_notifications
Tracks all sent emails and their status.

```sql
CREATE TABLE email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  template_id UUID REFERENCES email_templates(id),
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### email_templates
Stores email templates with variable support.

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables TEXT[],
  locale TEXT DEFAULT 'en-US',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_email_preferences
User-specific email notification settings.

```sql
CREATE TABLE user_email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receive_invitations BOOLEAN DEFAULT true,
  receive_reminders BOOLEAN DEFAULT true,
  receive_status_updates BOOLEAN DEFAULT true,
  receive_marketing BOOLEAN DEFAULT false,
  reminder_frequency INTEGER DEFAULT 2,
  preferred_language TEXT DEFAULT 'en-US',
  email_format TEXT DEFAULT 'html',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Functions

#### get_email_template(template_type, locale)
Retrieves an email template by type and locale.

#### process_email_queue()
Processes pending emails in the queue.

#### update_daily_email_analytics()
Updates daily email analytics data.

## 🧩 Components

### EmailPreferencesForm
A form component for managing user email preferences.

**Props:**
- `userId` (optional): User ID, defaults to current user
- `onSave` (optional): Callback when preferences are saved

### EmailAnalyticsChart
A chart component displaying email analytics data.

**Props:**
- `startDate` (optional): Start date for analytics
- `endDate` (optional): End date for analytics
- `documentId` (optional): Filter by document ID

### EmailNotificationList
A list component showing email notifications for a document.

**Props:**
- `documentId`: Document ID to show notifications for
- `onSendReminder` (optional): Callback for sending reminders

### EmailTemplateEditor
An editor component for creating and editing email templates.

**Props:**
- `templateId` (optional): Template ID to edit
- `onSave` (optional): Callback when template is saved
- `onDelete` (optional): Callback when template is deleted

## 🎣 Hooks

### useEmailNotifications(documentId)
Hook for managing email notifications for a specific document.

**Returns:**
- `notifications`: Array of email notifications
- `analytics`: Email analytics data
- `sendInvitation`: Function to send document invitation
- `sendReminder`: Function to send signature reminder
- `loading`: Loading state
- `error`: Error state

### useEmailPreferences()
Hook for managing user email preferences.

**Returns:**
- `preferences`: User email preferences
- `updatePreferences`: Function to update preferences
- `loading`: Loading state
- `error`: Error state

### useEmailAnalytics(options)
Hook for fetching email analytics data.

**Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `documentId` (optional): Document ID filter

**Returns:**
- `analytics`: Analytics data
- `loading`: Loading state
- `error`: Error state

## 📝 Templates

### Template Variables

#### Document Invitation
- `recipient_name`: Recipient's name
- `document_title`: Document title
- `sender_name`: Sender's name
- `expires_at`: Document expiration date
- `custom_message`: Custom message from sender
- `document_url`: Direct link to document

#### Signature Reminder
- `recipient_name`: Recipient's name
- `document_title`: Document title
- `days_remaining`: Days until expiration
- `document_url`: Direct link to document

#### Document Completed
- `recipient_name`: Recipient's name
- `document_title`: Document title
- `completed_at`: Completion timestamp
- `document_url`: Direct link to document

### Template Syntax

#### Variable Substitution
```html
<h1>Hello {{recipient_name}}!</h1>
<p>You have been invited to review: {{document_title}}</p>
```

#### Conditional Blocks
```html
{% if custom_message %}
<p>Message: {{custom_message}}</p>
{% endif %}
```

#### Loop Processing
```html
{% for recipient in recipients %}
<p>Hello {{recipient.name}}!</p>
{% endfor %}
```

### Creating Custom Templates

```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('email_templates')
  .insert({
    name: 'Custom Welcome Email',
    type: 'document_invitation',
    subject: 'Welcome to {{document_title}}',
    html_content: `
      <h1>Hello {{recipient_name}}!</h1>
      <p>You have been invited to review: {{document_title}}</p>
      <p>From: {{sender_name}}</p>
      <p>Expires: {{expires_at}}</p>
      {% if custom_message %}
      <p>Message: {{custom_message}}</p>
      {% endif %}
    `,
    text_content: `
      Hello {{recipient_name}}!
      
      You have been invited to review: {{document_title}}
      From: {{sender_name}}
      Expires: {{expires_at}}
      
      {% if custom_message %}
      Message: {{custom_message}}
      {% endif %}
    `,
    variables: ['recipient_name', 'document_title', 'sender_name', 'expires_at', 'custom_message'],
    locale: 'en-US',
    is_active: true
  });
```

## 🔗 Webhooks

### SendGrid Webhook Setup

1. Go to SendGrid Dashboard → Settings → Mail Settings → Event Webhook
2. Set HTTP Post URL to: `https://sign.buffr.ai/api/email/webhook/sendgrid`
3. Select events: `delivered`, `bounced`, `dropped`, `spam_report`, `unsubscribe`

### Resend Webhook Setup

1. Go to Resend Dashboard → Webhooks
2. Create new webhook with URL: `https://sign.buffr.ai/api/email/webhook/resend`
3. Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`

### AWS SES Webhook Setup

1. Configure SNS topic for bounce and complaint notifications
2. Set webhook URL: `https://sign.buffr.ai/api/email/webhook/ses`
3. Subscribe to bounce and complaint events

## 📊 Analytics

### Analytics Data

The system tracks the following metrics:

- **Total Sent**: Total number of emails sent
- **Delivered**: Number of successfully delivered emails
- **Bounced**: Number of bounced emails
- **Opened**: Number of opened emails
- **Clicked**: Number of clicked emails
- **Open Rate**: Percentage of opened emails
- **Click Rate**: Percentage of clicked emails
- **Bounce Rate**: Percentage of bounced emails

### Analytics Queries

```sql
-- Get email performance for a specific document
SELECT 
  en.status,
  COUNT(*) as count,
  AVG(en.delivered_at - en.sent_at) as avg_delivery_time
FROM email_notifications en
WHERE en.document_id = 'doc-123'
GROUP BY en.status;

-- Get user email preferences
SELECT 
  uep.receive_invitations,
  uep.receive_reminders,
  uep.reminder_frequency
FROM user_email_preferences uep
WHERE uep.user_id = 'user-123';

-- Get failed emails for retry
SELECT eq.*
FROM email_queue eq
WHERE eq.status = 'failed'
  AND eq.retry_count < 3
ORDER BY eq.created_at;
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Emails Not Sending

**Symptoms:**
- Emails remain in "pending" status
- No error messages in logs

**Solutions:**
- Check API keys in environment variables
- Verify email provider configuration
- Check email queue status
- Review rate limiting settings

#### 2. Templates Not Rendering

**Symptoms:**
- Variables not substituted in emails
- Template syntax errors

**Solutions:**
- Verify template variables match expected format
- Check template syntax for conditional blocks
- Ensure template is active in database
- Test template with sample data

#### 3. Webhooks Not Working

**Symptoms:**
- Email status not updating
- Analytics not reflecting actual delivery

**Solutions:**
- Verify webhook URLs are accessible
- Check webhook authentication
- Review webhook event configuration
- Test webhook endpoints manually

#### 4. Analytics Not Updating

**Symptoms:**
- Analytics showing outdated data
- Missing delivery/open/click data

**Solutions:**
- Ensure webhooks are properly configured
- Check database triggers are active
- Verify analytics update functions
- Review webhook event processing

### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=true
LOG_LEVEL=debug
```

This will provide detailed logs for:
- Email operations
- Template rendering
- Webhook processing
- Database queries
- Error handling

### Log Analysis

Check logs for common error patterns:

```bash
# Check for email sending errors
grep "ERROR.*email" logs/app.log

# Check for webhook processing errors
grep "ERROR.*webhook" logs/app.log

# Check for template rendering errors
grep "ERROR.*template" logs/app.log
```

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set in production:

```bash
# Required
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_production_api_key
FROM_EMAIL=noreply@buffr.ai
NEXT_PUBLIC_APP_URL=https://sign.buffr.ai
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000
EMAIL_BATCH_SIZE=100
EMAIL_RATE_LIMIT=1000
```

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy the application
3. Configure webhook URLs with your email provider
4. Test email functionality

### Database Migration

The email system tables and functions are created via Supabase migrations. Ensure all migrations have been applied:

```bash
# Check migration status
npm run test:email
```

### Monitoring

Set up monitoring for:

- Email delivery rates
- Webhook processing
- Queue processing
- Error rates
- Performance metrics

### Security Considerations

- API keys are stored securely in environment variables
- Webhook endpoints include signature verification
- Rate limiting prevents abuse
- Email blacklist prevents sending to bounced addresses
- RLS policies protect user data
- Audit logging tracks sensitive operations

## 📞 Support

For issues or questions about the email system:

1. Check the troubleshooting section above
2. Review the database logs for errors
3. Verify environment configuration
4. Test with a simple email first
5. Check webhook delivery status

The email system is designed to be robust and self-healing, with automatic retry logic and comprehensive error handling.

## 📄 License

This email system is part of the BuffrSign project and follows the same licensing terms.
