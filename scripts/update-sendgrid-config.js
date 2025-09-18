#!/usr/bin/env node

/**
 * Update SendGrid Configuration
 * 
 * This script helps update .env.local with SendGrid API key
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 SendGrid Configuration Update');
console.log('================================\n');

console.log('📧 Your SendGrid Setup:');
console.log('   - Domain: buffr.ai');
console.log('   - From Email: noreply@buffr.ai');
console.log('   - Test Recipient: pendanek@gmail.com');
console.log('   - Owner: George Nekwaya (george@buffr.ai +12065308433)\n');

const updateConfig = async () => {
  try {
    // Get API key from user
    const apiKey = await question('Enter your SendGrid API key (starts with SG.): ');
    
    if (!apiKey.startsWith('SG.')) {
      console.log('❌ Invalid API key format. Should start with "SG."');
      process.exit(1);
    }
    
    const envPath = path.join(__dirname, '..', '.env.local');
    
    // Read existing .env.local
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update SendGrid API key
    envContent = envContent.replace(
      /SENDGRID_API_KEY=.*/,
      `SENDGRID_API_KEY=${apiKey}`
    );
    
    // Ensure EMAIL_PROVIDER is set to sendgrid
    if (!envContent.includes('EMAIL_PROVIDER=sendgrid')) {
      envContent = envContent.replace(
        /EMAIL_PROVIDER=.*/,
        'EMAIL_PROVIDER=sendgrid'
      );
    }
    
    // Write updated content
    fs.writeFileSync(envPath, envContent);
    
    console.log('\n✅ Configuration updated successfully!');
    console.log('\n📧 Current Email Configuration:');
    console.log(`   EMAIL_PROVIDER=sendgrid`);
    console.log(`   SENDGRID_API_KEY=${apiKey.substring(0, 10)}...`);
    console.log(`   FROM_EMAIL=noreply@buffr.ai`);
    console.log(`   NEXT_PUBLIC_APP_URL=https://sign.buffr.ai`);
    
    console.log('\n🧪 Test Email Sending:');
    console.log('   npm run send-test-email');
    
    console.log('\n📊 Expected Results:');
    console.log('   ✅ Email sent to pendanek@gmail.com');
    console.log('   ✅ Professional HTML email with BuffrSign branding');
    console.log('   ✅ George Nekwaya contact info included');
    console.log('   ✅ Links point to sign.buffr.ai');
    
  } catch (error) {
    console.error('❌ Error updating configuration:', error.message);
  } finally {
    rl.close();
  }
};

updateConfig();
