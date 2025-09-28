-- Create rate_limit_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rate_limit_type_enum') THEN
        CREATE TYPE rate_limit_type_enum AS ENUM (
            'ip_address',
            'user_id',
            'api_key',
            'endpoint',
            'global'
        );
    END IF;
END $$;

-- Create the unified rate_limits table
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- e.g., 'login_attempts', 'api_requests_per_minute'
    limit_value INTEGER NOT NULL, -- Max requests allowed
    time_window_seconds INTEGER NOT NULL, -- Time window in seconds
    type rate_limit_type_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the unified rate_limit_status table to track current usage
CREATE TABLE IF NOT EXISTS public.rate_limit_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_limit_id UUID REFERENCES public.rate_limits(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL, -- IP address, user_id, API key, or endpoint path
    current_requests INTEGER DEFAULT 0,
    last_reset_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (rate_limit_id, identifier)
);

-- Create the unified rate_limiting_exemptions table
CREATE TABLE IF NOT EXISTS public.rate_limiting_exemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_limit_id UUID REFERENCES public.rate_limits(id) ON DELETE CASCADE,
    exempt_identifier TEXT NOT NULL, -- IP address, user_id, API key, etc.
    exemption_reason TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (rate_limit_id, exempt_identifier)
);

-- Set up RLS for all new tables
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read rate limits" ON public.rate_limits FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage rate limits" ON public.rate_limits FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.rate_limit_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read rate limit status" ON public.rate_limit_status FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage rate limit status" ON public.rate_limit_status FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.rate_limiting_exemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read rate limiting exemptions" ON public.rate_limiting_exemptions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage rate limiting exemptions" ON public.rate_limiting_exemptions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
