#!/usr/bin/env node

/**
 * Comprehensive Test Runner for BuffrSign Platform
 * Runs all tests and generates detailed reports
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 BuffrSign Platform - Comprehensive Test Suite')
console.log('=' .repeat(60))

// Check environment setup
console.log('\n📋 Environment Check:')
try {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    console.log('✅ .env file found')
    
    const envContent = fs.readFileSync(envPath, 'utf8')
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
      'OPENAI_API_KEY'
    ]
    
    requiredVars.forEach(varName => {
      if (envContent.includes(`${varName}=`)) {
        console.log(`✅ ${varName} configured`)
      } else {
        console.log(`⚠️  ${varName} missing`)
      }
    })
  } else {
    console.log('❌ .env file not found')
  }
} catch (error) {
  console.log('❌ Error checking environment:', error.message)
}

// Run tests
console.log('\n🚀 Running Test Suite:')
console.log('-'.repeat(40))

try {
  // Run all tests with coverage
  console.log('Running Jest tests with coverage...')
  execSync('npx jest --coverage --verbose --detectOpenHandles', { 
    stdio: 'inherit',
    cwd: process.cwd()
  })
  
  console.log('\n✅ All tests completed successfully!')
  
} catch (error) {
  console.log('\n❌ Tests failed with exit code:', error.status)
  process.exit(error.status || 1)
}

console.log('\n📊 Test Summary:')
console.log('-'.repeat(40))
console.log('Check the coverage report in the coverage/ directory')
console.log('Open coverage/lcov-report/index.html in your browser for detailed coverage')

console.log('\n🎉 Test run complete!')