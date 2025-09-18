#!/usr/bin/env node

/**
 * Quick Email Setup for BuffrSign
 * 
 * Sets up email configuration with SendGrid as default
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 BuffrSign Quick Email Setup');
console.log('==============================\n');

const envPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found');
  console.log('   Please create .env.local with your Supabase configuration first');
  process.exit(1);
}

// Read existing .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

// Email configuration to add
const emailConfig = `
# Email System Configuration (Required for Email Notifications)
# Primary Email Provider (choose one: sendgrid, resend, ses)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
RESEND_API_KEY=your_resend_api_key_here
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here
AWS_REGION=us-east-1

# Email Configuration
FROM_EMAIL=noreply@buffr.ai
FROM_NAME=BuffrSign
NEXT_PUBLIC_APP_URL=https://sign.buffr.ai

# Email System Settings
EMAIL_QUEUE_ENABLED=true
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=300000
EMAIL_BATCH_SIZE=100
EMAIL_RATE_LIMIT=1000`;

// Check if email config already exists
if (envContent.includes('EMAIL_PROVIDER')) {
  console.log('✅ Email configuration already exists in .env.local');
  console.log('\n📧 Current Email Configuration:');
  
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('EMAIL_') || line.includes('FROM_') || line.includes('NEXT_PUBLIC_APP_URL')) {
      console.log(`   ${line}`);
    }
  });
} else {
  // Add email configuration
  envContent += emailConfig;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Email configuration added to .env.local');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your SendGrid API key from https://app.sendgrid.com/settings/api_keys');
console.log('2. Replace "your_sendgrid_api_key_here" with your actual API key');
console.log('3. Or use Resend: get API key from https://resend.com/api-keys');
console.log('4. Or use AWS SES: configure AWS credentials');

console.log('\n🔧 To send test emails:');
console.log('   npm run send-test-email');

console.log('\n📧 Test Configuration:');
console.log('   - To: pendanek@gmail.com');
console.log('   - From: noreply@buffr.ai');
console.log('   - Owner: George Nekwaya (george@buffr.ai)');
console.log('   - Phone: +12065308433');

console.log('\n✨ Email system is ready for configuration!');
