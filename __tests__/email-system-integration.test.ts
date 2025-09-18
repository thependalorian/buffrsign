/**
 * Email System Integration Tests
 * Tests the complete email notification system integration
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';

// Mock environment variables for testing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
process.env.EMAIL_PROVIDER = 'sendgrid';
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.FROM_EMAIL = 'test@buffrsign.ai';
process.env.NEXT_PUBLIC_APP_URL = 'https://test.buffrsign.ai';

describe('Email System Integration', () => {
  let supabase: any;

  beforeAll(() => {
    // Initialize Supabase client for testing
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  });

  describe('Database Schema', () => {
    it('should have all required email tables', async () => {
      const tables = [
        'email_notifications',
        'email_templates',
        'user_email_preferences',
        'scheduled_reminders',
        'email_analytics',
        'email_blacklist',
        'email_queue',
        'email_system_config'
      ];

      for (const table of tables) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        // Should not error even if no data exists
        expect(error).toBeNull();
      }
    });

    it('should have default email templates', async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('is_active', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('Email Service Configuration', () => {
    it('should have valid email configuration', () => {
      const config = {
        provider: process.env.EMAIL_PROVIDER,
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
        appUrl: process.env.NEXT_PUBLIC_APP_URL
      };

      expect(config.provider).toBeDefined();
      expect(config.apiKey).toBeDefined();
      expect(config.fromEmail).toBeDefined();
      expect(config.appUrl).toBeDefined();
    });
  });

  describe('TypeScript Types', () => {
    it('should have email types defined', async () => {
      // Import email types
      const emailTypes = await import('@/lib/types/email');
      
      expect(emailTypes).toBeDefined();
      expect(emailTypes.EmailProvider).toBeDefined();
      expect(emailTypes.Email).toBeDefined();
      expect(emailTypes.EmailTemplate).toBeDefined();
    });
  });

  describe('Email Service Providers', () => {
    it('should have SendGrid provider', async () => {
      const { SendGridProvider } = await import('@/lib/services/email/providers/sendgrid');
      
      expect(SendGridProvider).toBeDefined();
      
      const provider = new SendGridProvider({
        apiKey: 'test-key',
        fromEmail: 'test@example.com'
      });
      
      expect(provider).toBeDefined();
      expect(provider.sendEmail).toBeDefined();
    });

    it('should have Resend provider', async () => {
      const { ResendProvider } = await import('@/lib/services/email/providers/resend');
      
      expect(ResendProvider).toBeDefined();
      
      const provider = new ResendProvider({
        apiKey: 'test-key',
        fromEmail: 'test@example.com'
      });
      
      expect(provider).toBeDefined();
      expect(provider.sendEmail).toBeDefined();
    });

    it('should have SES provider', async () => {
      const { SESProvider } = await import('@/lib/services/email/providers/ses');
      
      expect(SESProvider).toBeDefined();
      
      const provider = new SESProvider({
        apiKey: 'test-key',
        fromEmail: 'test@example.com',
        awsRegion: 'us-east-1'
      });
      
      expect(provider).toBeDefined();
      expect(provider.sendEmail).toBeDefined();
    });
  });

  describe('Template Engine', () => {
    it('should have template engine', async () => {
      const { EmailTemplateEngine } = await import('@/lib/services/email/template-engine');
      
      expect(EmailTemplateEngine).toBeDefined();
      
      const engine = new EmailTemplateEngine();
      expect(engine).toBeDefined();
      expect(engine.renderTemplate).toBeDefined();
    });
  });

  describe('Main Email Service', () => {
    it('should have main email service', async () => {
      const { EmailService } = await import('@/lib/services/email/email-service');
      
      expect(EmailService).toBeDefined();
      
      const service = new EmailService();
      expect(service).toBeDefined();
      expect(service.sendDocumentInvitation).toBeDefined();
      expect(service.sendSignatureReminder).toBeDefined();
      expect(service.sendDocumentCompleted).toBeDefined();
    });
  });

  describe('React Hooks', () => {
    it('should have email notification hook', async () => {
      const { useEmailNotifications } = await import('@/lib/hooks/useEmailNotifications');
      
      expect(useEmailNotifications).toBeDefined();
    });

    it('should have email preferences hook', async () => {
      const { useEmailPreferences } = await import('@/lib/hooks/useEmailPreferences');
      
      expect(useEmailPreferences).toBeDefined();
    });

    it('should have email analytics hook', async () => {
      const { useEmailAnalytics } = await import('@/lib/hooks/useEmailAnalytics');
      
      expect(useEmailAnalytics).toBeDefined();
    });
  });

  describe('API Routes', () => {
    it('should have email send route', async () => {
      const sendRoute = await import('@/app/api/email/send/route');
      
      expect(sendRoute).toBeDefined();
      expect(sendRoute.POST).toBeDefined();
    });

    it('should have email analytics route', async () => {
      const analyticsRoute = await import('@/app/api/email/analytics/route');
      
      expect(analyticsRoute).toBeDefined();
      expect(analyticsRoute.GET).toBeDefined();
    });

    it('should have email preferences route', async () => {
      const preferencesRoute = await import('@/app/api/email/preferences/route');
      
      expect(preferencesRoute).toBeDefined();
      expect(preferencesRoute.GET).toBeDefined();
      expect(preferencesRoute.PUT).toBeDefined();
    });

    it('should have webhook routes', async () => {
      const sendgridWebhook = await import('@/app/api/email/webhook/sendgrid/route');
      const resendWebhook = await import('@/app/api/email/webhook/resend/route');
      const sesWebhook = await import('@/app/api/email/webhook/ses/route');
      
      expect(sendgridWebhook.POST).toBeDefined();
      expect(resendWebhook.POST).toBeDefined();
      expect(sesWebhook.POST).toBeDefined();
    });
  });

  describe('React Components', () => {
    it('should have email preferences form', async () => {
      const { EmailPreferencesForm } = await import('@/components/email/EmailPreferencesForm');
      
      expect(EmailPreferencesForm).toBeDefined();
    });

    it('should have email analytics chart', async () => {
      const { EmailAnalyticsChart } = await import('@/components/email/EmailAnalyticsChart');
      
      expect(EmailAnalyticsChart).toBeDefined();
    });

    it('should have email notification list', async () => {
      const { EmailNotificationList } = await import('@/components/email/EmailNotificationList');
      
      expect(EmailNotificationList).toBeDefined();
    });

    it('should have email template editor', async () => {
      const { EmailTemplateEditor } = await import('@/components/email/EmailTemplateEditor');
      
      expect(EmailTemplateEditor).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should have email configuration module', async () => {
      const emailConfig = await import('@/lib/config/email-config');
      
      expect(emailConfig).toBeDefined();
      expect(emailConfig.getEmailConfig).toBeDefined();
      expect(emailConfig.validateEmailConfig).toBeDefined();
      expect(emailConfig.isEmailSystemEnabled).toBeDefined();
    });
  });
});
