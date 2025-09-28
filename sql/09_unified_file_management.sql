-- Unified File Management System Tables
-- This file establishes a generic framework for managing documents and files.

-- Document Status Enum
CREATE TYPE document_status AS ENUM (
    'draft',
    'active',
    'archived',
    'deleted'
);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status document_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT user_or_org_document CHECK (
        (user_id IS NOT NULL AND organization_id IS NULL) OR
        (user_id IS NULL AND organization_id IS NOT NULL)
    )
);

-- File Storage Providers Table
CREATE TABLE file_storage_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'supabase_storage', 'google_drive', 's3'
    config JSONB
);

-- File Versions Table
CREATE TABLE file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    storage_provider_id INTEGER NOT NULL REFERENCES file_storage_providers(id),
    storage_metadata JSONB, -- e.g., bucket, region, file_id
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

-- Document Access Table
CREATE TABLE document_access (
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL, -- e.g., 'view', 'edit', 'owner'
    PRIMARY KEY (document_id, user_id)
);

-- Add Triggers for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_file_versions_document_id ON file_versions(document_id);
