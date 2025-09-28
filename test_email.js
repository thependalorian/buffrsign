#!/usr/bin/env node
/**
 * BuffrSign Email Test Script
 * 
 * Tests the email service for BuffrSign project
 * Sends a test email to pendanek@gmail.com
 */

const sgMail = require('@sendgrid/mail');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith('#')) {
                const [key, ...valueParts] = trimmedLine.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=');
                    process.env[key] = value;
                }
            }
        }
    } catch (error) {
        console.log('Could not load .env.local file:', error.message);
    }
}

loadEnvFile();

async function testBuffrSignEmail() {
    console.log('🚀 Starting BuffrSign Email Test...');
    console.log('=' * 50);
    
    try {
        // Check if SendGrid API key is configured
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey || apiKey === 'your_sendgrid_api_key') {
            console.log('❌ SendGrid API key not configured');
            console.log('📝 Please set SENDGRID_API_KEY in your .env.local file');
            return false;
        }
        
        // Initialize SendGrid
        sgMail.setApiKey(apiKey);
        
        // Test email details
        const toEmail = 'pendanek@gmail.com';
        const subject = `Test Email from BuffrSign - ${new Date().toISOString()}`;
        
        // HTML content
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Test Email from BuffrSign</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📝 BuffrSign</h1>
                    <p>Digital Signature Platform</p>
                </div>
                <div class="content">
                    <h2>Hello from BuffrSign!</h2>
                    <p>This is a test email sent from the BuffrSign email service to verify that SendGrid integration is working correctly.</p>
                    
                    <p><strong>Test Details:</strong></p>
                    <ul>
                        <li>Sent at: ${new Date().toISOString()}</li>
                        <li>From: BuffrSign Email Service</li>
                        <li>To: ${toEmail}</li>
                        <li>Service: SendGrid API</li>
                        <li>Project: BuffrSign Digital Signature Platform</li>
                    </ul>
                    
                    <p>If you're receiving this email, it means our email service is working perfectly! 🎉</p>
                    
                    <a href="https://sign.buffr.ai" class="button">Visit BuffrSign</a>
                    
                    <p>Best regards,<br>
                    <strong>George Nekwaya</strong><br>
                    Founder, BuffrSign<br>
                    📧 george@buffr.ai<br>
                    📱 +1 (206) 530-8433</p>
                </div>
                <div class="footer">
                    <p>This email was sent from BuffrSign Digital Signature Platform</p>
                    <p>© 2024 BuffrSign. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `;
        
        // Plain text content
        const textContent = `
        Hello from BuffrSign!
        
        This is a test email sent from the BuffrSign email service to verify that SendGrid integration is working correctly.
        
        Test Details:
        - Sent at: ${new Date().toISOString()}
        - From: BuffrSign Email Service
        - To: ${toEmail}
        - Service: SendGrid API
        - Project: BuffrSign Digital Signature Platform
        
        If you're receiving this email, it means our email service is working perfectly!
        
        Visit us at: https://sign.buffr.ai
        
        Best regards,
        George Nekwaya
        Founder, BuffrSign
        Email: george@buffr.ai
        Phone: +1 (206) 530-8433
        
        This email was sent from BuffrSign Digital Signature Platform
        © 2024 BuffrSign. All rights reserved.
        `;
        
        // Email message
        const msg = {
            to: toEmail,
            from: {
                email: 'noreply@mail.buffr.ai',
                name: process.env.FROM_NAME || 'BuffrSign',
            },
            replyTo: 'support@sign.buffr.ai',
            subject: subject,
            text: textContent,
            html: htmlContent,
            trackingSettings: {
                clickTracking: {
                    enable: true,
                    enableText: true,
                },
                openTracking: {
                    enable: true,
                },
            },
            customArgs: {
                project: 'buffrsign',
                email_type: 'test_email',
                timestamp: new Date().toISOString(),
            },
        };
        
        console.log(`📧 Sending test email to ${toEmail}...`);
        console.log(`📝 Subject: ${subject}`);
        
        // Send the email
        const response = await sgMail.send(msg);
        const messageId = response[0].headers['x-message-id'];
        
        console.log('✅ Email sent successfully!');
        console.log(`📊 Message ID: ${messageId}`);
        console.log(`🎉 Email delivered via SendGrid!`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        if (error.response) {
            console.error('📊 Error details:', error.response.body);
        }
        return false;
    }
}

// Run the test
testBuffrSignEmail()
    .then(success => {
        console.log('=' * 50);
        if (success) {
            console.log('✅ BuffrSign email test completed successfully!');
            console.log('📧 Check pendanek@gmail.com inbox for the test email');
        } else {
            console.log('❌ BuffrSign email test failed!');
        }
    })
    .catch(error => {
        console.error('❌ Unexpected error:', error);
    });
