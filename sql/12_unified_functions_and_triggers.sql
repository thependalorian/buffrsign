-- Unified Helper Functions and Triggers
-- This file contains utility functions and triggers for the unified schema.

-- Function to validate email format
CREATE OR REPLACE FUNCTION is_valid_email(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
END;
$$ LANGUAGE plpgsql;

-- Function to validate phone number format (simple international format)
CREATE OR REPLACE FUNCTION is_valid_phone(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN phone ~ '^\+[1-9]\d{1,14}$';
END;
$$ LANGUAGE plpgsql;

-- Function to generate a BFR-SIGN-ID
CREATE OR REPLACE FUNCTION generate_bfr_sign_id(user_id UUID, country_code TEXT, national_id TEXT)
RETURNS TEXT AS $$
DECLARE
    national_id_uuid UUID;
    timestamp_str TEXT;
BEGIN
    -- Create a deterministic UUID from the national ID
    national_id_uuid := uuid_generate_v5(uuid_ns_dns(), country_code || national_id);
    timestamp_str := to_char(NOW(), 'YYYYMMDDHH24MISS');
    RETURN 'BFS-' || country_code || '-' || national_id_uuid::text || '-' || timestamp_str;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create a user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    INSERT INTO user_preferences (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_profile
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_profile();

-- Trigger to handle new user registration from Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, status)
    VALUES (NEW.id, NEW.email, 'individual', 'pending_verification');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Add validation constraints to tables
ALTER TABLE users ADD CONSTRAINT email_validation CHECK (is_valid_email(email));
ALTER TABLE users ADD CONSTRAINT phone_validation CHECK (phone IS NULL OR is_valid_phone(phone));
ALTER TABLE organizations ADD CONSTRAINT org_email_validation CHECK (email IS NULL OR is_valid_email(email));
ALTER TABLE organizations ADD CONSTRAINT org_phone_validation CHECK (phone IS NULL OR is_valid_phone(phone));
