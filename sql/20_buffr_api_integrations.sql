-- Buffr API Integrations
-- Tables for managing cross-project API integrations and configurations.

-- Buffr API Integration Configurations
CREATE TABLE buffr_api_integrations (
    integration_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_project VARCHAR(100) NOT NULL, -- e.g., 'buffrlend', 'buffrsign', 'buffrhost'
    target_project VARCHAR(100) NOT NULL, -- e.g., 'buffrlend', 'buffrsign', 'buffrhost'
    integration_name VARCHAR(255) NOT NULL, -- e.g., 'BuffrLend_to_BuffrSign_LoanSigning'
    api_base_url TEXT NOT NULL,
    api_key_encrypted TEXT, -- Encrypted API key for authentication
    api_key_hash TEXT, -- Hash of the API key for verification
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB, -- JSONB field for flexible configuration parameters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(source_project, target_project, integration_name)
);

-- Buffr API Integration Logs (for auditing cross-project calls)
CREATE TABLE buffr_api_integration_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES buffr_api_integrations(integration_id),
    request_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    request_method VARCHAR(10) NOT NULL, -- e.g., 'GET', 'POST'
    request_endpoint TEXT NOT NULL,
    request_payload JSONB,
    response_timestamp TIMESTAMP WITH TIME ZONE,
    response_status_code INTEGER,
    response_payload JSONB,
    error_message TEXT,
    user_id UUID REFERENCES profiles(id), -- User who initiated the action, if applicable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_buffr_api_integrations_source_target ON buffr_api_integrations(source_project, target_project);
CREATE INDEX idx_buffr_api_integration_logs_integration ON buffr_api_integration_logs(integration_id);
CREATE INDEX idx_buffr_api_integration_logs_user ON buffr_api_integration_logs(user_id);

-- Add updated_at triggers (assuming update_updated_at_column() function exists)
CREATE TRIGGER update_buffr_api_integrations_updated_at
BEFORE UPDATE ON buffr_api_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
