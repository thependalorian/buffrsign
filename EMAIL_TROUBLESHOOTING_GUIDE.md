# BuffrSign Email System Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with the BuffrSign Email Notification System.

## Quick Diagnostic Checklist

Before diving into specific issues, run through this checklist:

- [ ] Environment variables are properly set
- [ ] Email provider API keys are valid and active
- [ ] Database connection is working
- [ ] Webhook URLs are accessible
- [ ] Rate limits are not exceeded
- [ ] Email addresses are valid and not blacklisted

## Common Issues and Solutions

### 1. Emails Not Sending

#### Symptoms
- Emails remain in "pending" status
- No error messages in logs
- Email queue is not processing

#### Diagnosis Steps

1. **Check Environment Configuration**:
   ```bash
   # Run the email system test
   npm run test:email
   ```

2. **Verify API Keys**:
   ```bash
   # Check if API keys are set
   echo $SENDGRID_API_KEY
   echo $RESEND_API_KEY
   echo $AWS_ACCESS_KEY_ID
   ```

3. **Test Email Provider Connection**:
   ```typescript
   // Test SendGrid connection
   import { SendGridProvider } from '@/lib/services/email/providers/sendgrid';
   
   const provider = new SendGridProvider({
     apiKey: process.env.SENDGRID_API_KEY,
     fromEmail: process.env.FROM_EMAIL
   });
   
   try {
     await provider.sendEmail({
       to: 'test@example.com',
       subject: 'Test Email',
       html: '<p>Test</p>',
       text: 'Test'
     });
     console.log('Email provider connection successful');
   } catch (error) {
     console.error('Email provider connection failed:', error);
   }
   ```

4. **Check Database Queue**:
   ```sql
   -- Check queue status
   SELECT status, COUNT(*) FROM email_queue GROUP BY status;
   
   -- Check for stuck items
   SELECT * FROM email_queue 
   WHERE status = 'processing' 
   AND updated_at < NOW() - INTERVAL '10 minutes';
   ```

#### Solutions

1. **Invalid API Keys**:
   - Verify API keys in your email provider dashboard
   - Check if keys have expired
   - Ensure keys have correct permissions

2. **Rate Limiting**:
   - Check your email provider's rate limits
   - Implement exponential backoff
   - Consider upgrading your plan

3. **Queue Processing Issues**:
   ```sql
   -- Reset stuck queue items
   UPDATE email_queue 
   SET status = 'pending', retry_count = 0 
   WHERE status = 'processing' 
   AND updated_at < NOW() - INTERVAL '10 minutes';
   ```

4. **Database Connection Issues**:
   - Check Supabase connection string
   - Verify database permissions
   - Check for connection pool exhaustion

### 2. Templates Not Rendering

#### Symptoms
- Variables not substituted in emails
- Template syntax errors
- Emails sent with raw template code

#### Diagnosis Steps

1. **Check Template Syntax**:
   ```sql
   -- Get template content
   SELECT name, html_content, variables 
   FROM email_templates 
   WHERE id = 'template-id';
   ```

2. **Test Template Rendering**:
   ```typescript
   import { EmailTemplateEngine } from '@/lib/services/email/template-engine';
   
   const engine = new EmailTemplateEngine();
   
   try {
     const result = await engine.renderTemplate('template-id', {
       recipient_name: 'John Doe',
       document_title: 'Test Document'
     });
     console.log('Template rendered successfully:', result);
   } catch (error) {
     console.error('Template rendering failed:', error);
   }
   ```

3. **Validate Template Variables**:
   ```sql
   -- Check if all required variables are provided
   SELECT variables FROM email_templates WHERE id = 'template-id';
   ```

#### Solutions

1. **Variable Mismatch**:
   - Ensure template variables match provided data
   - Check variable names for typos
   - Verify variable data types

2. **Template Syntax Errors**:
   ```html
   <!-- Correct syntax -->
   <h1>Hello {{recipient_name}}!</h1>
   
   <!-- Incorrect syntax -->
   <h1>Hello {recipient_name}!</h1>
   ```

3. **Missing Template Data**:
   ```typescript
   // Ensure all required data is provided
   const templateData = {
     recipient_name: 'John Doe',
     document_title: 'Contract Agreement',
     sender_name: 'Jane Smith',
     expires_at: '2024-12-31'
   };
   ```

### 3. Webhooks Not Working

#### Symptoms
- Email status not updating
- Analytics not reflecting actual delivery
- Webhook events not being processed

#### Diagnosis Steps

1. **Check Webhook URLs**:
   ```bash
   # Test webhook endpoint accessibility
   curl -X POST https://sign.buffr.ai/api/email/webhook/sendgrid \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

2. **Verify Webhook Configuration**:
   - Check webhook URLs in email provider dashboard
   - Ensure HTTPS is used
   - Verify event types are selected

3. **Check Webhook Processing**:
   ```sql
   -- Check recent webhook events
   SELECT * FROM email_notifications 
   WHERE updated_at > NOW() - INTERVAL '1 hour'
   ORDER BY updated_at DESC;
   ```

4. **Test Webhook Signature Verification**:
   ```typescript
   // Test SendGrid webhook verification
   import crypto from 'crypto';
   
   function verifyWebhook(payload: string, signature: string, secret: string): boolean {
     const expectedSignature = crypto
       .createHmac('sha256', secret)
       .update(payload)
       .digest('base64');
     
     return crypto.timingSafeEqual(
       Buffer.from(signature),
       Buffer.from(expectedSignature)
     );
   }
   ```

#### Solutions

1. **Webhook URL Issues**:
   - Ensure webhook URLs are publicly accessible
   - Check SSL certificate validity
   - Verify domain configuration

2. **Signature Verification Failures**:
   - Check webhook secret configuration
   - Verify signature calculation
   - Ensure payload is not modified

3. **Event Processing Errors**:
   ```typescript
   // Add error handling to webhook endpoints
   export async function POST(request: Request) {
     try {
       const payload = await request.text();
       const signature = request.headers.get('x-sendgrid-signature');
       
       if (!verifyWebhook(payload, signature, process.env.WEBHOOK_SECRET)) {
         return new Response('Unauthorized', { status: 401 });
       }
       
       const events = JSON.parse(payload);
       // Process events...
       
       return new Response('OK', { status: 200 });
     } catch (error) {
       console.error('Webhook processing error:', error);
       return new Response('Error', { status: 500 });
     }
   }
   ```

### 4. Analytics Not Updating

#### Symptoms
- Analytics showing outdated data
- Missing delivery/open/click data
- Inconsistent metrics

#### Diagnosis Steps

1. **Check Analytics Update Functions**:
   ```sql
   -- Check if analytics update function is working
   SELECT update_daily_email_analytics();
   ```

2. **Verify Webhook Event Processing**:
   ```sql
   -- Check recent webhook events
   SELECT COUNT(*) FROM email_notifications 
   WHERE updated_at > NOW() - INTERVAL '1 hour';
   ```

3. **Check Materialized Views**:
   ```sql
   -- Refresh materialized views
   REFRESH MATERIALIZED VIEW email_performance_summary;
   ```

4. **Validate Analytics Data**:
   ```sql
   -- Check analytics data consistency
   SELECT 
     COUNT(*) as total_notifications,
     COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
     COUNT(*) FILTER (WHERE status = 'opened') as opened
   FROM email_notifications 
   WHERE created_at >= CURRENT_DATE;
   ```

#### Solutions

1. **Webhook Processing Issues**:
   - Ensure webhooks are properly configured
   - Check webhook event processing logic
   - Verify database triggers are active

2. **Analytics Update Schedule**:
   ```sql
   -- Set up scheduled analytics updates
   SELECT cron.schedule('update-analytics', '0 1 * * *', 'SELECT update_daily_email_analytics();');
   ```

3. **Data Consistency Issues**:
   ```sql
   -- Recalculate analytics for specific date range
   DELETE FROM email_analytics WHERE date >= '2024-01-01';
   SELECT update_daily_email_analytics();
   ```

### 5. High Bounce Rates

#### Symptoms
- High percentage of bounced emails
- Email provider warnings
- Reputation issues

#### Diagnosis Steps

1. **Check Bounce Reasons**:
   ```sql
   -- Get bounce reasons
   SELECT 
     error_message,
     COUNT(*) as count
   FROM email_notifications 
   WHERE status = 'bounced'
   GROUP BY error_message
   ORDER BY count DESC;
   ```

2. **Analyze Email Addresses**:
   ```sql
   -- Check for invalid email patterns
   SELECT recipient_email, COUNT(*) as bounce_count
   FROM email_notifications 
   WHERE status = 'bounced'
   GROUP BY recipient_email
   ORDER BY bounce_count DESC;
   ```

3. **Check Blacklist Status**:
   ```sql
   -- Check blacklisted emails
   SELECT * FROM email_blacklist 
   WHERE email_address IN (
     SELECT DISTINCT recipient_email 
     FROM email_notifications 
     WHERE status = 'bounced'
   );
   ```

#### Solutions

1. **Email Validation**:
   ```typescript
   // Implement email validation
   function validateEmail(email: string): boolean {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
   }
   ```

2. **List Hygiene**:
   ```sql
   -- Add bounced emails to blacklist
   INSERT INTO email_blacklist (email_address, reason, created_at)
   SELECT DISTINCT 
     recipient_email,
     'Bounced email',
     NOW()
   FROM email_notifications 
   WHERE status = 'bounced'
   AND recipient_email NOT IN (SELECT email_address FROM email_blacklist);
   ```

3. **Sender Reputation**:
   - Use dedicated IP addresses
   - Implement proper authentication (SPF, DKIM, DMARC)
   - Monitor sender reputation scores

### 6. Performance Issues

#### Symptoms
- Slow email sending
- High database load
- Timeout errors

#### Diagnosis Steps

1. **Check Database Performance**:
   ```sql
   -- Check slow queries
   SELECT query, mean_time, calls
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

2. **Monitor Queue Processing**:
   ```sql
   -- Check queue processing time
   SELECT 
     AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) as avg_processing_time
   FROM email_queue 
   WHERE status = 'completed'
   AND processed_at > NOW() - INTERVAL '1 hour';
   ```

3. **Check API Response Times**:
   ```typescript
   // Monitor API performance
   const startTime = Date.now();
   try {
     await emailService.sendDocumentInvitation(data);
     const duration = Date.now() - startTime;
     console.log(`Email sent in ${duration}ms`);
   } catch (error) {
     console.error('Email sending failed:', error);
   }
   ```

#### Solutions

1. **Database Optimization**:
   ```sql
   -- Add missing indexes
   CREATE INDEX CONCURRENTLY idx_email_notifications_status_created 
   ON email_notifications(status, created_at);
   
   -- Optimize queries
   EXPLAIN ANALYZE SELECT * FROM email_notifications 
   WHERE status = 'pending' AND created_at > NOW() - INTERVAL '1 hour';
   ```

2. **Connection Pooling**:
   ```typescript
   // Configure connection pooling
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

3. **Caching**:
   ```typescript
   // Implement template caching
   const templateCache = new Map();
   
   async function getCachedTemplate(templateId: string) {
     if (templateCache.has(templateId)) {
       return templateCache.get(templateId);
     }
     
     const template = await supabase
       .from('email_templates')
       .select('*')
       .eq('id', templateId)
       .single();
     
     templateCache.set(templateId, template);
     return template;
   }
   ```

### 7. Authentication Issues

#### Symptoms
- 401 Unauthorized errors
- JWT token validation failures
- User permission errors

#### Diagnosis Steps

1. **Check JWT Token**:
   ```typescript
   // Verify JWT token
   import jwt from 'jsonwebtoken';
   
   try {
     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
     console.log('Token is valid:', decoded);
   } catch (error) {
     console.error('Token validation failed:', error);
   }
   ```

2. **Check User Permissions**:
   ```sql
   -- Check user email preferences
   SELECT * FROM user_email_preferences 
   WHERE user_id = 'user-id';
   ```

3. **Verify RLS Policies**:
   ```sql
   -- Check RLS policies
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies 
   WHERE tablename LIKE 'email_%';
   ```

#### Solutions

1. **Token Issues**:
   - Check token expiration
   - Verify secret keys
   - Implement token refresh

2. **Permission Problems**:
   ```sql
   -- Grant necessary permissions
   GRANT SELECT, INSERT, UPDATE ON email_notifications TO authenticated;
   GRANT SELECT, INSERT, UPDATE ON user_email_preferences TO authenticated;
   ```

3. **RLS Policy Issues**:
   ```sql
   -- Fix RLS policies
   ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own notifications" ON email_notifications
   FOR SELECT USING (auth.uid() = user_id);
   ```

## Debug Tools and Commands

### 1. Email System Test Script

```bash
# Run comprehensive email system test
npm run test:email

# Test specific components
node scripts/test-email-system.js --component=database
node scripts/test-email-system.js --component=providers
node scripts/test-email-system.js --component=webhooks
```

### 2. Database Debug Queries

```sql
-- Check system health
SELECT 
  (SELECT COUNT(*) FROM email_notifications) as total_emails,
  (SELECT COUNT(*) FROM email_notifications WHERE status = 'delivered') as delivered,
  (SELECT COUNT(*) FROM email_notifications WHERE status = 'failed') as failed,
  (SELECT COUNT(*) FROM email_queue WHERE status = 'pending') as queue_size;

-- Check recent errors
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check webhook processing
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced
FROM email_notifications 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### 3. Log Analysis

```bash
# Check application logs
tail -f /var/log/email-system/combined.log

# Search for specific errors
grep "ERROR" /var/log/email-system/combined.log | tail -20

# Check webhook processing
grep "webhook" /var/log/email-system/combined.log | tail -10

# Monitor email sending
grep "sendEmail" /var/log/email-system/combined.log | tail -10
```

### 4. Performance Monitoring

```typescript
// Add performance monitoring
import { performance } from 'perf_hooks';

async function sendEmailWithMonitoring(data: any) {
  const startTime = performance.now();
  
  try {
    const result = await emailService.sendDocumentInvitation(data);
    const duration = performance.now() - startTime;
    
    console.log(`Email sent successfully in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`Email sending failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}
```

## Prevention and Best Practices

### 1. Monitoring Setup

```typescript
// Set up health checks
export async function GET() {
  const health = {
    database: await checkDatabaseHealth(),
    emailProvider: await checkEmailProviderHealth(),
    queue: await checkQueueHealth(),
    webhooks: await checkWebhookHealth()
  };
  
  const isHealthy = Object.values(health).every(status => status === 'healthy');
  
  return Response.json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    services: health,
    timestamp: new Date().toISOString()
  });
}
```

### 2. Error Handling

```typescript
// Implement comprehensive error handling
export class EmailError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

// Use in email service
try {
  await provider.sendEmail(emailData);
} catch (error) {
  if (error.code === 'RATE_LIMITED') {
    // Handle rate limiting
    await delay(60000); // Wait 1 minute
    throw new EmailError('Rate limited', 'RATE_LIMITED', { retryAfter: 60 });
  } else if (error.code === 'INVALID_EMAIL') {
    // Handle invalid email
    throw new EmailError('Invalid email address', 'INVALID_EMAIL', { email: emailData.to });
  } else {
    // Handle other errors
    throw new EmailError('Email sending failed', 'SEND_FAILED', { originalError: error });
  }
}
```

### 3. Regular Maintenance

```bash
#!/bin/bash
# maintenance.sh - Regular maintenance script

# Clean up old data
psql $DATABASE_URL -c "
DELETE FROM email_notifications 
WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM email_queue 
WHERE status = 'completed' 
AND processed_at < NOW() - INTERVAL '30 days';
"

# Refresh materialized views
psql $DATABASE_URL -c "REFRESH MATERIALIZED VIEW email_performance_summary;"

# Update analytics
psql $DATABASE_URL -c "SELECT update_daily_email_analytics();"

# Check system health
npm run test:email
```

## Getting Help

### 1. Log Collection

When reporting issues, collect the following information:

```bash
# System information
npm run test:email > email-system-test.log 2>&1

# Recent logs
tail -100 /var/log/email-system/combined.log > recent-logs.log

# Database status
psql $DATABASE_URL -c "SELECT * FROM email_system_health;" > db-status.log

# Environment (without secrets)
env | grep -E "(EMAIL_|NEXT_PUBLIC_|SUPABASE_)" > env-vars.log
```

### 2. Issue Reporting Template

```
**Issue Description:**
Brief description of the problem

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Environment:**
- Node.js version:
- Email provider:
- Database:
- Deployment platform:

**Logs:**
[Attach relevant logs]

**Additional Context:**
Any other relevant information
```

### 3. Support Channels

- **Documentation**: Check the main README and API documentation
- **GitHub Issues**: Report bugs and feature requests
- **Community Forum**: Ask questions and share solutions
- **Email Support**: For critical production issues

This troubleshooting guide should help you resolve most common issues with the BuffrSign Email System. For additional support, refer to the main documentation or contact the development team.
