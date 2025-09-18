#!/usr/bin/env node

/**
 * DNS Records Verification Script
 * 
 * This script helps verify SendGrid DNS records for mail.buffr.ai
 * Owner: George Nekwaya (george@buffr.ai +12065308433)
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.log('🔍 SendGrid DNS Records Verification');
console.log('====================================\n');

console.log('📧 Domain: mail.buffr.ai');
console.log('📧 From Email: noreply@mail.buffr.ai');
console.log('📧 Test Recipient: pendanek@gmail.com\n');

const records = [
  {
    name: 'url2418.mail.buffr.ai',
    type: 'CNAME',
    expected: 'sendgrid.net',
    description: 'Link Branding'
  },
  {
    name: '55676684.mail.buffr.ai',
    type: 'CNAME',
    expected: 'sendgrid.net',
    description: 'Link Branding'
  },
  {
    name: 'em896.mail.buffr.ai',
    type: 'CNAME',
    expected: 'u55676684.wl185.sendgrid.net',
    description: 'Link Branding'
  },
  {
    name: 's1._domainkey.mail.buffr.ai',
    type: 'CNAME',
    expected: 's1.domainkey.u55676684.wl185.sendgrid.net',
    description: 'Domain Authentication'
  },
  {
    name: 's2._domainkey.mail.buffr.ai',
    type: 'CNAME',
    expected: 's2.domainkey.u55676684.wl185.sendgrid.net',
    description: 'Domain Authentication'
  },
  {
    name: '_dmarc.mail.buffr.ai',
    type: 'TXT',
    expected: 'v=DMARC1; p=none;',
    description: 'DMARC'
  }
];

const checkRecord = async (record) => {
  try {
    const { stdout, stderr } = await execAsync(`nslookup -type=${record.type} ${record.name}`);
    
    if (stdout.includes(record.expected)) {
      console.log(`✅ ${record.name} (${record.description})`);
      console.log(`   Found: ${record.expected}`);
      return true;
    } else if (stdout.includes('NXDOMAIN')) {
      console.log(`❌ ${record.name} (${record.description})`);
      console.log(`   Status: NXDOMAIN (Not found)`);
      return false;
    } else {
      console.log(`⚠️  ${record.name} (${record.description})`);
      console.log(`   Status: Unexpected response`);
      console.log(`   Output: ${stdout.substring(0, 100)}...`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${record.name} (${record.description})`);
    console.log(`   Error: ${error.message}`);
    return false;
  }
};

const verifyAllRecords = async () => {
  console.log('🔍 Checking DNS Records...\n');
  
  let successCount = 0;
  
  for (const record of records) {
    const success = await checkRecord(record);
    if (success) successCount++;
    console.log('');
  }
  
  console.log('📊 Verification Summary');
  console.log('======================');
  console.log(`✅ Working: ${successCount}/${records.length} records`);
  console.log(`❌ Failed: ${records.length - successCount}/${records.length} records`);
  
  if (successCount === records.length) {
    console.log('\n🎉 All DNS records are working!');
    console.log('   You can now verify in SendGrid.');
  } else {
    console.log('\n⚠️  Some DNS records are not working yet.');
    console.log('\n🔧 Troubleshooting Steps:');
    console.log('1. Wait 15-30 minutes for DNS propagation');
    console.log('2. Check Namecheap DNS settings for duplicate domain entries');
    console.log('3. Ensure underscores are supported in record names');
    console.log('4. Consider using Cloudflare DNS if issues persist');
    
    console.log('\n📋 Namecheap DNS Check:');
    console.log('   - Go to: Domains → buffr.ai → Advanced DNS');
    console.log('   - Verify Host field does NOT include .buffr.ai');
    console.log('   - Example: Host should be "s1._domainkey.mail" not "s1._domainkey.mail.buffr.ai"');
  }
  
  console.log('\n📞 Support Information:');
  console.log('   Owner: George Nekwaya');
  console.log('   Email: george@buffr.ai');
  console.log('   Phone: +12065308433');
  console.log('   Test Email: pendanek@gmail.com');
};

verifyAllRecords().catch(error => {
  console.error('❌ Verification error:', error);
});
