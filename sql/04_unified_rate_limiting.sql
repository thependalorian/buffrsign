-- Unified Rate Limiting Tables
-- This file establishes a system for API rate limiting to prevent abuse.

-- Rate Limiting Rule Type Enum
CREATE TYPE rate_limit_rule_type AS ENUM (
    'api',
    'login_attempt',
    'kyc_attempt',
    'document_upload',
    'signature_request'
);

-- Rate Limiting Rules Table
CREATE TABLE rate_limiting_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) UNIQUE NOT NULL,
    rule_type rate_limit_rule_type NOT NULL,
    resource TEXT NOT NULL, -- e.g., /api/v1/login, specific user action
    limit_count INTEGER NOT NULL,
    time_window_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Rate Limiting Counters Table
CREATE TABLE rate_limiting_counters (
    id BIGSERIAL PRIMARY KEY,
    rule_id INTEGER NOT NULL REFERENCES rate_limiting_rules(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL, -- e.g., user_id, ip_address, api_key
    count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(rule_id, identifier, window_start)
);

-- Rate Limiting Violations Table
CREATE TABLE rate_limiting_violations (
    id BIGSERIAL PRIMARY KEY,
    rule_id INTEGER NOT NULL REFERENCES rate_limiting_rules(id) ON DELETE CASCADE,
    identifier TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB
);

-- Rate Limiting Exemptions Table
CREATE TABLE rate_limiting_exemptions (
    id SERIAL PRIMARY KEY,
    identifier TEXT UNIQUE NOT NULL, -- e.g., specific user_id or ip_address
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Add Triggers for updated_at
CREATE TRIGGER update_rate_limiting_rules_updated_at
BEFORE UPDATE ON rate_limiting_rules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limiting_counters_updated_at
BEFORE UPDATE ON rate_limiting_counters
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limiting_exemptions_updated_at
BEFORE UPDATE ON rate_limiting_exemptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_rate_limiting_counters_identifier ON rate_limiting_counters(identifier);
CREATE INDEX idx_rate_limiting_violations_identifier ON rate_limiting_violations(identifier);
