-- Unified Compliance Framework Tables
-- This file establishes a system for managing compliance with various regulations.

-- Compliance Check Status Enum
CREATE TYPE compliance_check_status AS ENUM (
    'compliant',
    'non_compliant',
    'in_review',
    'not_applicable'
);

-- Compliance Checks Table
CREATE TABLE compliance_checks (
    id BIGSERIAL PRIMARY KEY,
    regulation VARCHAR(100) NOT NULL, -- e.g., 'GDPR', 'PCI_DSS', 'NAMFISA'
    control_id VARCHAR(100) NOT NULL,
    description TEXT,
    status compliance_check_status NOT NULL,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    checked_by UUID REFERENCES users(id),
    details JSONB, -- For evidence, notes, etc.
    UNIQUE(regulation, control_id)
);

-- Regulatory Reports Table
CREATE TABLE regulatory_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regulation VARCHAR(100) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    report_data JSONB,
    file_url TEXT
);

-- Data Processing Records (for GDPR, etc.)
CREATE TABLE data_processing_records (
    id BIGSERIAL PRIMARY KEY,
    activity_description TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    data_subjects TEXT[] NOT NULL,
    legal_basis VARCHAR(100) NOT NULL,
    retention_period INTERVAL,
    security_measures TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add Triggers for updated_at
CREATE TRIGGER update_data_processing_records_updated_at
BEFORE UPDATE ON data_processing_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_compliance_checks_regulation ON compliance_checks(regulation);
CREATE INDEX idx_regulatory_reports_regulation ON regulatory_reports(regulation);
