#!/usr/bin/env node

/**
 * Demo User Creation Script for BuffrSign
 * 
 * This script creates a demo user in Supabase for testing purposes.
 * Run this script after setting up your Supabase project.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoUser() {
  try {
    console.log('🚀 Creating demo user...');
    
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
        is_active: true,
        // Set basic permissions
        can_view_dashboard: true,
        can_manage_documents: true,
        can_manage_compliance: false,
        can_view_analytics: false,
        can_manage_settings: false,
        can_access_admin_panel: false,
        can_manage_users: false,
        can_manage_super_admins: false,
        can_manage_kyc: false,
        can_manage_templates: false
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

// Check if user already exists
async function checkExistingUser() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', 'demo@buffrsign.com')
      .single();

    if (data) {
      console.log('⚠️  Demo user already exists:', data.email);
      console.log('   User ID:', data.id);
      return true;
    }
    
    return false;
  } catch (error) {
    // User doesn't exist, which is what we want
    return false;
  }
}

async function main() {
  console.log('🔍 Checking for existing demo user...');
  
  const userExists = await checkExistingUser();
  
  if (userExists) {
    console.log('');
    console.log('✅ Demo user already exists! You can use:');
    console.log('📧 Email: demo@buffrsign.com');
    console.log('🔑 Password: demo123');
    return;
  }

  console.log('📝 No existing demo user found. Creating new one...');
  await createDemoUser();
}

main().catch(console.error);
