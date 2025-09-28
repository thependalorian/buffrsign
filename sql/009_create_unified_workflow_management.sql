-- Create workflow_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_status_enum') THEN
        CREATE TYPE workflow_status_enum AS ENUM (
            'draft',
            'active',
            'paused',
            'completed',
            'cancelled',
            'failed'
        );
    END IF;
END $$;

-- Create workflow_step_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_step_type_enum') THEN
        CREATE TYPE workflow_step_type_enum AS ENUM (
            'manual_action',
            'api_call',
            'email_send',
            'sms_send',
            'document_sign',
            'data_entry',
            'approval',
            'conditional',
            'parallel',
            'sequential',
            'ai_task',
            'integration_task',
            'custom'
        );
    END IF;
END $$;

-- Create workflow_step_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'workflow_step_status_enum') THEN
        CREATE TYPE workflow_step_status_enum AS ENUM (
            'pending',
            'in_progress',
            'completed',
            'skipped',
            'failed',
            'paused'
        );
    END IF;
END $$;

-- Unified Workflow Templates table
CREATE TABLE IF NOT EXISTS public.workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    template_definition JSONB NOT NULL, -- JSON schema for the workflow structure
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Workflows table (instances of templates or custom workflows)
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status workflow_status_enum DEFAULT 'draft'::workflow_status_enum,
    current_step_id UUID, -- Reference to the currently active workflow_step_executions
    context JSONB DEFAULT '{}'::jsonb, -- Dynamic data relevant to the workflow instance
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Workflow Steps table (defines the steps within a workflow template)
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_template_id UUID REFERENCES public.workflow_templates(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    step_type workflow_step_type_enum NOT NULL,
    configuration JSONB DEFAULT '{}'::jsonb, -- Step-specific configuration (e.g., API endpoint, email template ID)
    next_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL, -- For sequential workflows
    failure_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE SET NULL, -- Step to go to on failure
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (workflow_template_id, step_order)
);

-- Unified Workflow Instances table (for tracking individual runs of a workflow)
CREATE TABLE IF NOT EXISTS public.workflow_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status workflow_status_enum DEFAULT 'active'::workflow_status_enum,
    current_step_execution_id UUID, -- Reference to the currently active workflow_step_executions
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Workflow Step Executions table (for tracking individual step runs within an instance)
CREATE TABLE IF NOT EXISTS public.workflow_step_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_instance_id UUID REFERENCES public.workflow_instances(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES public.workflow_steps(id) ON DELETE CASCADE,
    status workflow_step_status_enum DEFAULT 'pending'::workflow_step_status_enum,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For manual actions/approvals
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    input_data JSONB DEFAULT '{}'::jsonb,
    output_data JSONB DEFAULT '{}'::jsonb,
    error_details TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for all new tables
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read workflow templates" ON public.workflow_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage workflow templates" ON public.workflow_templates FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read their own workflows" ON public.workflows FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Allow admins to manage all workflows" ON public.workflows FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read workflow steps" ON public.workflow_steps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage workflow steps" ON public.workflow_steps FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.workflow_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read their own workflow instances" ON public.workflow_instances FOR SELECT USING (auth.uid() = initiated_by);
CREATE POLICY "Allow admins to manage all workflow instances" ON public.workflow_instances FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.workflow_step_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read their own workflow step executions" ON public.workflow_step_executions FOR SELECT USING (auth.uid() = assigned_to OR EXISTS (SELECT 1 FROM public.workflow_instances wi WHERE wi.id = workflow_instance_id AND wi.initiated_by = auth.uid()));
CREATE POLICY "Allow admins to manage all workflow step executions" ON public.workflow_step_executions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
