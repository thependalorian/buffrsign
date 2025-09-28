-- Unified Monitoring and Analytics Tables
-- This file establishes a system for monitoring system health and performance.

-- Health Check Status Enum
CREATE TYPE health_check_status AS ENUM (
    'healthy',
    'unhealthy',
    'degraded'
);

-- System Metrics Table
CREATE TABLE system_metrics (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API Performance Logs Table
CREATE TABLE api_performance_logs (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    user_id UUID REFERENCES users(id),
    ip_address INET,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Checks Table
CREATE TABLE health_checks (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) UNIQUE NOT NULL,
    status health_check_status NOT NULL,
    details JSONB,
    last_checked_at TIMESTAMP WITH TIME ZONE
);

-- Error Logs Table
CREATE TABLE error_logs (
    id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    details JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_system_metrics_service_metric ON system_metrics(service_name, metric_name);
CREATE INDEX idx_api_performance_logs_timestamp ON api_performance_logs(timestamp);
CREATE INDEX idx_api_performance_logs_endpoint ON api_performance_logs(endpoint);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp);
CREATE INDEX idx_error_logs_service_name ON error_logs(service_name);
