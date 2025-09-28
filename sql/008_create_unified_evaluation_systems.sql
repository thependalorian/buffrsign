-- Create evaluation_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_type_enum') THEN
        CREATE TYPE evaluation_type_enum AS ENUM (
            'a_b_test',
            'feature_rollout',
            'model_performance',
            'user_experience',
            'system_benchmark',
            'custom'
        );
    END IF;
END $$;

-- Create evaluation_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evaluation_status_enum') THEN
        CREATE TYPE evaluation_status_enum AS ENUM (
            'pending',
            'running',
            'completed',
            'cancelled',
            'failed'
        );
    END IF;
END $$;

-- Unified Evaluation Runs table
CREATE TABLE IF NOT EXISTS public.evaluation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    evaluation_type evaluation_type_enum NOT NULL,
    status evaluation_status_enum DEFAULT 'pending'::evaluation_status_enum,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    configuration JSONB DEFAULT '{}'::jsonb, -- Configuration parameters for the evaluation
    results_summary JSONB DEFAULT '{}'::jsonb, -- High-level summary of results
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Evaluation Metrics table
CREATE TABLE IF NOT EXISTS public.evaluation_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_run_id UUID REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    metric_unit TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Unified Test Results table (for detailed test outcomes)
CREATE TABLE IF NOT EXISTS public.test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluation_run_id UUID REFERENCES public.evaluation_runs(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    test_suite TEXT,
    status TEXT NOT NULL, -- e.g., 'pass', 'fail', 'skip'
    duration_ms INTEGER,
    error_details TEXT,
    log_output TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up RLS for all new tables
ALTER TABLE public.evaluation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read evaluation runs" ON public.evaluation_runs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage evaluation runs" ON public.evaluation_runs FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.evaluation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read evaluation metrics" ON public.evaluation_metrics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage evaluation metrics" ON public.evaluation_metrics FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read test results" ON public.test_results FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage test results" ON public.test_results FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
