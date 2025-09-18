#!/usr/bin/env node

/**
 * Real Email Sending Test for BuffrSign
 * 
 * This script will attempt to send real emails to pendanek@gmail.com
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

require('dotenv').config({ path: '.env.local' });

const testEmail = 'pendanek@gmail.com';
const ownerEmail = 'george@buffr.ai';
const ownerName = 'George Nekwaya';
const ownerPhone = '+12065308433';

console.log('🚀 BuffrSign Real Email Sending Test');
console.log('====================================\n');

console.log('📧 Test Configuration:');
console.log(`   - Test Recipient: ${testEmail}`);
console.log(`   - Owner: ${ownerName} (${ownerEmail})`);
console.log(`   - Phone: ${ownerPhone}`);
console.log(`   - From Email: noreply@buffr.ai`);
console.log(`   - App URL: https://sign.buffr.ai\n`);

// Test 1: Check if we can connect to the API
console.log('🔍 Testing API Connection...');

const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/email/status');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful');
      console.log(`   - Provider: ${data.status?.provider || 'Not configured'}`);
      console.log(`   - From Email: ${data.status?.fromEmail || 'Not configured'}`);
      console.log(`   - Queue Enabled: ${data.status?.queueEnabled || false}`);
      return true;
    } else {
      console.log('❌ API connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API connection error:', error.message);
    console.log('   Make sure the development server is running: npm run dev');
    return false;
  }
};

// Test 2: Create test document data
const createTestDocument = () => {
  return {
    id: 'test-doc-' + Date.now(),
    title: 'BuffrSign Test Document - Email Integration',
    description: 'This is a test document to verify email functionality with BuffrSign',
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
};

// Test 3: Send test email via API
const sendTestEmail = async (documentData) => {
  console.log('\n📤 Sending Test Email via API...');
  
  try {
    const emailData = {
      to: testEmail,
      email_type: 'document_invitation',
      documentId: documentData.id,
      recipientName: 'Test Recipient',
      documentTitle: documentData.title,
      senderName: documentData.ownerName,
      senderEmail: documentData.ownerEmail,
      senderPhone: documentData.ownerPhone,
      expiresAt: documentData.expiresAt,
      customMessage: 'This is a test email from BuffrSign to verify email functionality.'
    };

    console.log('   📧 Email Data:');
    console.log(`      To: ${emailData.to}`);
    console.log(`      Type: ${emailData.email_type}`);
    console.log(`      Document: ${emailData.documentTitle}`);
    console.log(`      Sender: ${emailData.senderName} (${emailData.senderEmail})`);
    console.log(`      Phone: ${emailData.senderPhone}`);

    const response = await fetch('http://localhost:3000/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Email sent successfully!');
      console.log(`      Message ID: ${result.messageId || 'N/A'}`);
      console.log(`      Status: ${result.status || 'sent'}`);
      return true;
    } else {
      const error = await response.json();
      console.log('   ❌ Email sending failed:', error.error);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Email sending error:', error.message);
    return false;
  }
};

// Test 4: Test document email integration
const testDocumentEmailIntegration = async (documentData) => {
  console.log('\n🔗 Testing Document Email Integration...');
  
  try {
    const integrationData = {
      action: 'send_invitation',
      recipientId: documentData.recipients[0].id
    };

    console.log('   📧 Integration Data:');
    console.log(`      Action: ${integrationData.action}`);
    console.log(`      Recipient ID: ${integrationData.recipientId}`);

    const response = await fetch(`http://localhost:3000/api/documents/${documentData.id}/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(integrationData)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Document email integration successful!');
      console.log(`      Message: ${result.message}`);
      return true;
    } else {
      const error = await response.json();
      console.log('   ❌ Document email integration failed:', error.error);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Document email integration error:', error.message);
    return false;
  }
};

// Test 5: Generate email preview
const generateEmailPreview = (documentData) => {
  const baseUrl = 'https://sign.buffr.ai';
  
  return {
    subject: `Document Signature Request: ${documentData.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Document Signature Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50;">Document Signature Request</h2>
              <p>Hello Test Recipient,</p>
              <p><strong>${documentData.ownerName}</strong> (${documentData.ownerEmail}) has invited you to sign the document <strong>"${documentData.title}"</strong>.</p>
              
              <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
                  <h3 style="margin-top: 0; color: #2c3e50;">Document Details</h3>
                  <ul style="list-style: none; padding: 0;">
                      <li><strong>Title:</strong> ${documentData.title}</li>
                      <li><strong>Owner:</strong> ${documentData.ownerName}</li>
                      <li><strong>Email:</strong> ${documentData.ownerEmail}</li>
                      <li><strong>Phone:</strong> ${documentData.ownerPhone}</li>
                      <li><strong>Expires:</strong> ${documentData.expiresAt.toLocaleDateString()}</li>
                      <li><strong>Description:</strong> ${documentData.description}</li>
                  </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                  <a href="${baseUrl}/documents/${documentData.id}/sign" 
                     style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                      Sign Document
                  </a>
              </div>
              
              <p style="color: #7f8c8d; font-size: 14px;">
                  This email was sent from BuffrSign (sign.buffr.ai). 
                  If you have any questions, please contact ${documentData.ownerName} at ${documentData.ownerEmail} or ${documentData.ownerPhone}.
              </p>
              
              <hr style="border: none; border-top: 1px solid #ecf0f1; margin: 30px 0;">
              <p style="text-align: center; color: #95a5a6; font-size: 12px;">
                  © 2024 BuffrSign. All rights reserved.<br>
                  Powered by BuffrSign - sign.buffr.ai
              </p>
          </div>
      </body>
      </html>
    `,
    text: `
      Document Signature Request
      
      Hello Test Recipient,
      
      ${documentData.ownerName} (${documentData.ownerEmail}) has invited you to sign the document "${documentData.title}".
      
      Document Details:
      - Title: ${documentData.title}
      - Owner: ${documentData.ownerName}
      - Email: ${documentData.ownerEmail}
      - Phone: ${documentData.ownerPhone}
      - Expires: ${documentData.expiresAt.toLocaleDateString()}
      - Description: ${documentData.description}
      
      Sign Document: ${baseUrl}/documents/${documentData.id}/sign
      
      This email was sent from BuffrSign (sign.buffr.ai). 
      If you have any questions, please contact ${documentData.ownerName} at ${documentData.ownerEmail} or ${documentData.ownerPhone}.
      
      © 2024 BuffrSign. All rights reserved.
      Powered by BuffrSign - sign.buffr.ai
    `
  };
};

// Main test execution
const runTests = async () => {
  console.log('🚀 Starting Real Email Sending Tests...\n');
  
  // Test API connection
  const apiConnected = await testApiConnection();
  if (!apiConnected) {
    console.log('\n❌ Cannot proceed without API connection.');
    console.log('   Please start the development server: npm run dev');
    return;
  }
  
  // Create test document
  const testDocument = createTestDocument();
  console.log('\n📄 Test Document Created:');
  console.log(`   - ID: ${testDocument.id}`);
  console.log(`   - Title: ${testDocument.title}`);
  console.log(`   - Owner: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
  console.log(`   - Phone: ${testDocument.ownerPhone}`);
  console.log(`   - Recipient: ${testDocument.recipients[0].email}`);
  
  // Generate email preview
  const emailPreview = generateEmailPreview(testDocument);
  console.log('\n📧 Email Preview:');
  console.log(`   Subject: ${emailPreview.subject}`);
  console.log(`   HTML Length: ${emailPreview.html.length} characters`);
  console.log(`   Text Length: ${emailPreview.text.length} characters`);
  
  // Send test email
  const emailSent = await sendTestEmail(testDocument);
  
  // Test document integration
  const integrationTested = await testDocumentEmailIntegration(testDocument);
  
  // Summary
  console.log('\n✨ Test Results Summary');
  console.log('========================');
  console.log(`✅ API Connection: ${apiConnected ? 'Success' : 'Failed'}`);
  console.log(`✅ Email Sending: ${emailSent ? 'Success' : 'Failed'}`);
  console.log(`✅ Integration: ${integrationTested ? 'Success' : 'Failed'}`);
  
  if (emailSent) {
    console.log('\n🎉 Email sent successfully to pendanek@gmail.com!');
    console.log('\n📋 What was sent:');
    console.log(`   - Document: ${testDocument.title}`);
    console.log(`   - From: ${testDocument.ownerName} (${testDocument.ownerEmail})`);
    console.log(`   - Phone: ${testDocument.ownerPhone}`);
    console.log(`   - To: ${testEmail}`);
    console.log(`   - Subject: ${emailPreview.subject}`);
  } else {
    console.log('\n⚠️  Email sending failed. Please check:');
    console.log('   1. Email provider API key configuration');
    console.log('   2. Development server is running');
    console.log('   3. Environment variables are set correctly');
  }
  
  console.log('\n📞 Contact Information:');
  console.log(`   Owner: ${ownerName}`);
  console.log(`   Email: ${ownerEmail}`);
  console.log(`   Phone: ${ownerPhone}`);
  console.log(`   Test Email: ${testEmail}`);
  
  console.log('\n🔗 Next Steps:');
  console.log('1. Check pendanek@gmail.com for the test email');
  console.log('2. Verify email content and formatting');
  console.log('3. Test email links and functionality');
  console.log('4. Set up webhooks for real-time status updates');
  console.log('5. Configure production email provider');
};

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
