-- Create ml_model_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ml_model_status_enum') THEN
        CREATE TYPE ml_model_status_enum AS ENUM (
            'draft',
            'training',
            'trained',
            'deployed',
            'archived',
            'failed'
        );
    END IF;
END $$;

-- Create ml_evaluation_metric_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ml_evaluation_metric_type_enum') THEN
        CREATE TYPE ml_evaluation_metric_type_enum AS ENUM (
            'accuracy',
            'precision',
            'recall',
            'f1_score',
            'roc_auc',
            'mse',
            'rmse',
            'mae',
            'r_squared',
            'log_loss',
            'perplexity',
            'bleu',
            'rouge',
            'custom'
        );
    END IF;
END $$;

-- Unified ML Models table
CREATE TABLE IF NOT EXISTS public.ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    framework TEXT, -- e.g., 'tensorflow', 'pytorch', 'scikit-learn'
    task_type TEXT, -- e.g., 'classification', 'regression', 'nlp', 'computer_vision'
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified ML Model Versions table
CREATE TABLE IF NOT EXISTS public.ml_model_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES public.ml_models(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- Path to stored model artifact
    status ml_model_status_enum DEFAULT 'draft'::ml_model_status_enum,
    training_config JSONB DEFAULT '{}'::jsonb,
    training_metrics JSONB DEFAULT '{}'::jsonb,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (model_id, version_number)
);

-- Unified ML Model Evaluations table
CREATE TABLE IF NOT EXISTS public.ml_model_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_version_id UUID REFERENCES public.ml_model_versions(id) ON DELETE CASCADE,
    evaluation_dataset TEXT NOT NULL, -- Name or path of the dataset used for evaluation
    metric_type ml_evaluation_metric_type_enum NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    evaluation_config JSONB DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Set up RLS for all new tables
ALTER TABLE public.ml_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read ML models" ON public.ml_models FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage ML models" ON public.ml_models FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.ml_model_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read ML model versions" ON public.ml_model_versions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage ML model versions" ON public.ml_model_versions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.ml_model_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read ML model evaluations" ON public.ml_model_evaluations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage ML model evaluations" ON public.ml_model_evaluations FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
