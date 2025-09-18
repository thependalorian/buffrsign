#!/usr/bin/env node

/**
 * Update Email Configuration for mail.buffr.ai
 * 
 * This script updates the email configuration to use mail.buffr.ai subdomain
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Updating Email Configuration for mail.buffr.ai');
console.log('================================================\n');

console.log('📧 New Email Configuration:');
console.log('   - Domain: mail.buffr.ai');
console.log('   - From Email: noreply@mail.buffr.ai');
console.log('   - Test Recipient: pendanek@gmail.com');
console.log('   - Owner: George Nekwaya (george@buffr.ai +12065308433)');
console.log('   - Works with: lend.buffr.ai, host.buffr.ai, sign.buffr.ai\n');

const updateConfig = () => {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    
    // Read existing .env.local
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update FROM_EMAIL to use mail.buffr.ai
    envContent = envContent.replace(
      /FROM_EMAIL=.*/,
      'FROM_EMAIL=noreply@mail.buffr.ai'
    );
    
    // Write updated content
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ Configuration updated successfully!');
    console.log('\n📧 Updated Email Configuration:');
    console.log('   EMAIL_PROVIDER=sendgrid');
    console.log('   FROM_EMAIL=noreply@mail.buffr.ai');
    console.log('   NEXT_PUBLIC_APP_URL=https://sign.buffr.ai');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Update SendGrid domain authentication to use "mail.buffr.ai"');
    console.log('2. Add new DNS records for mail.buffr.ai to Namecheap');
    console.log('3. Get your SendGrid API key');
    console.log('4. Test email sending: npm run send-test-email');
    
    console.log('\n📊 Benefits of mail.buffr.ai:');
    console.log('   ✅ No CNAME conflicts with main domain');
    console.log('   ✅ Works across all BuffrSign projects');
    console.log('   ✅ Professional email setup');
    console.log('   ✅ Scalable for future projects');
    
    console.log('\n🎯 Project Integration:');
    console.log('   - lend.buffr.ai → noreply@mail.buffr.ai');
    console.log('   - host.buffr.ai → noreply@mail.buffr.ai');
    console.log('   - sign.buffr.ai → noreply@mail.buffr.ai');
    
  } catch (error) {
    console.error('❌ Error updating configuration:', error.message);
  }
};

updateConfig();
