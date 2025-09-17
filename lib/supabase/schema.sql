-- BuffrSign Database Schema
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin');

-- Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    company_name TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- Permissions (for role-based access control)
    can_view_dashboard BOOLEAN DEFAULT TRUE,
    can_manage_users BOOLEAN DEFAULT FALSE,
    can_manage_documents BOOLEAN DEFAULT FALSE,
    can_manage_compliance BOOLEAN DEFAULT FALSE,
    can_view_analytics BOOLEAN DEFAULT FALSE,
    can_manage_settings BOOLEAN DEFAULT FALSE,
    can_access_admin_panel BOOLEAN DEFAULT FALSE,
    can_manage_super_admins BOOLEAN DEFAULT FALSE,
    can_manage_kyc BOOLEAN DEFAULT FALSE,
    can_manage_templates BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_company ON profiles(company_name);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role and permissions)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
        )
    );

-- Super admins can manage all profiles
CREATE POLICY "Super admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Create function to automatically set permissions based on role
CREATE OR REPLACE FUNCTION set_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Set permissions based on role
    CASE NEW.role
        WHEN 'user' THEN
            NEW.can_view_dashboard = TRUE;
            NEW.can_manage_users = FALSE;
            NEW.can_manage_documents = FALSE;
            NEW.can_manage_compliance = FALSE;
            NEW.can_view_analytics = FALSE;
            NEW.can_manage_settings = FALSE;
            NEW.can_access_admin_panel = FALSE;
            NEW.can_manage_super_admins = FALSE;
            NEW.can_manage_kyc = FALSE;
            NEW.can_manage_templates = FALSE;
        WHEN 'admin' THEN
            NEW.can_view_dashboard = TRUE;
            NEW.can_manage_users = TRUE;
            NEW.can_manage_documents = TRUE;
            NEW.can_manage_compliance = TRUE;
            NEW.can_view_analytics = TRUE;
            NEW.can_manage_settings = TRUE;
            NEW.can_access_admin_panel = TRUE;
            NEW.can_manage_super_admins = FALSE;
            NEW.can_manage_kyc = TRUE;
            NEW.can_manage_templates = TRUE;
        WHEN 'super_admin' THEN
            NEW.can_view_dashboard = TRUE;
            NEW.can_manage_users = TRUE;
            NEW.can_manage_documents = TRUE;
            NEW.can_manage_compliance = TRUE;
            NEW.can_view_analytics = TRUE;
            NEW.can_manage_settings = TRUE;
            NEW.can_access_admin_panel = TRUE;
            NEW.can_manage_super_admins = TRUE;
            NEW.can_manage_kyc = TRUE;
            NEW.can_manage_templates = TRUE;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set permissions
CREATE TRIGGER set_permissions_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_user_permissions();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        company_name,
        phone,
        email_notifications,
        sms_notifications,
        two_factor_enabled,
        language,
        timezone,
        theme
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')::user_role,
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'phone',
        COALESCE(NEW.raw_user_meta_data->>'email_notifications', 'true')::boolean,
        COALESCE(NEW.raw_user_meta_data->>'sms_notifications', 'false')::boolean,
        COALESCE(NEW.raw_user_meta_data->>'two_factor_enabled', 'false')::boolean,
        COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
        COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC'),
        COALESCE(NEW.raw_user_meta_data->>'theme', 'system')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update last_login_at
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE profiles 
    SET last_login_at = NOW() 
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for login updates
CREATE TRIGGER on_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION update_last_login();

-- Insert default super admin (you'll need to update this with actual founder details)
-- INSERT INTO profiles (
--     id,
--     email,
--     first_name,
--     last_name,
--     role,
--     company_name,
--     is_verified,
--     is_active
-- ) VALUES (
--     'your-founder-user-id-here',
--     'founder@buffrsign.com',
--     'Founder',
--     'Name',
--     'super_admin',
--     'BuffrSign',
--     TRUE,
--     TRUE
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO authenticated;
