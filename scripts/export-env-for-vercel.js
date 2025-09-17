#!/usr/bin/env node

/**
 * Export Environment Variables for Vercel Deployment
 * This script exports environment variables from .env to Vercel format
 */

const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
const lines = envContent.split('\n');

lines.forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=');
      envVars[key.trim()] = value.trim();
    }
  }
});

// Filter for Vercel-compatible environment variables
const vercelEnvVars = {};

// Essential Supabase variables
if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
  vercelEnvVars.NEXT_PUBLIC_SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
}
if (envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  vercelEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}
if (envVars.SUPABASE_SERVICE_ROLE_KEY) {
  vercelEnvVars.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;
}

// Database URLs
if (envVars.DATABASE_URL) {
  vercelEnvVars.DATABASE_URL = envVars.DATABASE_URL;
}
if (envVars.SUPABASE_DATABASE_URL) {
  vercelEnvVars.SUPABASE_DATABASE_URL = envVars.SUPABASE_DATABASE_URL;
}

// AI Services
if (envVars.OPENAI_API_KEY) {
  vercelEnvVars.OPENAI_API_KEY = envVars.OPENAI_API_KEY;
}
if (envVars.LLM_API_KEY) {
  vercelEnvVars.LLM_API_KEY = envVars.LLM_API_KEY;
}
if (envVars.LLM_CHOICE) {
  vercelEnvVars.LLM_CHOICE = envVars.LLM_CHOICE;
}
if (envVars.EMBEDDING_API_KEY) {
  vercelEnvVars.EMBEDDING_API_KEY = envVars.EMBEDDING_API_KEY;
}
if (envVars.EMBEDDING_MODEL) {
  vercelEnvVars.EMBEDDING_MODEL = envVars.EMBEDDING_MODEL;
}

// Feature flags
if (envVars.ENABLE_AI_FEATURES) {
  vercelEnvVars.ENABLE_AI_FEATURES = envVars.ENABLE_AI_FEATURES;
}
if (envVars.ENABLE_SMART_TEMPLATES) {
  vercelEnvVars.ENABLE_SMART_TEMPLATES = envVars.ENABLE_SMART_TEMPLATES;
}
if (envVars.ENABLE_COMPLIANCE_AI) {
  vercelEnvVars.ENABLE_COMPLIANCE_AI = envVars.ENABLE_COMPLIANCE_AI;
}
if (envVars.ENABLE_DOCUMENT_INTELLIGENCE) {
  vercelEnvVars.ENABLE_DOCUMENT_INTELLIGENCE = envVars.ENABLE_DOCUMENT_INTELLIGENCE;
}

// Security
if (envVars.JWT_SECRET) {
  vercelEnvVars.JWT_SECRET = envVars.JWT_SECRET;
}
if (envVars.ENCRYPTION_KEY) {
  vercelEnvVars.ENCRYPTION_KEY = envVars.ENCRYPTION_KEY;
}
if (envVars.HASH_SALT_ROUNDS) {
  vercelEnvVars.HASH_SALT_ROUNDS = envVars.HASH_SALT_ROUNDS;
}

// API Configuration
if (envVars.NEXT_PUBLIC_API_URL) {
  vercelEnvVars.NEXT_PUBLIC_API_URL = envVars.NEXT_PUBLIC_API_URL;
}
if (envVars.NEXT_PUBLIC_API_KEY) {
  vercelEnvVars.NEXT_PUBLIC_API_KEY = envVars.NEXT_PUBLIC_API_KEY;
}

// Redis Configuration
if (envVars.REDIS_URL) {
  vercelEnvVars.REDIS_URL = envVars.REDIS_URL;
}
if (envVars.REDIS_HOST) {
  vercelEnvVars.REDIS_HOST = envVars.REDIS_HOST;
}
if (envVars.REDIS_PORT) {
  vercelEnvVars.REDIS_PORT = envVars.REDIS_PORT;
}
if (envVars.REDIS_PASSWORD) {
  vercelEnvVars.REDIS_PASSWORD = envVars.REDIS_PASSWORD;
}

// Monitoring
if (envVars.LANGFUSE_PUBLIC_KEY) {
  vercelEnvVars.LANGFUSE_PUBLIC_KEY = envVars.LANGFUSE_PUBLIC_KEY;
}
if (envVars.LANGFUSE_SECRET_KEY) {
  vercelEnvVars.LANGFUSE_SECRET_KEY = envVars.LANGFUSE_SECRET_KEY;
}
if (envVars.LANGFUSE_HOST) {
  vercelEnvVars.LANGFUSE_HOST = envVars.LANGFUSE_HOST;
}

// File Upload
if (envVars.MAX_FILE_SIZE) {
  vercelEnvVars.MAX_FILE_SIZE = envVars.MAX_FILE_SIZE;
}

// CORS
if (envVars.CORS_ORIGINS) {
  vercelEnvVars.CORS_ORIGINS = envVars.CORS_ORIGINS;
}

// Generate Vercel CLI commands
console.log('\n🚀 Vercel Environment Variables Export\n');
console.log('Copy and run these commands to set environment variables in Vercel:\n');

Object.entries(vercelEnvVars).forEach(([key, value]) => {
  // Escape quotes in values
  const escapedValue = value.replace(/"/g, '\\"');
  console.log(`vercel env add ${key} "${escapedValue}"`);
});

console.log('\n📋 Or use the Vercel dashboard to add these environment variables:');
console.log('https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables\n');

console.log('Environment variables to add:');
Object.keys(vercelEnvVars).forEach(key => {
  console.log(`  - ${key}`);
});

console.log(`\n✅ Total: ${Object.keys(vercelEnvVars).length} environment variables ready for deployment`);