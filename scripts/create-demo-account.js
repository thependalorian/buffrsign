/**
 * Demo Account Creation Script for BuffrSign
 * 
 * This script creates a demo account with the following credentials:
 * Email: demo@buffrsign.com
 * Password: demo123456
 * 
 * The script will:
 * 1. Create the user in Supabase Auth
 * 2. Create a profile record in the profiles table
 * 3. Set up appropriate permissions and role
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  console.error('\nPlease ensure your .env.local file contains these variables.');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo account details
const demoAccount = {
  email: 'demo@sign.buffr.ai',
  password: 'Demo123!',
  profile: {
    first_name: 'Demo',
    last_name: 'User',
    phone: '+264811234567',
    company_name: 'BuffrSign Demo Company',
    role: 'user',
    is_verified: true,
    is_active: true,
    email_notifications: true,
    sms_notifications: false,
    two_factor_enabled: false,
    language: 'en',
    timezone: 'Africa/Windhoek',
    theme: 'system'
  }
};

async function createDemoAccount() {
  try {
    console.log('🚀 Creating BuffrSign Demo Account...');
    console.log('=====================================');
    
    // Step 1: Create user in Supabase Auth
    console.log('📧 Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoAccount.email,
      password: demoAccount.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: demoAccount.profile.first_name,
        last_name: demoAccount.profile.last_name,
        company_name: demoAccount.profile.company_name,
        phone: demoAccount.profile.phone
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Demo account already exists. Updating profile...');
        
        // Get existing user
        const { data: existingUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(demoAccount.email);
        if (getUserError) {
          throw new Error(`Failed to get existing user: ${getUserError.message}`);
        }
        
        // Update the user's password
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.user.id, {
          password: demoAccount.password
        });
        
        if (updateError) {
          throw new Error(`Failed to update password: ${updateError.message}`);
        }
        
        console.log('✅ Password updated successfully');
        
        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update(demoAccount.profile)
          .eq('id', existingUser.user.id);
          
        if (profileError) {
          throw new Error(`Failed to update profile: ${profileError.message}`);
        }
        
        console.log('✅ Profile updated successfully');
        console.log('\n🎉 Demo account is ready!');
        console.log('========================');
        console.log(`Email: ${demoAccount.email}`);
        console.log(`Password: ${demoAccount.password}`);
        console.log('\nYou can now use these credentials to sign in.');
        
        return;
      } else {
        throw new Error(`Failed to create user: ${authError.message}`);
      }
    }

    console.log('✅ User created successfully');

    // Step 2: Create profile record
    console.log('👤 Creating profile record...');
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: demoAccount.email,
        ...demoAccount.profile
      });

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('✅ Profile created successfully');

    // Step 3: Verify the account
    console.log('🔍 Verifying account setup...');
    const { data: profileData, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', demoAccount.email)
      .single();

    if (verifyError) {
      throw new Error(`Failed to verify profile: ${verifyError.message}`);
    }

    console.log('✅ Account verification successful');

    console.log('\n🎉 Demo account created successfully!');
    console.log('=====================================');
    console.log(`Email: ${demoAccount.email}`);
    console.log(`Password: ${demoAccount.password}`);
    console.log(`Name: ${demoAccount.profile.first_name} ${demoAccount.profile.last_name}`);
    console.log(`Role: ${demoAccount.profile.role}`);
    console.log(`Verified: ${demoAccount.profile.is_verified}`);
    console.log('\nYou can now use these credentials to sign in.');

  } catch (error) {
    console.error('❌ Error creating demo account:', error.message);
    process.exit(1);
  }
}

// Run the script
createDemoAccount();
