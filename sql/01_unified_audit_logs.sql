-- Unified Audit Log Tables
-- This file establishes a comprehensive, tamper-evident audit trail system.

-- Audit Event Type Enum
CREATE TYPE audit_event_type AS ENUM (
    'user_registration',
    'user_login',
    'user_logout',
    'password_change',
    'profile_update',
    'kyc_verification',
    'document_upload',
    'document_view',
    'document_delete',
    'signature_created',
    'signature_verified',
    'workflow_created',
    'workflow_completed',
    'workflow_canceled',
    'security_event',
    'compliance_check',
    'api_key_created',
    'api_key_deleted',
    'system_config_change',
    'data_export',
    'report_generated'
);

-- Audit Event Severity Enum
CREATE TYPE audit_severity AS ENUM (
    'info',
    'warning',
    'error',
    'critical',
    'security'
);

-- BFR-SIGN-ID Table (for unique, jurisdiction-linked user identification)
CREATE TABLE bfr_sign_ids (
    id TEXT PRIMARY KEY, -- Format: BFS-{COUNTRY_CODE}-{UUID}-{TIMESTAMP}
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL,
    national_id_hash TEXT NOT NULL,
    kyc_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Audit Log Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    bfr_sign_id TEXT REFERENCES bfr_sign_ids(id),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    event_type audit_event_type NOT NULL,
    severity audit_severity NOT NULL DEFAULT 'info',
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    device_fingerprint TEXT,
    correlation_id TEXT,
    event_description TEXT,
    details JSONB, -- For storing event-specific data
    previous_hash TEXT, -- For chaining audit entries
    current_hash TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_audit_logs_bfr_sign_id ON audit_logs(bfr_sign_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_event_time ON audit_logs(event_time);

-- Function to create a chained hash for an audit log entry
CREATE OR REPLACE FUNCTION create_audit_log_hash() RETURNS TRIGGER AS $$
DECLARE
    last_hash TEXT;
BEGIN
    -- Get the hash of the most recent audit log entry
    SELECT current_hash INTO last_hash FROM audit_logs ORDER BY event_time DESC, id DESC LIMIT 1;

    -- Set the previous_hash for the new entry
    NEW.previous_hash := last_hash;

    -- Create the current_hash for the new entry
    NEW.current_hash := encode(digest(
        CONCAT(
            NEW.id::text,
            NEW.bfr_sign_id,
            NEW.user_id::text,
            NEW.event_type::text,
            NEW.event_time::text,
            COALESCE(NEW.details::text, ''),
            COALESCE(last_hash, '')
        ),
        'sha256'
    ), 'hex');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically hash audit log entries
CREATE TRIGGER trigger_create_audit_log_hash
BEFORE INSERT ON audit_logs
FOR EACH ROW EXECUTE FUNCTION create_audit_log_hash();
