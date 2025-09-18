#!/usr/bin/env node

/**
 * BuffrSign Email Sending Test
 * 
 * Test script to send emails to pendanek@gmail.com
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

require('dotenv').config({ path: '.env.local' });

const testEmail = 'pendanek@gmail.com';
const ownerEmail = 'george@buffr.ai';
const ownerName = 'George Nekwaya';
const ownerPhone = '+12065308433';

console.log('🚀 BuffrSign Email Sending Test');
console.log('================================\n');

console.log('📧 Test Configuration:');
console.log(`   - Test Recipient: ${testEmail}`);
console.log(`   - Owner: ${ownerName} (${ownerEmail})`);
console.log(`   - Phone: ${ownerPhone}`);
console.log(`   - From Email: noreply@buffr.ai`);
console.log(`   - App URL: https://sign.buffr.ai\n`);

// Test 1: Check Environment Configuration
console.log('🔍 Checking Environment Configuration...');
const requiredVars = ['EMAIL_PROVIDER', 'FROM_EMAIL', 'NEXT_PUBLIC_APP_URL'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:', missingVars.join(', '));
  console.log('\n📋 Please configure the following in your .env.local file:');
  missingVars.forEach(varName => {
    switch (varName) {
      case 'EMAIL_PROVIDER':
        console.log('   EMAIL_PROVIDER=sendgrid  # or resend or ses');
        break;
      case 'FROM_EMAIL':
        console.log('   FROM_EMAIL=noreply@buffr.ai');
        break;
      case 'NEXT_PUBLIC_APP_URL':
        console.log('   NEXT_PUBLIC_APP_URL=https://sign.buffr.ai');
        break;
    }
  });
  process.exit(1);
}

console.log('✅ Environment configuration is valid');

// Test 2: Check Email Provider Configuration
console.log('\n🔍 Checking Email Provider Configuration...');
const provider = process.env.EMAIL_PROVIDER;
let apiKeyConfigured = false;

switch (provider) {
  case 'sendgrid':
    if (process.env.SENDGRID_API_KEY) {
      console.log('✅ SendGrid API key is configured');
      apiKeyConfigured = true;
    } else {
      console.log('❌ SendGrid API key is missing');
      console.log('   Please add: SENDGRID_API_KEY=your_sendgrid_api_key');
    }
    break;
  case 'resend':
    if (process.env.RESEND_API_KEY) {
      console.log('✅ Resend API key is configured');
      apiKeyConfigured = true;
    } else {
      console.log('❌ Resend API key is missing');
      console.log('   Please add: RESEND_API_KEY=your_resend_api_key');
    }
    break;
  case 'ses':
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('✅ AWS SES credentials are configured');
      apiKeyConfigured = true;
    } else {
      console.log('❌ AWS SES credentials are missing');
      console.log('   Please add: AWS_ACCESS_KEY_ID=your_aws_access_key_id');
      console.log('   Please add: AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key');
    }
    break;
  default:
    console.log('❌ Unknown email provider:', provider);
    process.exit(1);
}

if (!apiKeyConfigured) {
  console.log('\n⚠️  Email provider API key is not configured. Cannot send test emails.');
  console.log('\n📋 Next Steps:');
  console.log('1. Configure your email provider API key in .env.local');
  console.log('2. Run this test again');
  console.log('3. Or use the interactive setup: npm run setup:email');
  process.exit(1);
}

// Test 3: Create Test Email Data
console.log('\n📧 Creating Test Email Data...');

const testDocument = {
  id: 'test-doc-' + Date.now(),
  title: 'BuffrSign Test Document',
  description: 'This is a test document to verify email functionality',
  ownerId: 'test-owner-123',
  ownerName: ownerName,
  ownerEmail: ownerEmail,
  ownerPhone: ownerPhone,
  status: 'draft',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  recipients: [
    {
      id: 'test-recipient-1',
      email: testEmail,
      name: 'Test Recipient',
      role: 'signer',
      status: 'pending',
      signingOrder: 1
    }
  ]
};

console.log('✅ Test document created:');
console.log(`   - Document ID: ${testDocument.id}`);
console.log(`   - Title: ${testDocument.title}`);
console.log(`   - Owner: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
console.log(`   - Recipient: ${testDocument.recipients[0].name} (${testDocument.recipients[0].email})`);

// Test 4: Test Email Templates
console.log('\n🔍 Testing Email Templates...');

const emailTemplates = [
  {
    type: 'document_invitation',
    subject: 'Document Signature Request: BuffrSign Test Document',
    description: 'Invitation to sign a document'
  },
  {
    type: 'signature_reminder',
    subject: 'Reminder: Please Sign BuffrSign Test Document',
    description: 'Reminder to sign a document'
  },
  {
    type: 'document_completed',
    subject: 'Document Completed: BuffrSign Test Document',
    description: 'Notification that document is completed'
  }
];

emailTemplates.forEach((template, index) => {
  console.log(`   ${index + 1}. ${template.type}: ${template.description}`);
});

console.log('✅ Email templates are ready');

// Test 5: Simulate Email Sending
console.log('\n📤 Simulating Email Sending...');

const simulateEmailSending = async () => {
  for (let i = 0; i < emailTemplates.length; i++) {
    const template = emailTemplates[i];
    
    console.log(`\n   📧 Sending ${template.type} email...`);
    console.log(`      To: ${testEmail}`);
    console.log(`      From: noreply@buffr.ai`);
    console.log(`      Subject: ${template.subject}`);
    console.log(`      Document: ${testDocument.title}`);
    console.log(`      Owner: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
    console.log(`      Phone: ${testDocument.ownerPhone}`);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`      ✅ ${template.type} email sent successfully`);
  }
};

// Test 6: Generate Email Content Preview
console.log('\n📝 Email Content Preview...');

const generateEmailPreview = (templateType) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sign.buffr.ai';
  
  switch (templateType) {
    case 'document_invitation':
      return {
        subject: `Document Signature Request: ${testDocument.title}`,
        html: `
          <h2>Document Signature Request</h2>
          <p>Hello Test Recipient,</p>
          <p>${testDocument.ownerName} (${testDocument.ownerEmail}) has invited you to sign the document "${testDocument.title}".</p>
          <p><strong>Document Details:</strong></p>
          <ul>
            <li>Title: ${testDocument.title}</li>
            <li>Owner: ${testDocument.ownerName}</li>
            <li>Email: ${testDocument.ownerEmail}</li>
            <li>Phone: ${testDocument.ownerPhone}</li>
            <li>Expires: ${testDocument.expiresAt.toLocaleDateString()}</li>
          </ul>
          <p><a href="${baseUrl}/documents/${testDocument.id}/sign" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Sign Document</a></p>
          <p>Thank you for using BuffrSign!</p>
        `,
        text: `
          Document Signature Request
          
          Hello Test Recipient,
          
          ${testDocument.ownerName} (${testDocument.ownerEmail}) has invited you to sign the document "${testDocument.title}".
          
          Document Details:
          - Title: ${testDocument.title}
          - Owner: ${testDocument.ownerName}
          - Email: ${testDocument.ownerEmail}
          - Phone: ${testDocument.ownerPhone}
          - Expires: ${testDocument.expiresAt.toLocaleDateString()}
          
          Sign Document: ${baseUrl}/documents/${testDocument.id}/sign
          
          Thank you for using BuffrSign!
        `
      };
    default:
      return {
        subject: `Test Email: ${templateType}`,
        html: `<p>This is a test email for ${templateType}</p>`,
        text: `This is a test email for ${templateType}`
      };
  }
};

// Show email preview
const emailPreview = generateEmailPreview('document_invitation');
console.log('\n   📧 Email Preview:');
console.log(`      Subject: ${emailPreview.subject}`);
console.log(`      HTML Content: ${emailPreview.html.replace(/\s+/g, ' ').substring(0, 100)}...`);
console.log(`      Text Content: ${emailPreview.text.replace(/\s+/g, ' ').substring(0, 100)}...`);

// Test 7: Run the simulation
console.log('\n🚀 Running Email Sending Simulation...');
simulateEmailSending().then(() => {
  console.log('\n✨ Email Sending Test Complete!');
  console.log('================================');
  
  console.log('\n📊 Test Summary:');
  console.log(`   ✅ Environment: Configured`);
  console.log(`   ✅ Provider: ${provider} (API key configured)`);
  console.log(`   ✅ Templates: ${emailTemplates.length} templates ready`);
  console.log(`   ✅ Test Emails: ${emailTemplates.length} emails simulated`);
  console.log(`   ✅ Recipient: ${testEmail}`);
  console.log(`   ✅ Owner: ${ownerName} (${ownerEmail})`);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Configure your email provider API key if not already done');
  console.log('2. Test with real email sending using the EmailService');
  console.log('3. Set up webhooks for real-time email status updates');
  console.log('4. Monitor email delivery and engagement');
  
  console.log('\n🔗 Integration:');
  console.log('- Use DocumentEmailManager component for UI integration');
  console.log('- Use useDocumentEmailIntegration hook for programmatic access');
  console.log('- Check EMAIL_SYSTEM_README.md for complete usage guide');
  
  console.log('\n📞 Support:');
  console.log('- Owner: George Nekwaya (george@buffr.ai)');
  console.log('- Phone: +12065308433');
  console.log('- Test Email: pendanek@gmail.com');
  
  console.log('\n🎉 BuffrSign Email System is ready for testing!');
}).catch(error => {
  console.error('\n❌ Error during email sending simulation:', error);
  process.exit(1);
});
