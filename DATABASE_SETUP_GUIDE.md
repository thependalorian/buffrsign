# 🚀 BuffrSign Database Setup Guide

**Status:** 🔴 **CRITICAL - Database Schema Missing**  
**Issue:** Demo user login failing with 500 error due to missing database tables

---

## 🔍 **Problem Diagnosis**

The error you're seeing:
```
inqoltqqfneqfltcqlmx.supabase.co/auth/v1/token?grant_type=password:1 
Failed to load resource: the server responded with a status of 500 ()
```

**Root Cause:** Your Supabase database is missing the required schema tables (`profiles`, `documents`, `signatures`, etc.).

---

## 🛠️ **Step-by-Step Fix**

### **Step 1: Create Environment Configuration**

Create a `.env.local` file in your project root with the following content:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://inqoltqqfneqfltcqlmx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration (Required for Authentication)
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here_make_it_long_and_secure_at_least_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_make_it_long_and_secure_at_least_32_characters
JWT_DOCUMENT_SECRET=your_jwt_document_secret_key_here_make_it_long_and_secure_at_least_32_characters
JWT_SIGNATURE_SECRET=your_jwt_signature_secret_key_here_make_it_long_and_secure_at_least_32_characters
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_DOCUMENT_EXPIRY=1h
JWT_SIGNATURE_EXPIRY=30m

# OpenAI Configuration (Required for AI Services)
OPENAI_API_KEY=your_openai_api_key_here

# Application Configuration
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

**🔗 Get your Supabase credentials from:** https://supabase.com/dashboard/project/inqoltqqfneqfltcqlmx/settings/api

### **Step 2: Apply Database Schema**

Run the following SQL scripts in your Supabase SQL editor in this exact order:

**🔗 Access your Supabase SQL editor at:** https://supabase.com/dashboard/project/inqoltqqfneqfltcqlmx/sql

#### **2.1: Run Main Schema**
Copy and paste the contents of `lib/supabase/schema.sql` into the SQL editor and execute it.

#### **2.2: Run JWT Migration**
Copy and paste the contents of `lib/supabase/jwt-migration.sql` into the SQL editor and execute it.

#### **2.3: Run Email Controls Migration**
Copy and paste the contents of `supabase/migrations/20241201000000_admin_email_controls.sql` into the SQL editor and execute it.

### **Step 3: Create Demo User**

After setting up the environment and database schema, run:

```bash
cd /Users/georgenekwaya/ai-agent-mastery/buffrsign-starter
node setup-database.js
```

This will create a demo user with the following credentials:
- **Email:** `demo@buffrsign.com`
- **Password:** `demo123`

### **Step 4: Test the Setup**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Try logging in with the demo credentials

---

## 📋 **Required Database Tables**

After running the migrations, you should have these tables:

### **Core Tables:**
- ✅ `profiles` - User profiles and permissions
- ✅ `documents` - Document management
- ✅ `signatures` - Digital signatures
- ✅ `refresh_tokens` - JWT token management
- ✅ `blacklisted_tokens` - Token security
- ✅ `token_audit_log` - Security audit trail

### **Email System Tables:**
- ✅ `manual_email_requests` - Admin email controls
- ✅ `admin_email_activity` - Email audit log
- ✅ `email_queue` - Email processing queue

---

## 🔧 **Troubleshooting**

### **If you get "relation does not exist" errors:**
- Make sure you ran all three SQL scripts in order
- Check that you're running them in the correct Supabase project
- Verify your service role key has the correct permissions

### **If demo user creation fails:**
- Ensure the `profiles` table exists
- Check that your service role key is correct
- Verify the user doesn't already exist

### **If login still fails after setup:**
- Check browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure the Supabase project is active and not paused

---

## 🎯 **Quick Setup Commands**

```bash
# 1. Create environment file (manual step)
# Copy the .env.local content above

# 2. Install dependencies
npm install

# 3. Run database setup
node setup-database.js

# 4. Start development server
npm run dev
```

---

## ✅ **Verification Checklist**

- [ ] `.env.local` file created with correct Supabase credentials
- [ ] `lib/supabase/schema.sql` executed in Supabase SQL editor
- [ ] `lib/supabase/jwt-migration.sql` executed in Supabase SQL editor
- [ ] `supabase/migrations/20241201000000_admin_email_controls.sql` executed
- [ ] Demo user created successfully
- [ ] Can log in with `demo@buffrsign.com` / `demo123`
- [ ] No 500 errors in browser console

---

## 🚨 **Important Notes**

1. **Never commit `.env.local`** - It contains sensitive credentials
2. **Use Service Role Key** - Required for admin operations like creating users
3. **Run migrations in order** - Dependencies exist between the SQL scripts
4. **Check Supabase logs** - If issues persist, check the Supabase dashboard logs

---

## 🆘 **Need Help?**

If you're still having issues:

1. **Check Supabase Dashboard:** https://supabase.com/dashboard/project/inqoltqqfneqfltcqlmx
2. **View Database Tables:** Go to Table Editor to verify tables exist
3. **Check Logs:** Go to Logs section for detailed error messages
4. **Verify API Keys:** Ensure all keys are correct in Settings > API

---

**Once this setup is complete, your demo login should work perfectly!** 🎉
