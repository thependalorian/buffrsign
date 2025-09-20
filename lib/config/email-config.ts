/**
 * Email System Configuration
 * Centralized configuration for the BuffrSign email notification system
 */

export interface EmailConfig {
  // Provider Configuration
  provider: 'sendgrid' | 'resend' | 'ses';
  apiKey: string;
  fromEmail: string;
  fromName: string;
  
  // AWS SES specific
  awsRegion?: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  
  // System Configuration
  queueEnabled: boolean;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  rateLimit: number;
  
  // Application URLs
  appUrl: string;
  
  // Supabase Configuration
  supabaseUrl: string;
  supabaseKey: string;
}

export const getEmailConfig = (): EmailConfig => {
  const provider = (process.env.EMAIL_PROVIDER as 'sendgrid' | 'resend' | 'ses') || 'sendgrid';
  
  return {
    // Provider Configuration
    provider,
    apiKey: getProviderApiKey(provider),
    fromEmail: process.env.FROM_EMAIL || 'noreply@buffr.ai',
    fromName: process.env.FROM_NAME || 'BuffrSign',
    
    // AWS SES specific
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    
    // System Configuration
    queueEnabled: process.env.EMAIL_QUEUE_ENABLED === 'true',
    retryAttempts: parseInt(process.env.EMAIL_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '300000'),
    batchSize: parseInt(process.env.EMAIL_BATCH_SIZE || '100'),
    rateLimit: parseInt(process.env.EMAIL_RATE_LIMIT || '1000'),
    
    // Application URLs
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://sign.buffr.ai',
    
    // Supabase Configuration
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  };
};

const getProviderApiKey = (provider: string): string => {
  switch (provider) {
    case 'sendgrid':
      return process.env.SENDGRID_API_KEY || '';
    case 'resend':
      return process.env.RESEND_API_KEY || '';
    case 'ses':
      return process.env.AWS_ACCESS_KEY_ID || '';
    default:
      return '';
  }
};

export const validateEmailConfig = (config: EmailConfig): string[] => {
  const errors: string[] = [];
  
  if (!config.apiKey) {
    errors.push(`API key is required for ${config.provider} provider`);
  }
  
  if (!config.fromEmail) {
    errors.push('FROM_EMAIL is required');
  }
  
  if (!config.supabaseUrl) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
  }
  
  if (!config.supabaseKey) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY is required');
  }
  
  if (config.provider === 'ses') {
    if (!config.awsAccessKeyId) {
      errors.push('AWS_ACCESS_KEY_ID is required for SES provider');
    }
    if (!config.awsSecretAccessKey) {
      errors.push('AWS_SECRET_ACCESS_KEY is required for SES provider');
    }
  }
  
  return errors;
};

export const isEmailSystemEnabled = (): boolean => {
  const config = getEmailConfig();
  const errors = validateEmailConfig(config);
  return errors.length === 0;
};

export { getEmailConfig as emailConfig };
export default getEmailConfig;
