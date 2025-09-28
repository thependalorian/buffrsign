-- Adumo Online Payment Gateway Integrations
-- Tables for managing Adumo Online configurations, transactions, and tokenized cards.

-- Adumo Configuration Table
CREATE TABLE adumo_configs (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id INTEGER REFERENCES HospitalityProperty(property_id) ON DELETE CASCADE, -- Optional, for Buffr Host
    project_name VARCHAR(100) NOT NULL, -- e.g., 'buffrlend', 'buffrsign', 'buffrhost'
    merchant_id VARCHAR(255) NOT NULL,
    application_id VARCHAR(255) NOT NULL,
    jwt_secret TEXT NOT NULL,
    test_mode BOOLEAN DEFAULT TRUE,
    live_url TEXT,
    test_url TEXT,
    webhook_secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Adumo Transactions Table
CREATE TABLE adumo_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES adumo_configs(config_id),
    user_id UUID REFERENCES profiles(id), -- Link to unified profiles table
    merchant_reference VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency_code VARCHAR(3) DEFAULT 'NAD',
    transaction_index UUID, -- Adumo's unique transaction identifier
    status VARCHAR(50) NOT NULL, -- e.g., 'APPROVED', 'DECLINED', 'PENDING'
    result INTEGER, -- Adumo's _RESULT code (0=success, -1=failed, 1=warning)
    error_code VARCHAR(10),
    error_message TEXT,
    bank_error_code VARCHAR(10),
    bank_error_message TEXT,
    payment_method VARCHAR(50),
    acquirer_datetime TIMESTAMP WITH TIME ZONE,
    redirect_successful_url TEXT,
    redirect_failed_url TEXT,
    request_payload JSONB,
    response_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Adumo Tokenized Cards (for 1Click payments)
CREATE TABLE adumo_tokenized_cards (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES adumo_configs(config_id),
    user_id UUID REFERENCES profiles(id), -- Link to unified profiles table
    puid UUID NOT NULL UNIQUE, -- Adumo's Profile Unique Identifier
    card_type VARCHAR(50),
    pan_hashed VARCHAR(16), -- First six and last four digits
    card_country VARCHAR(50),
    expiry_date DATE, -- Stored as month/year, but can be parsed to date
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Adumo Webhook Logs
CREATE TABLE adumo_webhook_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES adumo_configs(config_id),
    transaction_id UUID REFERENCES adumo_transactions(transaction_id),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) -- e.g., 'processed', 'failed', 'pending'
);

-- Indexes for performance
CREATE INDEX idx_adumo_transactions_user ON adumo_transactions(user_id);
CREATE INDEX idx_adumo_transactions_merchant_ref ON adumo_transactions(merchant_reference);
CREATE INDEX idx_adumo_transactions_status ON adumo_transactions(status);
CREATE INDEX idx_adumo_tokenized_cards_user ON adumo_tokenized_cards(user_id);
CREATE INDEX idx_adumo_webhook_logs_transaction ON adumo_webhook_logs(transaction_id);

-- Add updated_at triggers (assuming update_updated_at_column() function exists)
CREATE TRIGGER update_adumo_configs_updated_at
BEFORE UPDATE ON adumo_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adumo_transactions_updated_at
BEFORE UPDATE ON adumo_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adumo_tokenized_cards_updated_at
BEFORE UPDATE ON adumo_tokenized_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
