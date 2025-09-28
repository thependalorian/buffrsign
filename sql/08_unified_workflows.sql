-- Unified Workflow Management System Tables
-- This file establishes a generic framework for defining and executing automated workflows.

-- Workflow Status Enum
CREATE TYPE workflow_status AS ENUM (
    'draft',
    'active',
    'inactive',
    'archived'
);

-- Workflow Execution Status Enum
CREATE TYPE workflow_execution_status AS ENUM (
    'running',
    'completed',
    'failed',
    'paused',
    'canceled'
);

-- Workflow Step Type Enum
CREATE TYPE workflow_step_type AS ENUM (
    'trigger',
    'action',
    'delay',
    'condition'
);

-- Workflow Definitions Table
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status workflow_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Workflow Steps Table
CREATE TABLE workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    step_type workflow_step_type NOT NULL,
    step_order INTEGER NOT NULL,
    configuration JSONB NOT NULL, -- e.g., for trigger conditions, action parameters
    next_step_id UUID REFERENCES workflow_steps(id),
    failure_step_id UUID REFERENCES workflow_steps(id)
);

-- Workflow Executions Table
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
    status workflow_execution_status NOT NULL DEFAULT 'running',
    triggered_by TEXT, -- e.g., user_id, system_event, webhook
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    context JSONB -- For passing data between steps
);

-- Workflow Execution Logs Table
CREATE TABLE workflow_execution_logs (
    id BIGSERIAL PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES workflow_steps(id),
    status VARCHAR(50) NOT NULL, -- e.g., success, failure
    log_message TEXT,
    output_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Triggers for updated_at
CREATE TRIGGER update_workflow_definitions_updated_at
BEFORE UPDATE ON workflow_definitions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_workflow_steps_workflow_id ON workflow_steps(workflow_id);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_execution_logs_execution_id ON workflow_execution_logs(execution_id);
