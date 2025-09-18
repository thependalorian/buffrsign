# BuffrSign Email Notification System

## Overview

The BuffrSign Email Notification System is a comprehensive, event-driven email solution that provides reliable document invitation, reminder, and status notification capabilities. It supports multiple email providers, dynamic templates, user preferences, analytics, and webhook integration.

## Features

- **Multi-Provider Support**: SendGrid, Resend, and AWS SES
- **Dynamic Templates**: Variable substitution, conditional blocks, and multi-language support
- **User Preferences**: Granular control over notification types and frequency
- **Analytics**: Comprehensive email performance tracking
- **Queue System**: Reliable delivery with retry logic
- **Webhook Integration**: Real-time status updates
- **Rate Limiting**: Built-in protection against abuse
- **Blacklist Management**: Automatic handling of bounced emails

## Quick Start

### 1. Environment Configuration

Add the following variables to your `.env.local` file:

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

# System Settings
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000
EMAIL_BATCH_SIZE=100
EMAIL_RATE_LIMIT=1000
```

### 2. Database Setup

The email system requires several database tables and functions. These have been created via Supabase migrations:

- `email_notifications` - Tracks all sent emails
- `email_templates` - Stores email templates
- `user_email_preferences` - User notification settings
- `scheduled_reminders` - Automated reminder system
- `email_analytics` - Performance metrics
- `email_blacklist` - Bounced email management
- `email_queue` - Reliable delivery queue
- `email_system_config` - System configuration

### 3. Basic Usage

#### Sending Document Invitations

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

#### Sending Signature Reminders

```typescript
// Send signature reminder
await emailService.sendSignatureReminder({
  documentId: 'doc-123',
  recipientEmail: 'user@example.com',
  recipientName: 'John Doe',
  documentTitle: 'Contract Agreement',
  daysRemaining: 3
});
```

#### Sending Completion Notifications

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

### 4. React Components

#### Email Preferences Form

```tsx
import { EmailPreferencesForm } from '@/components/email';

function SettingsPage() {
  return (
    <div>
      <h1>Email Preferences</h1>
      <EmailPreferencesForm />
    </div>
  );
}
```

#### Email Analytics Chart

```tsx
import { EmailAnalyticsChart } from '@/components/email';

function AnalyticsPage() {
  return (
    <div>
      <h1>Email Analytics</h1>
      <EmailAnalyticsChart />
    </div>
  );
}
```

#### Email Notification List

```tsx
import { EmailNotificationList } from '@/components/email';

function DocumentPage({ documentId }: { documentId: string }) {
  return (
    <div>
      <h1>Document Notifications</h1>
      <EmailNotificationList documentId={documentId} />
    </div>
  );
}
```

### 5. React Hooks

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
    await sendInvitation({
      recipientEmail: 'user@example.com',
      recipientName: 'John Doe',
      customMessage: 'Please review this document.'
    });
  };

  return (
    <div>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.recipient_email} - {notification.status}
        </div>
      ))}
      <button onClick={handleSendInvitation}>
        Send Invitation
      </button>
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

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={preferences.receive_reminders}
          onChange={handleToggleReminders}
        />
        Receive Reminders
      </label>
    </div>
  );
}
```

### 6. API Routes

The system provides several API endpoints:

- `POST /api/email/send` - Send emails
- `GET /api/email/analytics` - Get analytics data
- `GET/PUT /api/email/preferences` - Manage user preferences
- `POST /api/email/retry/[id]` - Retry failed emails
- `DELETE /api/email/cancel/[id]` - Cancel scheduled emails
- `POST /api/email/webhook/sendgrid` - SendGrid webhooks
- `POST /api/email/webhook/resend` - Resend webhooks
- `POST /api/email/webhook/ses` - AWS SES webhooks

### 7. Email Templates

#### Creating Custom Templates

```typescript
import { supabase } from '@/lib/supabase';

// Create a new email template
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

#### Template Variables

Available variables for different template types:

**Document Invitation:**
- `recipient_name` - Recipient's name
- `document_title` - Document title
- `sender_name` - Sender's name
- `expires_at` - Document expiration date
- `custom_message` - Custom message from sender
- `document_url` - Direct link to document

**Signature Reminder:**
- `recipient_name` - Recipient's name
- `document_title` - Document title
- `days_remaining` - Days until expiration
- `document_url` - Direct link to document

**Document Completed:**
- `recipient_name` - Recipient's name
- `document_title` - Document title
- `completed_at` - Completion timestamp
- `document_url` - Direct link to document

### 8. Webhook Configuration

#### SendGrid Webhooks

1. Go to SendGrid Dashboard → Settings → Mail Settings → Event Webhook
2. Set HTTP Post URL to: `https://sign.buffr.ai/api/email/webhook/sendgrid`
3. Select events: `delivered`, `bounced`, `dropped`, `spam_report`, `unsubscribe`

#### Resend Webhooks

1. Go to Resend Dashboard → Webhooks
2. Create new webhook with URL: `https://sign.buffr.ai/api/email/webhook/resend`
3. Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`

#### AWS SES Webhooks

1. Configure SNS topic for bounce and complaint notifications
2. Set webhook URL: `https://sign.buffr.ai/api/email/webhook/ses`
3. Subscribe to bounce and complaint events

### 9. Monitoring and Analytics

#### View Email Analytics

```typescript
import { useEmailAnalytics } from '@/lib/hooks';

function AnalyticsComponent() {
  const { analytics, loading } = useEmailAnalytics({
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  });

  return (
    <div>
      <h2>Email Performance</h2>
      <p>Total Sent: {analytics.totalSent}</p>
      <p>Delivered: {analytics.delivered}</p>
      <p>Bounced: {analytics.bounced}</p>
      <p>Open Rate: {analytics.openRate}%</p>
      <p>Click Rate: {analytics.clickRate}%</p>
    </div>
  );
}
```

#### Database Queries

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

### 10. Troubleshooting

#### Common Issues

1. **Emails not sending**
   - Check API keys in environment variables
   - Verify email provider configuration
   - Check email queue status

2. **Templates not rendering**
   - Verify template variables match expected format
   - Check template syntax for conditional blocks
   - Ensure template is active in database

3. **Webhooks not working**
   - Verify webhook URLs are accessible
   - Check webhook authentication
   - Review webhook event configuration

4. **Analytics not updating**
   - Ensure webhooks are properly configured
   - Check database triggers are active
   - Verify analytics update functions

#### Debug Mode

Enable debug logging by setting:

```bash
DEBUG=true
LOG_LEVEL=debug
```

This will provide detailed logs for email operations, template rendering, and webhook processing.

### 11. Security Considerations

- API keys are stored securely in environment variables
- Webhook endpoints include signature verification
- Rate limiting prevents abuse
- Email blacklist prevents sending to bounced addresses
- RLS policies protect user data
- Audit logging tracks sensitive operations

### 12. Performance Optimization

- Email queue processes messages asynchronously
- Batch processing for bulk operations
- Materialized views for analytics queries
- Indexed database columns for fast lookups
- Connection pooling for database operations

## Support

For issues or questions about the email system:

1. Check the troubleshooting section above
2. Review the database logs for errors
3. Verify environment configuration
4. Test with a simple email first
5. Check webhook delivery status

The email system is designed to be robust and self-healing, with automatic retry logic and comprehensive error handling.
