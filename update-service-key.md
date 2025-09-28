# Update Service Role Key

## Current Issue
Your `.env.local` file has the correct BuffrSign project URL and anon key, but the service role key is still pointing to the old BuffrLend project.

## Current Configuration (INCORRECT Service Key)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZHhvdG9vdWlhYmJtb2R6a2xjZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3NDk5NDYyNjYsImV4cCI6MjA2NTUyMjI2Nn0.2WFZwDeF24M4-xUm28f8BMHT7r1BZMLMdd72Rw5csls
```
↑ This key is for the BuffrLend project (`xndxotoouiabmodzklcf`)

## Steps to Fix

### 1. Get the Correct Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **"buffrsign"** project (not "buffr_lend")
3. Go to Settings → API
4. Copy the **service_role secret key** (it should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update .env.local
Replace the `SUPABASE_SERVICE_ROLE_KEY` line in your `.env.local` file with the correct key from the BuffrSign project.

### 3. Test the Connection
After updating, restart your development server and test the demo login:
- Email: `demo@buffrsign.com`
- Password: `demo123`

## Current Status
✅ **Correct**: SUPABASE_URL, SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
❌ **Needs Update**: SUPABASE_SERVICE_ROLE_KEY

## Demo User Ready
The demo user is already created in the BuffrSign database and ready to use once you update the service role key.
