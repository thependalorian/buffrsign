-- Unified Notification System Tables
-- This file establishes a comprehensive system for handling notifications (email, SMS, push).

-- Notification Type Enum
CREATE TYPE notification_type AS ENUM (
    'email',
    'sms',
    'push',
    'in_app'
);

-- Notification Status Enum
CREATE TYPE notification_status AS ENUM (
    'queued',
    'sent',
    'delivered',
    'failed',
    'opened',
    'clicked'
);

-- Notification Templates Table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type notification_type NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    variables JSONB, -- For template variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Notification Queue Table
CREATE TABLE notification_queue (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES notification_templates(id),
    type notification_type NOT NULL,
    status notification_status NOT NULL DEFAULT 'queued',
    recipient TEXT NOT NULL, -- Email address, phone number, or device token
    payload JSONB, -- For template variable values
    send_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- User Notification Preferences (already created in 00_unified_core_tables.sql, but shown here for context)
-- CREATE TABLE user_preferences (
--     user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
--     email_notifications BOOLEAN DEFAULT TRUE,
--     sms_notifications BOOLEAN DEFAULT FALSE,
--     push_notifications BOOLEAN DEFAULT TRUE,
--     updated_at TIMESTAMP WITH TIME ZONE
-- );

-- Notification Analytics Table
CREATE TABLE notification_analytics (
    notification_id BIGINT PRIMARY KEY REFERENCES notification_queue(id) ON DELETE CASCADE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT
);

-- Add Triggers for updated_at
CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_queue_updated_at
BEFORE UPDATE ON notification_queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_send_at ON notification_queue(send_at);
CREATE INDEX idx_notification_queue_user_id ON notification_queue(user_id);
