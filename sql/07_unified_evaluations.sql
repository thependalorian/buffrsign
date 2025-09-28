-- Unified Evaluation System Tables
-- This file establishes a generic framework for running and tracking evaluations.

-- Evaluation Type Enum
CREATE TYPE evaluation_type AS ENUM (
    'a_b_test',
    'feature_flag',
    'model_performance',
    'user_experience'
);

-- Evaluation Status Enum
CREATE TYPE evaluation_status AS ENUM (
    'draft',
    'running',
    'paused',
    'completed',
    'archived'
);

-- Evaluation Runs Table
CREATE TABLE evaluation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    evaluation_type evaluation_type NOT NULL,
    status evaluation_status NOT NULL DEFAULT 'draft',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Evaluation Variants Table
CREATE TABLE evaluation_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., 'control', 'variant_a'
    description TEXT,
    traffic_percentage FLOAT NOT NULL,
    is_control BOOLEAN DEFAULT FALSE,
    UNIQUE(run_id, name)
);

-- Evaluation Metrics Table
CREATE TABLE evaluation_metrics (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50), -- e.g., 'conversion_rate', 'avg_session_duration'
    goal_direction VARCHAR(10), -- e.g., 'increase', 'decrease'
    UNIQUE(run_id, metric_name)
);

-- Evaluation Results Table
CREATE TABLE evaluation_results (
    id BIGSERIAL PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES evaluation_variants(id) ON DELETE CASCADE,
    metric_id BIGINT NOT NULL REFERENCES evaluation_metrics(id) ON DELETE CASCADE,
    value FLOAT NOT NULL,
    sample_size INTEGER NOT NULL,
    confidence_interval JSONB,
    is_significant BOOLEAN,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(run_id, variant_id, metric_id)
);

-- Add Triggers for updated_at
CREATE TRIGGER update_evaluation_runs_updated_at
BEFORE UPDATE ON evaluation_runs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_evaluation_runs_type_status ON evaluation_runs(evaluation_type, status);
CREATE INDEX idx_evaluation_variants_run_id ON evaluation_variants(run_id);
CREATE INDEX idx_evaluation_metrics_run_id ON evaluation_metrics(run_id);
CREATE INDEX idx_evaluation_results_run_variant_metric ON evaluation_results(run_id, variant_id, metric_id);
