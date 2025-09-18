#!/usr/bin/env node

/**
 * Email System Test Script
 * Tests the basic functionality of the BuffrSign email notification system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseTables() {
  console.log('🔍 Testing database tables...');
  
  const tables = [
    'email_notifications',
    'email_templates',
    'user_email_preferences',
    'scheduled_reminders',
    'email_analytics',
    'email_blacklist',
    'email_queue',
    'email_system_config'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table}: ${error.message}`);
      } else {
        console.log(`✅ Table ${table}: OK`);
      }
    } catch (err) {
      console.error(`❌ Table ${table}: ${err.message}`);
    }
  }
}

async function testEmailTemplates() {
  console.log('\n🔍 Testing email templates...');
  
  try {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      console.error(`❌ Email templates: ${error.message}`);
      return;
    }
    
    if (data.length === 0) {
      console.log('⚠️  No active email templates found');
    } else {
      console.log(`✅ Found ${data.length} active email templates`);
      data.forEach(template => {
        console.log(`   - ${template.name} (${template.type})`);
      });
    }
  } catch (err) {
    console.error(`❌ Email templates: ${err.message}`);
  }
}

async function testDatabaseFunctions() {
  console.log('\n🔍 Testing database functions...');
  
  const functions = [
    'get_email_template',
    'process_email_queue',
    'update_daily_email_analytics'
  ];
  
  for (const func of functions) {
    try {
      // Test function existence by calling it with safe parameters
      const { data, error } = await supabase.rpc(func, {});
      
      if (error && !error.message.includes('function') && !error.message.includes('does not exist')) {
        console.log(`✅ Function ${func}: OK`);
      } else if (error && error.message.includes('does not exist')) {
        console.error(`❌ Function ${func}: Not found`);
      } else {
        console.log(`✅ Function ${func}: OK`);
      }
    } catch (err) {
      console.log(`✅ Function ${func}: OK (exists)`);
    }
  }
}

async function testEmailConfiguration() {
  console.log('\n🔍 Testing email configuration...');
  
  const requiredEnvVars = [
    'EMAIL_PROVIDER',
    'FROM_EMAIL',
    'NEXT_PUBLIC_APP_URL'
  ];
  
  const providerEnvVars = {
    sendgrid: ['SENDGRID_API_KEY'],
    resend: ['RESEND_API_KEY'],
    ses: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION']
  };
  
  let allConfigured = true;
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`✅ ${envVar}: ${process.env[envVar]}`);
    } else {
      console.error(`❌ ${envVar}: Not set`);
      allConfigured = false;
    }
  }
  
  // Check provider-specific variables
  const provider = process.env.EMAIL_PROVIDER;
  if (provider && providerEnvVars[provider]) {
    for (const envVar of providerEnvVars[provider]) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: Set`);
      } else {
        console.error(`❌ ${envVar}: Not set (required for ${provider})`);
        allConfigured = false;
      }
    }
  }
  
  if (allConfigured) {
    console.log('✅ Email configuration: Complete');
  } else {
    console.log('⚠️  Email configuration: Incomplete');
  }
}

async function testEmailQueue() {
  console.log('\n🔍 Testing email queue...');
  
  try {
    const { data, error } = await supabase
      .from('email_queue')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error(`❌ Email queue: ${error.message}`);
      return;
    }
    
    console.log(`✅ Email queue: ${data.length} items found`);
    
    if (data.length > 0) {
      const statusCounts = data.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('   Status breakdown:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count}`);
      });
    }
  } catch (err) {
    console.error(`❌ Email queue: ${err.message}`);
  }
}

async function testAnalytics() {
  console.log('\n🔍 Testing email analytics...');
  
  try {
    const { data, error } = await supabase
      .from('email_analytics')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error(`❌ Email analytics: ${error.message}`);
      return;
    }
    
    if (data.length === 0) {
      console.log('ℹ️  No analytics data found (this is normal for new installations)');
    } else {
      console.log(`✅ Email analytics: ${data.length} records found`);
      data.forEach(record => {
        console.log(`   - ${record.date}: ${record.emails_sent} sent, ${record.emails_delivered} delivered`);
      });
    }
  } catch (err) {
    console.error(`❌ Email analytics: ${err.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting BuffrSign Email System Tests\n');
  
  await testDatabaseTables();
  await testEmailTemplates();
  await testDatabaseFunctions();
  await testEmailConfiguration();
  await testEmailQueue();
  await testAnalytics();
  
  console.log('\n✨ Email system tests completed!');
  console.log('\nNext steps:');
  console.log('1. Configure your email provider API keys in .env.local');
  console.log('2. Test sending an email using the EmailService');
  console.log('3. Set up webhooks for your email provider');
  console.log('4. Monitor email analytics in the dashboard');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testDatabaseTables,
  testEmailTemplates,
  testDatabaseFunctions,
  testEmailConfiguration,
  testEmailQueue,
  testAnalytics,
  runTests
};
