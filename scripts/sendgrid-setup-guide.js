#!/usr/bin/env node

/**
 * SendGrid Setup Guide for BuffrSign
 * 
 * This script helps configure SendGrid for buffr.ai domain
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

console.log('🚀 SendGrid Setup Guide for BuffrSign');
console.log('=====================================\n');

console.log('📧 Your Domain Setup:');
console.log('   - Main Domain: buffr.ai');
console.log('   - Subdomains: lend.buffr.ai, host.buffr.ai, sign.buffr.ai');
console.log('   - From Email: noreply@buffr.ai');
console.log('   - Test Recipient: pendanek@gmail.com');
console.log('   - Owner: George Nekwaya (george@buffr.ai +12065308433)\n');

console.log('🔧 SendGrid Configuration Steps:');
console.log('================================\n');

console.log('1. 📋 In SendGrid Sender Authentication:');
console.log('   - DNS Host: Namecheap');
console.log('   - Domain: buffr.ai');
console.log('   - Brand Links: Yes');
console.log('   - Click "Next"\n');

console.log('2. 📝 Add DNS Records to Namecheap:');
console.log('   Go to: Namecheap → Domains → buffr.ai → Advanced DNS');
console.log('   Add these records (SendGrid will provide exact values):\n');

console.log('   CNAME Record 1:');
console.log('   - Type: CNAME');
console.log('   - Host: s1._domainkey');
console.log('   - Value: s1.domainkey.u[YOUR_ID].wl[YOUR_ID].sendgrid.net');
console.log('   - TTL: Automatic\n');

console.log('   CNAME Record 2:');
console.log('   - Type: CNAME');
console.log('   - Host: s2._domainkey');
console.log('   - Value: s2.domainkey.u[YOUR_ID].wl[YOUR_ID].sendgrid.net');
console.log('   - TTL: Automatic\n');

console.log('   CNAME Record 3 (Link Branding):');
console.log('   - Type: CNAME');
console.log('   - Host: em[YOUR_ID]');
console.log('   - Value: sendgrid.net');
console.log('   - TTL: Automatic\n');

console.log('3. 🔑 Get Your API Key:');
console.log('   - Go to: SendGrid → Settings → API Keys');
console.log('   - Click "Create API Key"');
console.log('   - Name: "BuffrSign Email System"');
console.log('   - Permissions: "Full Access" (for testing)');
console.log('   - Copy the API key (you won\'t see it again!)\n');

console.log('4. ⚙️ Update .env.local:');
console.log('   Replace "your_sendgrid_api_key_here" with your actual API key:');
console.log('   EMAIL_PROVIDER=sendgrid');
console.log('   SENDGRID_API_KEY=SG.your_actual_api_key_here');
console.log('   FROM_EMAIL=noreply@buffr.ai');
console.log('   NEXT_PUBLIC_APP_URL=https://sign.buffr.ai\n');

console.log('5. 🧪 Test Email Sending:');
console.log('   npm run send-test-email\n');

console.log('📊 Expected Results:');
console.log('===================');
console.log('✅ SendGrid domain authentication: Verified');
console.log('✅ Email sent to pendanek@gmail.com');
console.log('✅ Professional HTML email with BuffrSign branding');
console.log('✅ George Nekwaya contact info included');
console.log('✅ Links point to sign.buffr.ai\n');

console.log('🔗 Important URLs:');
console.log('==================');
console.log('SendGrid Dashboard: https://app.sendgrid.com');
console.log('Namecheap DNS: https://ap.www.namecheap.com/domains/domaincontrolpanel/buffr.ai/advancedns');
console.log('BuffrSign App: https://sign.buffr.ai\n');

console.log('📞 Support Information:');
console.log('=======================');
console.log('Owner: George Nekwaya');
console.log('Email: george@buffr.ai');
console.log('Phone: +12065308433');
console.log('Test Email: pendanek@gmail.com\n');

console.log('✨ Once configured, your BuffrSign email system will be fully operational!');
