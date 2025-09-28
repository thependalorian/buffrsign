-- Unified Machine Learning Model Management Tables
-- This file establishes a system for managing the lifecycle of machine learning models.

-- Model Type Enum
CREATE TYPE ml_model_type AS ENUM (
    'classification',
    'regression',
    'clustering',
    'natural_language_processing',
    'computer_vision',
    'recommendation_system'
);

-- Model Status Enum
CREATE TYPE ml_model_status AS ENUM (
    'development',
    'staging',
    'production',
    'archived',
    'deprecated'
);

-- ML Models Table
CREATE TABLE ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    model_type ml_model_type NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Model Versions Table
CREATE TABLE ml_model_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    description TEXT,
    status ml_model_status NOT NULL DEFAULT 'development',
    model_path TEXT, -- e.g., path to model file in a storage bucket
    parameters JSONB, -- Hyperparameters, etc.
    training_dataset_ref TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(model_id, version_number)
);

-- Model Deployments Table
CREATE TABLE ml_model_deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL REFERENCES ml_model_versions(id) ON DELETE CASCADE,
    environment VARCHAR(100) NOT NULL, -- e.g., development, staging, production
    deployment_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deployed_by UUID REFERENCES users(id),
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model Evaluations Table
CREATE TABLE ml_model_evaluations (
    id BIGSERIAL PRIMARY KEY,
    version_id UUID NOT NULL REFERENCES ml_model_versions(id) ON DELETE CASCADE,
    evaluation_dataset_ref TEXT,
    metrics JSONB NOT NULL, -- e.g., accuracy, precision, recall, f1-score
    notes TEXT,
    evaluated_by UUID REFERENCES users(id),
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Triggers for updated_at
CREATE TRIGGER update_ml_models_updated_at
BEFORE UPDATE ON ml_models
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_model_versions_updated_at
BEFORE UPDATE ON ml_model_versions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_ml_model_versions_model_id ON ml_model_versions(model_id);
CREATE INDEX idx_ml_model_deployments_version_id ON ml_model_deployments(version_id);
CREATE INDEX idx_ml_model_evaluations_version_id ON ml_model_evaluations(version_id);
