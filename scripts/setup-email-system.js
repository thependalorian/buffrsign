#!/usr/bin/env node

/**
 * BuffrSign Email System Setup Script
 * 
 * Interactive setup script for configuring the email system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupEmailSystem() {
  console.log('🚀 BuffrSign Email System Setup');
  console.log('================================\n');

  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  
  let envContent = '';
  if (envExists) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ Found existing .env.local file');
  } else {
    console.log('📝 Creating new .env.local file');
  }

  console.log('\n📧 Email Provider Configuration');
  console.log('Choose your email provider:');
  console.log('1. SendGrid (Recommended)');
  console.log('2. Resend');
  console.log('3. AWS SES');
  
  const providerChoice = await question('Enter your choice (1-3): ');
  
  let provider = '';
  let apiKeyVar = '';
  let apiKeyValue = '';
  
  switch (providerChoice) {
    case '1':
      provider = 'sendgrid';
      apiKeyVar = 'SENDGRID_API_KEY';
      break;
    case '2':
      provider = 'resend';
      apiKeyVar = 'RESEND_API_KEY';
      break;
    case '3':
      provider = 'ses';
      apiKeyVar = 'AWS_ACCESS_KEY_ID';
      break;
    default:
      console.log('❌ Invalid choice. Using SendGrid as default.');
      provider = 'sendgrid';
      apiKeyVar = 'SENDGRID_API_KEY';
  }

  console.log(`\n🔑 ${provider.toUpperCase()} Configuration`);
  apiKeyValue = await question(`Enter your ${apiKeyVar}: `);
  
  if (provider === 'ses') {
    const awsSecretKey = await question('Enter your AWS_SECRET_ACCESS_KEY: ');
    const awsRegion = await question('Enter your AWS_REGION (default: us-east-1): ') || 'us-east-1';
    
    envContent = updateEnvVar(envContent, 'AWS_SECRET_ACCESS_KEY', awsSecretKey);
    envContent = updateEnvVar(envContent, 'AWS_REGION', awsRegion);
  }

  // Email configuration
  console.log('\n📧 Email Configuration');
  const fromEmail = await question('Enter FROM_EMAIL (default: noreply@buffr.ai): ') || 'noreply@buffr.ai';
  const fromName = await question('Enter FROM_NAME (default: BuffrSign): ') || 'BuffrSign';
  const appUrl = await question('Enter NEXT_PUBLIC_APP_URL (default: https://sign.buffr.ai): ') || 'https://sign.buffr.ai';

  // System settings
  console.log('\n⚙️ System Settings');
  const queueEnabled = await question('Enable email queue? (y/n, default: y): ') || 'y';
  const retryAttempts = await question('Email retry attempts (default: 3): ') || '3';
  const retryDelay = await question('Email retry delay in minutes (default: 5): ') || '5';
  const batchSize = await question('Email batch size (default: 100): ') || '100';
  const rateLimit = await question('Email rate limit per minute (default: 1000): ') || '1000';

  // Update environment variables
  envContent = updateEnvVar(envContent, 'EMAIL_PROVIDER', provider);
  envContent = updateEnvVar(envContent, apiKeyVar, apiKeyValue);
  envContent = updateEnvVar(envContent, 'FROM_EMAIL', fromEmail);
  envContent = updateEnvVar(envContent, 'FROM_NAME', fromName);
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_APP_URL', appUrl);
  envContent = updateEnvVar(envContent, 'EMAIL_QUEUE_ENABLED', queueEnabled === 'y' ? 'true' : 'false');
  envContent = updateEnvVar(envContent, 'EMAIL_RETRY_ATTEMPTS', retryAttempts);
  envContent = updateEnvVar(envContent, 'EMAIL_RETRY_DELAY', (parseInt(retryDelay) * 60000).toString());
  envContent = updateEnvVar(envContent, 'EMAIL_BATCH_SIZE', batchSize);
  envContent = updateEnvVar(envContent, 'EMAIL_RATE_LIMIT', rateLimit);

  // Write the updated .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Environment configuration saved to .env.local');

  // Test the configuration
  console.log('\n🧪 Testing Configuration...');
  
  try {
    // Load the environment variables
    require('dotenv').config({ path: envPath });
    
    // Test basic configuration
    const requiredVars = ['EMAIL_PROVIDER', 'FROM_EMAIL', 'NEXT_PUBLIC_APP_URL'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing required environment variables:', missingVars.join(', '));
    } else {
      console.log('✅ Basic configuration is valid');
    }
    
    // Test API key
    if (process.env[apiKeyVar]) {
      console.log(`✅ ${apiKeyVar} is configured`);
    } else {
      console.log(`❌ ${apiKeyVar} is missing`);
    }
    
  } catch (error) {
    console.log('❌ Error testing configuration:', error.message);
  }

  // Provide next steps
  console.log('\n🎉 Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Test the email system: npm run test:email');
  console.log('2. Start the development server: npm run dev');
  console.log('3. Test sending an email using the EmailService');
  console.log('4. Set up webhooks for your email provider');
  console.log('5. Monitor email analytics in the dashboard');
  
  console.log('\n📚 Documentation:');
  console.log('- EMAIL_SYSTEM_README.md - Complete system overview');
  console.log('- EMAIL_API_DOCUMENTATION.md - API reference');
  console.log('- EMAIL_DEPLOYMENT_GUIDE.md - Deployment instructions');
  console.log('- EMAIL_TROUBLESHOOTING_GUIDE.md - Troubleshooting guide');
  
  console.log('\n🔗 Integration Examples:');
  console.log('- examples/email-usage-examples.tsx - Basic usage examples');
  console.log('- examples/document-email-integration-example.tsx - Document integration examples');

  rl.close();
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const newLine = `${key}=${value}`;
  
  if (regex.test(content)) {
    return content.replace(regex, newLine);
  } else {
    return content + (content.endsWith('\n') ? '' : '\n') + newLine + '\n';
  }
}

// Run the setup
setupEmailSystem().catch(console.error);
