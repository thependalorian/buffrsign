-- Create audit_event_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_event_type_enum') THEN
        CREATE TYPE audit_event_type_enum AS ENUM (
            'user_login',
            'user_logout',
            'user_registration',
            'user_profile_update',
            'document_upload',
            'document_view',
            'document_sign',
            'document_workflow_start',
            'document_workflow_update',
            'document_workflow_complete',
            'kyc_workflow_start',
            'kyc_workflow_update',
            'kyc_workflow_complete',
            'payment_transaction',
            'system_config_update',
            'security_alert',
            'data_export',
            'data_import',
            'api_call',
            'error',
            'other'
        );
    END IF;
END $$;

-- Create audit_severity_enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audit_severity_enum') THEN
        CREATE TYPE audit_severity_enum AS ENUM (
            'info',
            'low',
            'medium',
            'high',
            'critical'
        );
    END IF;
END $$;

-- Create the unified audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type audit_event_type_enum NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- User who performed the action
    target_id TEXT, -- ID of the resource affected (e.g., document_id, user_id, workflow_id)
    target_table TEXT, -- Table name of the resource affected
    event_description TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb, -- Flexible JSONB for specific event details
    severity audit_severity_enum DEFAULT 'info'::audit_severity_enum,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Compliance-related fields
    legal_basis TEXT,
    consent_given BOOLEAN,
    retention_period INTEGER -- in days
);

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON public.audit_logs (event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_id ON public.audit_logs (target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- Set up Row Level Security (RLS) for audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs table (only admins can view all, users can view their own)
DROP POLICY IF EXISTS "Admins can view all audit logs." ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs." ON public.audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

DROP POLICY IF EXISTS "Users can view their own audit logs." ON public.audit_logs;
CREATE POLICY "Users can view their own audit logs." ON public.audit_logs FOR SELECT USING (auth.uid() = actor_id);

-- Create audit_config table for standardized audit configuration
CREATE TABLE IF NOT EXISTS public.audit_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type audit_event_type_enum UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    retention_policy_days INTEGER DEFAULT 365, -- Default retention for this event type
    alert_on_severity audit_severity_enum[] DEFAULT '{high,critical}'::audit_severity_enum[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for audit_config (only admins can manage)
ALTER TABLE public.audit_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage audit config." ON public.audit_config;
CREATE POLICY "Admins can manage audit config." ON public.audit_config FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
