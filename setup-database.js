#!/usr/bin/env node

/**
 * Database Setup Script for BuffrSign
 * 
 * This script helps you set up the database schema and demo user.
 * Run this after configuring your Supabase project.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('');
  console.log('📝 Please create a .env.local file with the following content:');
  console.log('');
  console.log('# Supabase Configuration (Required)');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here');
  console.log('');
  console.log('# JWT Configuration (Required for Authentication)');
  console.log('JWT_ACCESS_SECRET=your_jwt_access_secret_key_here_make_it_long_and_secure_at_least_32_characters');
  console.log('JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_secure_at_least_32_characters');
  console.log('JWT_DOCUMENT_SECRET=your_jwt_document_secret_key_here_make_it_long_and_secure_at_least_32_characters');
  console.log('JWT_SIGNATURE_SECRET=your_jwt_signature_secret_key_here_make_it_long_and_secure_at_least_32_characters');
  console.log('JWT_ACCESS_EXPIRY=15m');
  console.log('JWT_REFRESH_EXPIRY=7d');
  console.log('JWT_DOCUMENT_EXPIRY=1h');
  console.log('JWT_SIGNATURE_EXPIRY=30m');
  console.log('');
  console.log('# OpenAI Configuration (Required for AI Services)');
  console.log('OPENAI_API_KEY=your_openai_api_key_here');
  console.log('');
  console.log('# Application Configuration');
  console.log('NODE_ENV=development');
  console.log('DEBUG=true');
  console.log('LOG_LEVEL=debug');
  console.log('');
  console.log('🔗 Get your Supabase credentials from: https://supabase.com/dashboard/project/inqoltqqfneqfltcqlmx/settings/api');
  console.log('');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Database schema not found. You need to run the SQL migrations first.');
      console.log('');
      console.log('📋 Please run the following SQL scripts in your Supabase SQL editor:');
      console.log('');
      console.log('1. First, run: lib/supabase/schema.sql');
      console.log('2. Then, run: lib/supabase/jwt-migration.sql');
      console.log('3. Finally, run: supabase/migrations/20241201000000_admin_email_controls.sql');
      console.log('');
      console.log('🔗 Access your Supabase SQL editor at: https://supabase.com/dashboard/project/inqoltqqfneqfltcqlmx/sql');
      return false;
    }
    
    console.log('✅ Database schema is properly set up!');
    return true;
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
    return false;
  }
}

async function createDemoUser() {
  try {
    console.log('🚀 Creating demo user...');
    
    // Check if demo user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'demo@buffrsign.com')
      .single();
    
    if (existingUser) {
      console.log('✅ Demo user already exists!');
      console.log('📧 Email: demo@buffrsign.com');
      console.log('🔑 Password: demo123');
      return;
    }
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@buffrsign.com',
      password: 'demo123',
      email_confirm: true, // Skip email confirmation for demo
      user_metadata: {
        first_name: 'Demo',
        last_name: 'User',
        company_name: 'BuffrSign Demo',
        phone: '+264 81 123 4567'
      }
    });

    if (authError) {
      console.error('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create the profile in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'demo@buffrsign.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'user',
        company_name: 'BuffrSign Demo',
        phone: '+264 81 123 4567',
        is_verified: true,
        is_active: true
      })
      .select();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message);
      return;
    }

    console.log('✅ Profile created:', profileData[0]);
    console.log('');
    console.log('🎉 Demo user created successfully!');
    console.log('');
    console.log('📧 Email: demo@buffrsign.com');
    console.log('🔑 Password: demo123');
    console.log('');
    console.log('You can now use these credentials to log in to the application.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function main() {
  console.log('🔧 BuffrSign Database Setup');
  console.log('============================');
  console.log('');
  
  const schemaExists = await checkDatabaseSchema();
  
  if (!schemaExists) {
    console.log('❌ Please set up the database schema first, then run this script again.');
    return;
  }
  
  await createDemoUser();
}

main().catch(console.error);
