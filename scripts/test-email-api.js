#!/usr/bin/env node

/**
 * Test Email Sending via API
 * 
 * This script tests sending emails via the API route
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

require('dotenv').config({ path: '.env.local' });

const testEmail = 'pendanek@gmail.com';
const ownerEmail = 'george@buffr.ai';
const ownerName = 'George Nekwaya';
const ownerPhone = '+12065308433';

console.log('🚀 BuffrSign - Test Email via API');
console.log('=================================\n');

console.log('📧 Email Details:');
console.log(`   - To: ${testEmail}`);
console.log(`   - From: noreply@mail.buffr.ai`);
console.log(`   - Owner: ${ownerName} (${ownerEmail})`);
console.log(`   - Phone: ${ownerPhone}\n`);

// Test email sending via API
const sendTestEmail = async () => {
  console.log('📤 Sending test email via API...');
  
  try {
    const emailData = {
      to: testEmail,
      email_type: 'document_invitation',
      documentId: 'test-doc-' + Date.now(),
      recipientName: 'Test Recipient',
      documentTitle: 'BuffrSign Test Document - Email Integration',
      senderName: ownerName,
      senderEmail: ownerEmail,
      senderPhone: ownerPhone,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      customMessage: 'This is a test email from BuffrSign to verify email functionality.'
    };

    console.log('   📧 Email Data:');
    console.log(`      To: ${emailData.to}`);
    console.log(`      Type: ${emailData.email_type}`);
    console.log(`      Document: ${emailData.documentTitle}`);
    console.log(`      Sender: ${emailData.senderName} (${emailData.senderEmail})`);
    console.log(`      Phone: ${emailData.senderPhone}`);

    const response = await fetch('http://localhost:3002/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ Email sent successfully!');
      console.log(`      Message ID: ${result.messageId || 'N/A'}`);
      console.log(`      Status: ${result.status || 'sent'}`);
      console.log(`      Provider: ${result.provider || 'SendGrid'}`);
      
      console.log('\n📧 Email Details:');
      console.log(`   - To: ${testEmail}`);
      console.log(`   - From: noreply@mail.buffr.ai`);
      console.log(`   - Subject: Document Signature Request: ${emailData.documentTitle}`);
      console.log(`   - Document: ${emailData.documentTitle}`);
      console.log(`   - Owner: ${emailData.senderName} (${emailData.senderEmail})`);
      console.log(`   - Phone: ${emailData.senderPhone}`);
      console.log(`   - Expires: ${emailData.expiresAt.toLocaleDateString()}`);
      
      console.log('\n🎉 Test email sent to pendanek@gmail.com!');
      console.log('   Check the inbox for the email.');
      
    } else {
      const error = await response.json();
      console.log('\n❌ Email sending failed:', error.error || error.message);
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Check if development server is running (npm run dev)');
      console.log('   2. Verify SendGrid API key configuration');
      console.log('   3. Check email provider account status');
      console.log('   4. Review error logs for more details');
    }
  } catch (error) {
    console.log('\n❌ Email sending error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure development server is running: npm run dev');
    console.log('   2. Check if API route is accessible');
    console.log('   3. Verify network connection');
  }
};

// Run the test
sendTestEmail().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
