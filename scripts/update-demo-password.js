/**
 * Update Demo Account Password Script for BuffrSign
 * 
 * This script updates the demo account password to meet the new requirements:
 * Email: demo@buffrsign.com
 * Password: Demo123!
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateDemoPassword() {
  try {
    console.log('🔐 Updating Demo Account Password...');
    console.log('===================================');
    
    // Sign in with the current password to get a session
    console.log('📧 Signing in with current credentials...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'demo@buffrsign.com',
      password: 'demo123' // Try the old password first
    });

    if (signInError) {
      console.log('⚠️  Could not sign in with old password. Trying to create new account...');
      
      // Try to sign up with the new password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'demo@buffrsign.com',
        password: 'Demo123!',
        options: {
          data: {
            first_name: 'Demo',
            last_name: 'User'
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log('✅ Demo account already exists with new password');
          console.log('\n🎉 Demo account is ready!');
          console.log('========================');
          console.log('Email: demo@buffrsign.com');
          console.log('Password: Demo123!');
          console.log('\nYou can now use these credentials to sign in.');
          return;
        } else {
          throw new Error(`Failed to create account: ${signUpError.message}`);
        }
      }

      console.log('✅ Demo account created successfully');
    } else {
      console.log('✅ Signed in successfully');
      
      // Update the password
      console.log('🔐 Updating password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: 'Demo123!'
      });

      if (updateError) {
        throw new Error(`Failed to update password: ${updateError.message}`);
      }

      console.log('✅ Password updated successfully');
    }

    console.log('\n🎉 Demo account is ready!');
    console.log('========================');
    console.log('Email: demo@buffrsign.com');
    console.log('Password: Demo123!');
    console.log('\nYou can now use these credentials to sign in.');

  } catch (error) {
    console.error('❌ Error updating demo account:', error.message);
    console.log('\n💡 Manual Solution:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to Authentication > Users');
    console.log('3. Find demo@buffrsign.com');
    console.log('4. Click "Reset Password"');
    console.log('5. Set the new password to: Demo123!');
    process.exit(1);
  }
}

// Run the script
updateDemoPassword();
