# BuffrSign Email System Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the BuffrSign Email Notification System to production environments.

## Prerequisites

- Node.js 18+ installed
- Supabase project set up
- Email provider account (SendGrid, Resend, or AWS SES)
- Domain configured for webhooks
- SSL certificate for HTTPS

## Deployment Options

### 1. Vercel Deployment (Recommended)

Vercel provides seamless deployment for Next.js applications with built-in environment variable management.

#### Step 1: Prepare for Deployment

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Link your project**:
   ```bash
   vercel link
   ```

#### Step 2: Configure Environment Variables

Set up environment variables in Vercel dashboard or via CLI:

```bash
# Required variables
vercel env add EMAIL_PROVIDER
vercel env add SENDGRID_API_KEY
vercel env add FROM_EMAIL
vercel env add NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Optional variables
vercel env add EMAIL_QUEUE_ENABLED
vercel env add EMAIL_RETRY_ATTEMPTS
vercel env add EMAIL_RETRY_DELAY
vercel env add EMAIL_BATCH_SIZE
vercel env add EMAIL_RATE_LIMIT
```

#### Step 3: Deploy

```bash
vercel --prod
```

#### Step 4: Configure Webhooks

After deployment, configure webhook URLs with your email provider:

- **SendGrid**: `https://yourdomain.vercel.app/api/email/webhook/sendgrid`
- **Resend**: `https://yourdomain.vercel.app/api/email/webhook/resend`
- **AWS SES**: `https://yourdomain.vercel.app/api/email/webhook/ses`

### 2. Docker Deployment

#### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - EMAIL_PROVIDER=${EMAIL_PROVIDER}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - FROM_EMAIL=${FROM_EMAIL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    env_file:
      - .env.production
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

#### Step 3: Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. AWS Deployment

#### Step 1: Set up AWS Infrastructure

1. **Create ECS Cluster**:
   ```bash
   aws ecs create-cluster --cluster-name buffrsign-email
   ```

2. **Create ECR Repository**:
   ```bash
   aws ecr create-repository --repository-name buffrsign-email
   ```

3. **Build and push Docker image**:
   ```bash
   # Build image
   docker build -t buffrsign-email .

   # Tag for ECR
   docker tag buffrsign-email:latest <account-id>.dkr.ecr.<region>.amazonaws.com/buffrsign-email:latest

   # Push to ECR
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/buffrsign-email:latest
   ```

#### Step 2: Create ECS Task Definition

```json
{
  "family": "buffrsign-email",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "buffrsign-email",
      "image": "<account-id>.dkr.ecr.<region>.amazonaws.com/buffrsign-email:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "EMAIL_PROVIDER",
          "value": "sendgrid"
        }
      ],
      "secrets": [
        {
          "name": "SENDGRID_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:<region>:<account-id>:secret:email/sendgrid-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/buffrsign-email",
          "awslogs-region": "<region>",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Step 3: Create ECS Service

```bash
aws ecs create-service \
  --cluster buffrsign-email \
  --service-name buffrsign-email-service \
  --task-definition buffrsign-email:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

### 4. Google Cloud Platform Deployment

#### Step 1: Set up Cloud Run

1. **Build and push to Container Registry**:
   ```bash
   # Build image
   docker build -t gcr.io/<project-id>/buffrsign-email .

   # Push to registry
   docker push gcr.io/<project-id>/buffrsign-email
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy buffrsign-email \
     --image gcr.io/<project-id>/buffrsign-email \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production,EMAIL_PROVIDER=sendgrid \
     --set-secrets SENDGRID_API_KEY=sendgrid-api-key:latest
   ```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following variables:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sign.buffr.ai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Provider
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
RESEND_API_KEY=your-resend-api-key
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1

# Email Configuration
FROM_EMAIL=noreply@buffr.ai
FROM_NAME=YourAppName

# System Settings
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000
EMAIL_BATCH_SIZE=100
EMAIL_RATE_LIMIT=1000

# Security
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

### Environment Variable Security

1. **Use secrets management**:
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault

2. **Never commit secrets**:
   - Add `.env*` to `.gitignore`
   - Use environment-specific files
   - Rotate secrets regularly

3. **Use least privilege**:
   - Create service accounts with minimal permissions
   - Use API keys with restricted scopes
   - Enable audit logging

## Database Setup

### Supabase Production Setup

1. **Create production project**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Create new project
   supabase projects create buffrsign-prod
   ```

2. **Apply migrations**:
   ```bash
   # Link to production project
   supabase link --project-ref your-project-ref

   # Apply all migrations
   supabase db push
   ```

3. **Set up RLS policies**:
   ```bash
   # Enable RLS on all tables
   supabase db reset --linked
   ```

### Database Optimization

1. **Create indexes**:
   ```sql
   -- Email notifications indexes
   CREATE INDEX CONCURRENTLY idx_email_notifications_document_id ON email_notifications(document_id);
   CREATE INDEX CONCURRENTLY idx_email_notifications_status ON email_notifications(status);
   CREATE INDEX CONCURRENTLY idx_email_notifications_sent_at ON email_notifications(sent_at);

   -- Email queue indexes
   CREATE INDEX CONCURRENTLY idx_email_queue_status ON email_queue(status);
   CREATE INDEX CONCURRENTLY idx_email_queue_priority ON email_queue(priority);
   CREATE INDEX CONCURRENTLY idx_email_queue_scheduled_at ON email_queue(scheduled_at);
   ```

2. **Set up monitoring**:
   ```sql
   -- Create monitoring views
   CREATE VIEW email_system_health AS
   SELECT 
     COUNT(*) as total_emails,
     COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
     COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
     COUNT(*) FILTER (WHERE status = 'failed') as failed
   FROM email_notifications
   WHERE created_at >= NOW() - INTERVAL '24 hours';
   ```

## Email Provider Setup

### SendGrid Setup

1. **Create SendGrid account**:
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Verify your domain
   - Create API key with Mail Send permissions

2. **Configure webhooks**:
   - Go to Settings → Mail Settings → Event Webhook
   - Set HTTP Post URL: `https://sign.buffr.ai/api/email/webhook/sendgrid`
   - Select events: `delivered`, `bounced`, `dropped`, `spam_report`, `unsubscribe`

3. **Set up IP warmup** (for high volume):
   - Contact SendGrid support
   - Gradually increase sending volume
   - Monitor reputation scores

### Resend Setup

1. **Create Resend account**:
   - Sign up at [resend.com](https://resend.com)
   - Verify your domain
   - Create API key

2. **Configure webhooks**:
   - Go to Webhooks section
   - Create webhook with URL: `https://sign.buffr.ai/api/email/webhook/resend`
   - Select events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`

### AWS SES Setup

1. **Set up SES**:
   - Verify your domain in AWS SES
   - Request production access if needed
   - Create IAM user with SES permissions

2. **Configure SNS notifications**:
   - Create SNS topic for bounces and complaints
   - Set up SNS subscription to your webhook endpoint
   - Configure SES to publish to SNS topic

## Monitoring and Logging

### Application Monitoring

1. **Set up logging**:
   ```typescript
   // lib/logger.ts
   import winston from 'winston';

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
       new winston.transports.File({ filename: 'combined.log' }),
       new winston.transports.Console({
         format: winston.format.simple()
       })
     ]
   });

   export default logger;
   ```

2. **Set up monitoring**:
   - Use services like DataDog, New Relic, or Sentry
   - Monitor email delivery rates
   - Track API response times
   - Set up alerts for failures

### Database Monitoring

1. **Set up database monitoring**:
   ```sql
   -- Create monitoring functions
   CREATE OR REPLACE FUNCTION get_email_system_stats()
   RETURNS TABLE (
     total_emails bigint,
     delivered_emails bigint,
     failed_emails bigint,
     queue_size bigint
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT 
       (SELECT COUNT(*) FROM email_notifications) as total_emails,
       (SELECT COUNT(*) FROM email_notifications WHERE status = 'delivered') as delivered_emails,
       (SELECT COUNT(*) FROM email_notifications WHERE status = 'failed') as failed_emails,
       (SELECT COUNT(*) FROM email_queue WHERE status = 'pending') as queue_size;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Set up alerts**:
   - Monitor queue size
   - Track bounce rates
   - Alert on high failure rates

## Security Considerations

### API Security

1. **Rate limiting**:
   ```typescript
   // lib/rate-limiter.ts
   import rateLimit from 'express-rate-limit';

   export const emailRateLimit = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many email requests from this IP'
   });
   ```

2. **Input validation**:
   ```typescript
   import { z } from 'zod';

   const sendEmailSchema = z.object({
     type: z.enum(['document_invitation', 'signature_reminder', 'document_completed']),
     documentId: z.string().uuid(),
     recipientEmail: z.string().email(),
     recipientName: z.string().min(1).max(100),
     templateData: z.record(z.any())
   });
   ```

3. **Webhook verification**:
   ```typescript
   // Verify SendGrid webhook signature
   import crypto from 'crypto';

   function verifySendGridWebhook(payload: string, signature: string, secret: string): boolean {
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

### Data Security

1. **Encrypt sensitive data**:
   ```typescript
   import crypto from 'crypto';

   const algorithm = 'aes-256-gcm';
   const secretKey = process.env.ENCRYPTION_KEY!;

   function encrypt(text: string): string {
     const iv = crypto.randomBytes(16);
     const cipher = crypto.createCipher(algorithm, secretKey);
     cipher.setAAD(Buffer.from('email-data'));
     
     let encrypted = cipher.update(text, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     
     const authTag = cipher.getAuthTag();
     
     return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
   }
   ```

2. **Audit logging**:
   ```sql
   -- Create audit table
   CREATE TABLE email_audit_log (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID,
     action TEXT NOT NULL,
     resource_type TEXT NOT NULL,
     resource_id TEXT,
     details JSONB,
     ip_address INET,
     user_agent TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create audit trigger
   CREATE OR REPLACE FUNCTION audit_email_operations()
   RETURNS TRIGGER AS $$
   BEGIN
     INSERT INTO email_audit_log (
       user_id, action, resource_type, resource_id, details
     ) VALUES (
       COALESCE(NEW.user_id, OLD.user_id),
       TG_OP,
       TG_TABLE_NAME,
       COALESCE(NEW.id, OLD.id),
       jsonb_build_object(
         'old', row_to_json(OLD),
         'new', row_to_json(NEW)
       )
     );
     RETURN COALESCE(NEW, OLD);
   END;
   $$ LANGUAGE plpgsql;
   ```

## Performance Optimization

### Database Optimization

1. **Connection pooling**:
   ```typescript
   // lib/database.ts
   import { Pool } from 'pg';

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

2. **Query optimization**:
   ```sql
   -- Use prepared statements
   PREPARE get_email_notifications AS
   SELECT * FROM email_notifications 
   WHERE document_id = $1 AND status = $2;

   -- Use indexes effectively
   EXPLAIN ANALYZE SELECT * FROM email_notifications 
   WHERE document_id = 'doc-123' AND status = 'delivered';
   ```

### Caching

1. **Redis caching**:
   ```typescript
   import Redis from 'ioredis';

   const redis = new Redis(process.env.REDIS_URL);

   async function getCachedTemplate(templateId: string) {
     const cached = await redis.get(`template:${templateId}`);
     if (cached) {
       return JSON.parse(cached);
     }
     
     const template = await supabase
       .from('email_templates')
       .select('*')
       .eq('id', templateId)
       .single();
     
     await redis.setex(`template:${templateId}`, 3600, JSON.stringify(template));
     return template;
   }
   ```

2. **CDN for static assets**:
   ```typescript
   // next.config.js
   module.exports = {
     images: {
       domains: ['your-cdn-domain.com'],
     },
     async headers() {
       return [
         {
           source: '/api/email/:path*',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=300, s-maxage=300',
             },
           ],
         },
       ];
     },
   };
   ```

## Backup and Recovery

### Database Backup

1. **Automated backups**:
   ```bash
   # Create backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   pg_dump $DATABASE_URL > backup_$DATE.sql
   
   # Upload to S3
   aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
   
   # Clean up old backups
   find . -name "backup_*.sql" -mtime +7 -delete
   ```

2. **Point-in-time recovery**:
   ```sql
   -- Enable WAL archiving
   ALTER SYSTEM SET wal_level = replica;
   ALTER SYSTEM SET archive_mode = on;
   ALTER SYSTEM SET archive_command = 'cp %p /backup/wal/%f';
   ```

### Application Backup

1. **Configuration backup**:
   ```bash
   # Backup environment variables
   vercel env pull .env.backup
   
   # Backup database schema
   pg_dump --schema-only $DATABASE_URL > schema_backup.sql
   ```

2. **Disaster recovery plan**:
   - Document recovery procedures
   - Test recovery processes regularly
   - Maintain off-site backups
   - Have rollback procedures ready

## Testing in Production

### Health Checks

1. **Create health check endpoint**:
   ```typescript
   // app/api/health/route.ts
   import { NextRequest, NextResponse } from 'next/server';

   export async function GET(request: NextRequest) {
     try {
       // Check database connection
       const { data, error } = await supabase
         .from('email_notifications')
         .select('count')
         .limit(1);
       
       if (error) throw error;

       // Check email provider
       const emailService = new EmailService();
       const isEmailServiceHealthy = await emailService.healthCheck();

       return NextResponse.json({
         status: 'healthy',
         timestamp: new Date().toISOString(),
         services: {
           database: 'healthy',
           email: isEmailServiceHealthy ? 'healthy' : 'unhealthy'
         }
       });
     } catch (error) {
       return NextResponse.json({
         status: 'unhealthy',
         timestamp: new Date().toISOString(),
         error: error.message
       }, { status: 500 });
     }
   }
   ```

2. **Set up monitoring**:
   ```bash
   # Use tools like UptimeRobot or Pingdom
   # Monitor: https://sign.buffr.ai/api/health
   # Alert on failures
   ```

### Load Testing

1. **Create load test script**:
   ```javascript
   // load-test.js
   import http from 'k6/http';
   import { check } from 'k6';

   export let options = {
     stages: [
       { duration: '2m', target: 100 },
       { duration: '5m', target: 100 },
       { duration: '2m', target: 200 },
       { duration: '5m', target: 200 },
       { duration: '2m', target: 0 },
     ],
   };

   export default function() {
     let response = http.post('https://sign.buffr.ai/api/email/send', {
       type: 'document_invitation',
       documentId: 'test-doc',
       recipientEmail: 'test@example.com',
       recipientName: 'Test User',
       templateData: {
         document_title: 'Test Document',
         sender_name: 'Test Sender'
       }
     }, {
       headers: {
         'Authorization': 'Bearer ' + __ENV.TEST_TOKEN,
         'Content-Type': 'application/json'
       }
     });

     check(response, {
       'status is 200': (r) => r.status === 200,
       'response time < 500ms': (r) => r.timings.duration < 500,
     });
   }
   ```

2. **Run load tests**:
   ```bash
   # Install k6
   brew install k6

   # Run load test
   k6 run load-test.js
   ```

## Maintenance

### Regular Maintenance Tasks

1. **Database maintenance**:
   ```sql
   -- Vacuum and analyze tables
   VACUUM ANALYZE email_notifications;
   VACUUM ANALYZE email_queue;
   
   -- Clean up old data
   DELETE FROM email_notifications 
   WHERE created_at < NOW() - INTERVAL '1 year';
   
   -- Update statistics
   REFRESH MATERIALIZED VIEW email_performance_summary;
   ```

2. **Log rotation**:
   ```bash
   # Set up logrotate
   /var/log/email-system/*.log {
     daily
     missingok
     rotate 30
     compress
     delaycompress
     notifempty
     create 644 www-data www-data
   }
   ```

3. **Security updates**:
   ```bash
   # Update dependencies
   npm audit
   npm update
   
   # Update Docker images
   docker pull node:18-alpine
   docker-compose build --no-cache
   ```

### Monitoring and Alerts

1. **Set up alerts**:
   - Email delivery rate drops below 95%
   - Queue size exceeds 1000 items
   - API response time exceeds 2 seconds
   - Error rate exceeds 5%

2. **Regular health checks**:
   - Daily system health reports
   - Weekly performance reviews
   - Monthly security audits

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check API keys and credentials
   - Verify email provider status
   - Check queue processing
   - Review rate limits

2. **High bounce rates**:
   - Verify email addresses
   - Check domain reputation
   - Review email content
   - Implement list hygiene

3. **Performance issues**:
   - Monitor database performance
   - Check queue processing
   - Review API response times
   - Optimize queries

### Debug Tools

1. **Email system test**:
   ```bash
   npm run test:email
   ```

2. **Database queries**:
   ```sql
   -- Check queue status
   SELECT status, COUNT(*) FROM email_queue GROUP BY status;
   
   -- Check recent failures
   SELECT * FROM email_notifications 
   WHERE status = 'failed' 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

3. **Log analysis**:
   ```bash
   # Check error logs
   tail -f /var/log/email-system/error.log
   
   # Search for specific errors
   grep "ERROR" /var/log/email-system/combined.log
   ```

This deployment guide provides comprehensive instructions for deploying the BuffrSign Email System to production. Follow the steps carefully and test thoroughly before going live.
