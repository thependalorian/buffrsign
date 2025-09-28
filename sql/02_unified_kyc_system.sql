-- Unified KYC System Tables
-- This file establishes a comprehensive system for KYC (Know Your Customer) processes.

-- KYC Workflow State Enum
CREATE TYPE kyc_workflow_state AS ENUM (
    'initialized',
    'document_uploaded',
    'ocr_extraction_complete',
    'ai_country_detection',
    'ai_field_extraction',
    'sadc_validation',
    'compliance_checked',
    'auto_approved',
    'auto_rejected',
    'manual_review',
    'completed',
    'failed',
    'expired'
);

-- KYC Decision Enum
CREATE TYPE kyc_decision AS ENUM (
    'approved',
    'rejected',
    'pending',
    'requires_review'
);

-- SADC Countries Table (for reference)
CREATE TABLE sadc_countries (
    id SERIAL PRIMARY KEY,
    country_code VARCHAR(2) UNIQUE NOT NULL,
    country_name VARCHAR(100) NOT NULL,
    id_format_type VARCHAR(50),
    id_regex_patterns TEXT[],
    date_format VARCHAR(20),
    keywords TEXT[],
    validation_rules JSONB,
    is_active BOOLEAN DEFAULT TRUE
);

-- KYC Workflows Table
CREATE TABLE kyc_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bfr_sign_id TEXT REFERENCES bfr_sign_ids(id),
    workflow_state kyc_workflow_state NOT NULL DEFAULT 'initialized',
    detected_country_code VARCHAR(2) REFERENCES sadc_countries(country_code),
    final_decision kyc_decision,
    decision_confidence FLOAT,
    rejection_reasons TEXT[],
    processing_time_ms INTEGER,
    total_confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- KYC Documents Table
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES kyc_workflows(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- e.g., national_id, passport, proof_of_address
    file_url TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'supabase',
    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE
);

-- AI Analysis Steps Table
CREATE TABLE kyc_analysis_steps (
    id BIGSERIAL PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES kyc_workflows(id) ON DELETE CASCADE,
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    ai_method VARCHAR(100),
    confidence_score FLOAT,
    processing_time_ms INTEGER,
    input_data JSONB,
    output_data JSONB,
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Extracted ID Fields Table
CREATE TABLE extracted_id_fields (
    workflow_id UUID PRIMARY KEY REFERENCES kyc_workflows(id) ON DELETE CASCADE,
    id_number VARCHAR(100),
    full_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    place_of_birth VARCHAR(255),
    address TEXT,
    confidence_score FLOAT
);

-- Add Triggers for updated_at
CREATE TRIGGER update_kyc_workflows_updated_at
BEFORE UPDATE ON kyc_workflows
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_kyc_workflows_user_id ON kyc_workflows(user_id);
CREATE INDEX idx_kyc_workflows_state ON kyc_workflows(workflow_state);
CREATE INDEX idx_kyc_documents_workflow_id ON kyc_documents(workflow_id);
CREATE INDEX idx_kyc_analysis_steps_workflow_id ON kyc_analysis_steps(workflow_id);
