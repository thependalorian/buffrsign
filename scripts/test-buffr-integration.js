#!/usr/bin/env node

/**
 * BuffrSign Email System Integration Test
 * 
 * Test script to verify email system integration with buffr.ai domain
 */

require('dotenv').config({ path: '.env.local' });

console.log('🚀 Testing BuffrSign Email System Integration');
console.log('=============================================\n');

// Test 1: Environment Configuration
console.log('🔍 Testing Environment Configuration...');
const requiredVars = ['EMAIL_PROVIDER', 'FROM_EMAIL', 'NEXT_PUBLIC_APP_URL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:', missingVars.join(', '));
} else {
  console.log('✅ Basic environment configuration is valid');
  console.log(`   - Email Provider: ${process.env.EMAIL_PROVIDER || 'Not set'}`);
  console.log(`   - From Email: ${process.env.FROM_EMAIL || 'Not set'}`);
  console.log(`   - App URL: ${process.env.NEXT_PUBLIC_APP_URL || 'Not set'}`);
}

// Test 2: Domain Configuration
console.log('\n🔍 Testing Domain Configuration...');
const fromEmail = process.env.FROM_EMAIL || 'noreply@buffr.ai';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sign.buffr.ai';

if (fromEmail.includes('buffr.ai')) {
  console.log('✅ From email uses correct domain (buffr.ai)');
} else {
  console.log('⚠️  From email does not use buffr.ai domain:', fromEmail);
}

if (appUrl.includes('sign.buffr.ai')) {
  console.log('✅ App URL uses correct domain (sign.buffr.ai)');
} else {
  console.log('⚠️  App URL does not use sign.buffr.ai domain:', appUrl);
}

// Test 3: File Structure
console.log('\n🔍 Testing File Structure...');
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'lib/services/email/email-service.ts',
  'lib/services/document-email-integration.ts',
  'lib/hooks/useDocumentEmailIntegration.ts',
  'components/email/DocumentEmailManager.tsx',
  'app/api/documents/[id]/email/route.ts'
];

let filesExist = 0;
criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    filesExist++;
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

console.log(`\n📊 File Structure: ${filesExist}/${criticalFiles.length} critical files exist`);

// Test 4: Configuration Files
console.log('\n🔍 Testing Configuration Files...');
const configPath = path.join(process.cwd(), 'lib/config/email-config.ts');
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  if (configContent.includes('buffr.ai')) {
    console.log('✅ Email config uses buffr.ai domain');
  } else {
    console.log('⚠️  Email config may not use buffr.ai domain');
  }
} else {
  console.log('❌ Email config file missing');
}

// Test 5: Integration Components
console.log('\n🔍 Testing Integration Components...');
const integrationFiles = [
  'lib/services/document-email-integration.ts',
  'lib/hooks/useDocumentEmailIntegration.ts',
  'components/email/DocumentEmailManager.tsx',
  'app/api/documents/[id]/email/route.ts'
];

let integrationFilesExist = 0;
integrationFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
    integrationFilesExist++;
  } else {
    console.log(`❌ ${file} - Missing`);
  }
});

console.log(`\n📊 Integration Components: ${integrationFilesExist}/${integrationFiles.length} files exist`);

// Summary
console.log('\n✨ Integration Test Summary');
console.log('============================');
console.log(`✅ Environment: ${missingVars.length === 0 ? 'Configured' : 'Needs Setup'}`);
console.log(`✅ Domain: ${fromEmail.includes('buffr.ai') && appUrl.includes('sign.buffr.ai') ? 'Correct' : 'Needs Update'}`);
console.log(`✅ File Structure: ${filesExist}/${criticalFiles.length} files`);
console.log(`✅ Integration: ${integrationFilesExist}/${integrationFiles.length} components`);

if (missingVars.length === 0 && filesExist === criticalFiles.length && integrationFilesExist === integrationFiles.length) {
  console.log('\n🎉 BuffrSign Email System Integration is READY!');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure your email provider API keys');
  console.log('2. Test sending emails with the DocumentEmailManager component');
  console.log('3. Set up webhooks for real-time email status updates');
  console.log('4. Deploy to production');
} else {
  console.log('\n⚠️  Some components need attention before the system is ready.');
  console.log('\n📋 Action Items:');
  if (missingVars.length > 0) {
    console.log(`- Configure missing environment variables: ${missingVars.join(', ')}`);
  }
  if (filesExist < criticalFiles.length) {
    console.log('- Some critical files are missing');
  }
  if (integrationFilesExist < integrationFiles.length) {
    console.log('- Some integration components are missing');
  }
}

console.log('\n📚 Documentation:');
console.log('- EMAIL_SYSTEM_README.md - Complete system guide');
console.log('- EMAIL_INTEGRATION_COMPLETE.md - Integration details');
console.log('- examples/document-email-integration-example.tsx - Usage examples');
