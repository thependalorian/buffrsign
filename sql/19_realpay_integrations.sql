-- RealPay Payment Gateway Integrations
-- Tables for managing RealPay configurations, mandates, instalments, and callbacks.

-- RealPay Configuration Table
CREATE TABLE realpay_configs (
    config_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id INTEGER REFERENCES HospitalityProperty(property_id) ON DELETE CASCADE, -- Optional, for Buffr Host
    project_name VARCHAR(100) NOT NULL, -- e.g., 'buffrlend', 'buffrsign', 'buffrhost'
    api_key TEXT NOT NULL,
    hmac_secret TEXT NOT NULL,
    beneficiary_user VARCHAR(255),
    test_mode BOOLEAN DEFAULT TRUE,
    live_callback_url TEXT,
    test_callback_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- RealPay Mandates Table (for Debicheck products)
CREATE TABLE realpay_mandates (
    mandate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES realpay_configs(config_id),
    customer_id UUID REFERENCES profiles(id), -- Link to unified profiles table
    mandate_reference VARCHAR(255) UNIQUE NOT NULL,
    bank_account_id UUID REFERENCES banking_details(id), -- Link to unified banking_details
    mandate_status VARCHAR(50) NOT NULL, -- e.g., 'ACTIVE', 'CANCELLED', 'PENDING'
    mandate_type VARCHAR(50), -- e.g., 'DEBICHECK', 'EFT'
    start_date DATE,
    end_date DATE,
    amount DECIMAL(10,2), -- Max amount for variable mandates
    frequency VARCHAR(50), -- e.g., 'MONTHLY', 'WEEKLY'
    realpay_mandate_id VARCHAR(255), -- RealPay's internal mandate ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- RealPay Instalments Table
CREATE TABLE realpay_instalments (
    instalment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mandate_id UUID REFERENCES realpay_mandates(mandate_id),
    instalment_reference VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    collection_date DATE NOT NULL,
    instalment_status VARCHAR(50) NOT NULL, -- e.g., 'SUCCESS', 'FAILED', 'PENDING'
    realpay_instalment_id VARCHAR(255), -- RealPay's internal instalment ID
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- RealPay Callback Logs (Webhooks)
CREATE TABLE realpay_callbacks (
    callback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES realpay_configs(config_id),
    mandate_id UUID REFERENCES realpay_mandates(mandate_id),
    instalment_id UUID REFERENCES realpay_instalments(instalment_id),
    x_callback_header VARCHAR(100) NOT NULL, -- e.g., 'MANDATE', 'INSTALMENT'
    x_hmac_header TEXT NOT NULL,
    x_beneficiary_user_header VARCHAR(255),
    payload JSONB NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) -- e.g., 'processed', 'failed', 'pending'
);

-- RealPay Pricing Configuration Table
CREATE TABLE realpay_pricing_configs (
    pricing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID REFERENCES realpay_configs(config_id),
    service_type VARCHAR(100) NOT NULL, -- e.g., 'EnDO', 'Payouts', 'VAS'
    fee_type VARCHAR(100) NOT NULL, -- e.g., 'monthly_fee', 'transaction_fee', 'once_off_fee'
    min_transactions INTEGER,
    max_transactions INTEGER,
    amount DECIMAL(10,2),
    percentage DECIMAL(5,4),
    unit_cost DECIMAL(10,2),
    description TEXT,
    effective_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_realpay_mandates_customer ON realpay_mandates(customer_id);
CREATE INDEX idx_realpay_mandates_reference ON realpay_mandates(mandate_reference);
CREATE INDEX idx_realpay_instalments_mandate ON realpay_instalments(mandate_id);
CREATE INDEX idx_realpay_instalments_reference ON realpay_instalments(instalment_reference);
CREATE INDEX idx_realpay_callbacks_mandate ON realpay_callbacks(mandate_id);
CREATE INDEX idx_realpay_callbacks_instalment ON realpay_callbacks(instalment_id);

-- Add updated_at triggers (assuming update_updated_at_column() function exists)
CREATE TRIGGER update_realpay_configs_updated_at
BEFORE UPDATE ON realpay_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realpay_mandates_updated_at
BEFORE UPDATE ON realpay_mandates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realpay_instalments_updated_at
BEFORE UPDATE ON realpay_instalments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_realpay_pricing_configs_updated_at
BEFORE UPDATE ON realpay_pricing_configs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
