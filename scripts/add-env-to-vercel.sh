#!/bin/bash

# Add Environment Variables to Vercel Project
# This script adds all environment variables from .env to the Vercel project

echo "🚀 Adding environment variables to Vercel project..."

# Essential Supabase variables
vercel env add NEXT_PUBLIC_SUPABASE_URL "YOUR_SUPABASE_URL_HERE" --scope buffr --yes
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY "YOUR_SUPABASE_ANON_KEY_HERE" --scope buffr --yes

# Database URLs
vercel env add DATABASE_URL "YOUR_DATABASE_URL_HERE" --scope buffr --yes
vercel env add SUPABASE_DATABASE_URL "YOUR_SUPABASE_DATABASE_URL_HERE" --scope buffr --yes

# Service keys
vercel env add SUPABASE_SERVICE_ROLE_KEY "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE" --scope buffr --yes

# AI Configuration
vercel env add LLM_API_KEY "YOUR_OPENAI_API_KEY_HERE" --scope buffr --yes
vercel env add LLM_CHOICE "gpt-4.1-mini" --scope buffr --yes
vercel env add EMBEDDING_API_KEY "YOUR_OPENAI_API_KEY_HERE" --scope buffr --yes
vercel env add EMBEDDING_MODEL "text-embedding-3-small" --scope buffr --yes

# Feature flags
vercel env add ENABLE_AI_FEATURES "true" --scope buffr --yes
vercel env add ENABLE_SMART_TEMPLATES "true" --scope buffr --yes
vercel env add ENABLE_COMPLIANCE_AI "true" --scope buffr --yes
vercel env add ENABLE_DOCUMENT_INTELLIGENCE "true" --scope buffr --yes

# Security
vercel env add JWT_SECRET "YOUR_JWT_SECRET_HERE" --scope buffr --yes
vercel env add ENCRYPTION_KEY "your-32-character-encryption-key-for-buffrsign" --scope buffr --yes
vercel env add HASH_SALT_ROUNDS "12" --scope buffr --yes

# API Configuration
vercel env add NEXT_PUBLIC_API_URL "https://api.sign.buffr.ai" --scope buffr --yes
vercel env add NEXT_PUBLIC_API_KEY "your-api-key-for-backend" --scope buffr --yes

# Redis Configuration
vercel env add REDIS_URL "redis://localhost:6379" --scope buffr --yes
vercel env add REDIS_HOST "YOUR_REDIS_HOST_HERE" --scope buffr --yes
vercel env add REDIS_PORT "YOUR_REDIS_PORT_HERE" --scope buffr --yes
vercel env add REDIS_PASSWORD "YOUR_REDIS_PASSWORD_HERE" --scope buffr --yes

# Monitoring
vercel env add LANGFUSE_PUBLIC_KEY "YOUR_LANGFUSE_PUBLIC_KEY_HERE" --scope buffr --yes
vercel env add LANGFUSE_SECRET_KEY "your-langfuse-secret-key-here" --scope buffr --yes
vercel env add LANGFUSE_HOST "https://us.cloud.langfuse.com" --scope buffr --yes

# File upload
vercel env add MAX_FILE_SIZE "10485760" --scope buffr --yes

# CORS
vercel env add CORS_ORIGINS "https://sign.buffr.ai,https://www.sign.buffr.ai,http://localhost:3000" --scope buffr --yes

echo "✅ All environment variables added successfully!"
echo "🔄 Redeploying project with new environment variables..."

# Redeploy the project
vercel --scope buffr --prod

echo "🎉 Deployment complete!"
