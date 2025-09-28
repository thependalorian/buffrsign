#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key length:', supabaseAnonKey?.length);
console.log('Service Key length:', supabaseServiceKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Test with anon key first
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testAnonConnection() {
  try {
    console.log('\n🔑 Testing anon key connection...');
    const { data, error } = await supabaseAnon.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Anon key error:', error.message);
      return false;
    }
    
    console.log('✅ Anon key connection successful');
    return true;
  } catch (error) {
    console.error('❌ Anon key connection failed:', error.message);
    return false;
  }
}

// Test with service key
async function testServiceConnection() {
  if (!supabaseServiceKey) {
    console.log('⚠️  No service key provided, skipping service key test');
    return false;
  }

  try {
    console.log('\n🔑 Testing service key connection...');
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabaseService.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Service key error:', error.message);
      return false;
    }
    
    console.log('✅ Service key connection successful');
    return true;
  } catch (error) {
    console.error('❌ Service key connection failed:', error.message);
    return false;
  }
}

async function main() {
  const anonWorks = await testAnonConnection();
  const serviceWorks = await testServiceConnection();
  
  console.log('\n📊 Test Results:');
  console.log('Anon Key:', anonWorks ? '✅ Working' : '❌ Failed');
  console.log('Service Key:', serviceWorks ? '✅ Working' : '❌ Failed');
  
  if (!anonWorks) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if the Supabase project exists and is active');
    console.log('2. Verify the URL and API keys are correct');
    console.log('3. Check if the profiles table exists in your database');
    console.log('4. Ensure RLS policies allow anon access if needed');
  }
}

main().catch(console.error);
