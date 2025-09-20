/**
 * Email Providers Index
 * 
 * Exports all email providers for the BuffrSign email system.
 */

export { SendGridProvider } from './sendgrid';
export { ResendProvider } from './resend';
export { SESProvider } from './ses';

// Provider factory function
export function createEmailProvider(
  provider: 'sendgrid' | 'resend' | 'ses',
  config: unknown
) {
  switch (provider) {
    case 'sendgrid':
      return new SendGridProvider(config);
    case 'resend':
      return new ResendProvider(config);
    case 'ses':
      return new SESProvider(config);
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}
