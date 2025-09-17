#!/bin/bash

echo "🚀 Adding environment variables to Vercel project..."

# Essential Supabase variables
echo "Adding NEXT_PUBLIC_SUPABASE_URL..."
echo "YOUR_SUPABASE_URL_HERE" | vercel env add NEXT_PUBLIC_SUPABASE_URL --scope buffr

echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "YOUR_SUPABASE_ANON_KEY_HERE" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY --scope buffr

echo "Adding SUPABASE_SERVICE_ROLE_KEY..."
echo "YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE" | vercel env add SUPABASE_SERVICE_ROLE_KEY --scope buffr

echo "Adding DATABASE_URL..."
echo "YOUR_DATABASE_URL_HERE" | vercel env add DATABASE_URL --scope buffr

echo "Adding LLM_API_KEY..."
echo "YOUR_OPENAI_API_KEY_HERE" | vercel env add LLM_API_KEY --scope buffr

echo "Adding LLM_CHOICE..."
echo "gpt-4.1-mini" | vercel env add LLM_CHOICE --scope buffr

echo "Adding ENABLE_AI_FEATURES..."
echo "true" | vercel env add ENABLE_AI_FEATURES --scope buffr

echo "Adding JWT_SECRET..."
echo "YOUR_JWT_SECRET_HERE" | vercel env add JWT_SECRET --scope buffr

echo "✅ Essential environment variables added!"
echo "🔄 Redeploying project..."

vercel --scope buffr --prod

echo "🎉 Deployment complete!"
