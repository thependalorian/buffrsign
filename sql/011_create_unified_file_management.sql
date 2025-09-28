-- Create document_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status_enum') THEN
        CREATE TYPE document_status_enum AS ENUM (
            'uploaded',
            'processing',
            'processed',
            'failed',
            'archived',
            'deleted'
        );
    END IF;
END $$;

-- Create document_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type_enum') THEN
        CREATE TYPE document_type_enum AS ENUM (
            'kyc',
            'loan_agreement',
            'contract',
            'invoice',
            'report',
            'other'
        );
    END IF;
END $$;

-- Unified Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in cloud storage (e.g., S3 URL, Google Drive ID)
    file_size_bytes BIGINT,
    mime_type TEXT,
    document_type document_type_enum DEFAULT 'other'::document_type_enum,
    status document_status_enum DEFAULT 'uploaded'::document_status_enum,
    upload_source TEXT, -- e.g., 'web_app', 'google_drive', 'api'
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata (e.g., Google Drive specific fields)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Document Versions table (for tracking changes to documents)
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE (document_id, version_number)
);

-- Unified Document Access Control List (ACL)
CREATE TABLE IF NOT EXISTS public.document_acl (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL, -- e.g., 'read', 'write', 'owner'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (document_id, user_id)
);

-- Set up RLS for all new tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners to manage their documents" ON public.documents FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Allow users with ACL access to read documents" ON public.documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.document_acl WHERE document_id = id AND user_id = auth.uid() AND permission_level IN ('read', 'write', 'owner')));
CREATE POLICY "Allow admins to view all documents" ON public.documents FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners to manage document versions" ON public.document_versions FOR ALL USING (EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid()));
CREATE POLICY "Allow users with ACL access to read document versions" ON public.document_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.document_acl WHERE document_id = document_id AND user_id = auth.uid() AND permission_level IN ('read', 'write', 'owner')));
CREATE POLICY "Allow admins to view all document versions" ON public.document_versions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.document_acl ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow owners to manage document ACL" ON public.document_acl FOR ALL USING (EXISTS (SELECT 1 FROM public.documents WHERE id = document_id AND owner_id = auth.uid()));
CREATE POLICY "Allow admins to manage document ACL" ON public.document_acl FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
