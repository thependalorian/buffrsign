# Fix Environment Variables for BuffrSign

## Issue Identified
Your `.env.local` file is pointing to the wrong Supabase project. You need to use the **BuffrSign** project, not the BuffrLend project.

## Current Configuration (WRONG)
```
SUPABASE_URL=https://xndxotoouiabmodzklcf.supabase.co  # This is BuffrLend project
```

## Correct Configuration (NEEDED)
```
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co  # This is BuffrSign project
```

## Steps to Fix

### 1. Get the Correct API Keys
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select the **"buffrsign"** project (not "buffr_lend")
3. Go to Settings → API
4. Copy the following values:
   - **Project URL**: `https://inqoltqqfneqfltcqlmx.supabase.co`
   - **anon public key**: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role secret key**: (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update .env.local
Replace the values in your `.env.local` file:

```bash
# BuffrSign Project (CORRECT)
SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucW9sdHFxZm5lcWZsdGNxbG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQyNzIsImV4cCI6MjA3MDc0MDI3Mn0.gbHXR7dU54NQ1yfoOGKN9GoWcb-HctHLPLEWuSO3CZg
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY_FROM_DASHBOARD]
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucW9sdHFxZm5lcWZsdGNxbG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNjQyNzIsImV4cCI6MjA3MDc0MDI3Mn0.gbHXR7dU54NQ1yfoOGKN9GoWcb-HctHLPLEWuSO3CZg
```

### 3. Demo User Created
✅ A demo user has already been created in the BuffrSign database:
- **Email**: `demo@buffrsign.com`
- **Password**: `demo123`

### 4. Test the Connection
After updating the environment variables, restart your development server:

```bash
npm run dev
```

Then try logging in with the demo credentials.

## Why This Happened
You had two Supabase projects:
1. **BuffrLend** (`xndxotoouiabmodzklcf`) - for lending platform
2. **BuffrSign** (`inqoltqqfneqfltcqlmx`) - for document signing platform

Your environment variables were pointing to the wrong project (BuffrLend instead of BuffrSign).

## Next Steps
1. Update your `.env.local` with the correct BuffrSign project keys
2. Restart the development server
3. Test login with `demo@buffrsign.com` / `demo123`
4. The authentication should now work correctly!
