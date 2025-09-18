#!/usr/bin/env node

/**
 * Send Test Email to pendanek@gmail.com
 * 
 * This script will send a real test email once environment is configured
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

require('dotenv').config({ path: '.env.local' });

const testEmail = 'pendanek@gmail.com';
const ownerEmail = 'george@buffr.ai';
const ownerName = 'George Nekwaya';
const ownerPhone = '+12065308433';

console.log('🚀 BuffrSign - Send Test Email');
console.log('==============================\n');

console.log('📧 Email Details:');
console.log(`   - To: ${testEmail}`);
console.log(`   - From: noreply@buffr.ai`);
console.log(`   - Owner: ${ownerName} (${ownerEmail})`);
console.log(`   - Phone: ${ownerPhone}\n`);

// Check environment configuration
const requiredVars = ['EMAIL_PROVIDER'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Email provider not configured.');
  console.log('\n📋 To send real emails, configure in .env.local:');
  console.log('   EMAIL_PROVIDER=sendgrid  # or resend or ses');
  console.log('   SENDGRID_API_KEY=your_api_key  # if using SendGrid');
  console.log('   RESEND_API_KEY=your_api_key    # if using Resend');
  console.log('   AWS_ACCESS_KEY_ID=your_key     # if using SES');
  console.log('   AWS_SECRET_ACCESS_KEY=your_key # if using SES');
  console.log('\n💡 Run: npm run setup:email  (for interactive setup)');
  process.exit(1);
}

// Import email service
let EmailService;
try {
  const { EmailService: ES } = require('../lib/services/email');
  EmailService = ES;
} catch (error) {
  console.log('❌ Could not import EmailService:', error.message);
  console.log('   Make sure the email system is properly installed.');
  process.exit(1);
}

// Create email service instance
let emailService;
try {
  emailService = new EmailService();
  console.log('✅ EmailService initialized');
} catch (error) {
  console.log('❌ Failed to initialize EmailService:', error.message);
  process.exit(1);
}

// Create test document data
const testDocument = {
  id: 'test-doc-' + Date.now(),
  title: 'BuffrSign Test Document - Email Integration',
  description: 'This is a test document to verify email functionality with BuffrSign',
  ownerName: ownerName,
  ownerEmail: ownerEmail,
  ownerPhone: ownerPhone,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  recipientName: 'Test Recipient'
};

// Send test email
const sendTestEmail = async () => {
  console.log('\n📤 Sending test email...');
  console.log(`   Document: ${testDocument.title}`);
  console.log(`   Owner: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
  console.log(`   Phone: ${testDocument.ownerPhone}`);
  console.log(`   Recipient: ${testEmail}`);
  
  try {
    const result = await emailService.sendDocumentInvitation({
      documentId: testDocument.id,
      recipientEmail: testEmail,
      recipientName: testDocument.recipientName,
      documentTitle: testDocument.title,
      senderName: testDocument.ownerName,
      senderEmail: testDocument.ownerEmail,
      senderPhone: testDocument.ownerPhone,
      expiresAt: testDocument.expiresAt,
      customMessage: 'This is a test email from BuffrSign to verify email functionality.'
    });
    
    console.log('\n✅ Email sent successfully!');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Provider: ${result.provider}`);
    
    console.log('\n📧 Email Details:');
    console.log(`   - To: ${testEmail}`);
    console.log(`   - From: noreply@buffr.ai`);
    console.log(`   - Subject: Document Signature Request: ${testDocument.title}`);
    console.log(`   - Document: ${testDocument.title}`);
    console.log(`   - Owner: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
    console.log(`   - Phone: ${testDocument.ownerPhone}`);
    console.log(`   - Expires: ${testDocument.expiresAt.toLocaleDateString()}`);
    
    console.log('\n🎉 Test email sent to pendanek@gmail.com!');
    console.log('   Check the inbox for the email.');
    
  } catch (error) {
    console.log('\n❌ Failed to send email:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check email provider API key configuration');
    console.log('   2. Verify FROM_EMAIL domain is authorized');
    console.log('   3. Check email provider account status');
    console.log('   4. Review error logs for more details');
  }
};

// Run the test
sendTestEmail().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
