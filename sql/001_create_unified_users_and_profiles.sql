-- Create a unified user_roles enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'individual',
            'sme_user',
            'enterprise_user',
            'admin',
            'hospitality_staff',
            'customer',
            'corporate_customer'
        );
    END IF;
END $$;

-- Create the profiles table, linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    company_name TEXT,
    user_role user_role_enum DEFAULT 'individual'::user_role_enum,
    plan_type TEXT DEFAULT 'free', -- e.g., 'free', 'basic', 'premium', 'enterprise'
    status TEXT DEFAULT 'active', -- e.g., 'active', 'suspended', 'inactive', 'pending_verification'
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Additional fields from BuffrSign's User model
    preferences JSONB DEFAULT '{}'::jsonb,
    biometric_data JSONB DEFAULT '[]'::jsonb,
    behavioral_metrics JSONB DEFAULT '{}'::jsonb,
    subscription_expires_at TIMESTAMPTZ,
    -- Additional fields from BuffrLend's profiles
    first_name TEXT,
    last_name TEXT,
    -- Additional fields from The Shandi's BuffrHostUser (if applicable, linked via profiles)
    property_id INTEGER, -- Link to hospitality_property if applicable
    user_type_id INTEGER, -- Link to user_type if applicable
    permissions TEXT[] DEFAULT '{}'::TEXT[],
    -- KYC Information (from BuffrSign's UserRegistrationWithKYC)
    country_code TEXT,
    national_id_number TEXT,
    national_id_type TEXT,
    id_document_url TEXT,
    kyc_status TEXT DEFAULT 'pending', -- e.g., 'pending', 'verified', 'rejected'
    consent_given BOOLEAN DEFAULT FALSE,
    legal_basis TEXT,
    retention_period INTEGER -- in days
);

-- Set up Row Level Security (RLS) for profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create functions to keep profiles table in sync with auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, created_at, last_login_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.created_at, NEW.last_sign_in_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call handle_new_user function on new auth.users inserts
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profiles table when auth.users is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET
    email = NEW.email,
    full_name = NEW.raw_user_meta_data->>'name',
    last_login_at = NEW.last_sign_in_at,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create trigger to call handle_user_update function on auth.users updates
CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Create function to delete profiles table when auth.users is deleted
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;

-- Create trigger to call handle_user_delete function on auth.users deletes
CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Create the customer table, linking to the unified profiles table
CREATE TABLE IF NOT EXISTS public.customers (
    customer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    customer_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'corporate'
    loyalty_score INTEGER DEFAULT 0,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up Row Level Security (RLS) for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers table
DROP POLICY IF EXISTS "Customers are viewable by authenticated users." ON public.customers;
CREATE POLICY "Customers are viewable by authenticated users." ON public.customers FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own customer record." ON public.customers;
CREATE POLICY "Users can insert their own customer record." ON public.customers FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can update own customer record." ON public.customers;
CREATE POLICY "Users can update own customer record." ON public.customers FOR UPDATE USING (auth.uid() = customer_id);

-- Create the corporate_customers table, linking to the unified profiles table
CREATE TABLE IF NOT EXISTS public.corporate_customers (
    corporate_customer_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_registration_number TEXT UNIQUE NOT NULL,
    industry TEXT,
    contact_person_id UUID REFERENCES public.profiles(id), -- Link to a profile that is the main contact
    billing_address JSONB,
    tax_information JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up Row Level Security (RLS) for corporate_customers table
ALTER TABLE public.corporate_customers ENABLE ROW LEVEL SECURITY;

-- Policies for corporate_customers table
DROP POLICY IF EXISTS "Corporate customers are viewable by authenticated users." ON public.corporate_customers;
CREATE POLICY "Corporate customers are viewable by authenticated users." ON public.corporate_customers FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own corporate customer record." ON public.corporate_customers;
CREATE POLICY "Users can insert their own corporate customer record." ON public.corporate_customers FOR INSERT WITH CHECK (auth.uid() = corporate_customer_id);

DROP POLICY IF EXISTS "Users can update own corporate customer record." ON public.corporate_customers;
CREATE POLICY "Users can update own corporate customer record." ON public.corporate_customers FOR UPDATE USING (auth.uid() = corporate_customer_id);
