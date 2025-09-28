-- Create compliance_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'compliance_status_enum') THEN
        CREATE TYPE compliance_status_enum AS ENUM (
            'pending',
            'compliant',
            'non_compliant',
            'needs_review',
            'exempt'
        );
    END IF;
END $$;

-- Create regulatory_body enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'regulatory_body_enum') THEN
        CREATE TYPE regulatory_body_enum AS ENUM (
            'namfisa',
            'cran',
            'sadc',
            'gdpr',
            'other'
        );
    END IF;
END $$;

-- Unified Compliance Checks table
CREATE TABLE IF NOT EXISTS public.compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_name TEXT NOT NULL,
    description TEXT,
    regulatory_body regulatory_body_enum NOT NULL,
    regulation_reference TEXT, -- e.g., 'ETA 2019', 'GDPR Article 5'
    target_entity TEXT, -- e.g., 'document', 'user', 'system'
    target_id TEXT, -- ID of the entity being checked
    status compliance_status_enum DEFAULT 'pending'::compliance_status_enum,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    next_due_at TIMESTAMPTZ,
    checked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb, -- Specific details about the check and findings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Regulatory Reports table
CREATE TABLE IF NOT EXISTS public.regulatory_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name TEXT NOT NULL,
    regulatory_body regulatory_body_enum NOT NULL,
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    status TEXT DEFAULT 'draft', -- e.g., 'draft', 'generated', 'submitted', 'approved'
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    submission_date TIMESTAMPTZ,
    report_content_url TEXT, -- URL to the generated report document
    summary JSONB DEFAULT '{}'::jsonb, -- Summary of the report findings
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for all new tables
ALTER TABLE public.compliance_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read compliance checks" ON public.compliance_checks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage compliance checks" ON public.compliance_checks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.regulatory_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read regulatory reports" ON public.regulatory_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage regulatory reports" ON public.regulatory_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
