-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector_search_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vector_search_type_enum') THEN
        CREATE TYPE vector_search_type_enum AS ENUM (
            'document_content',
            'image_features',
            'audio_features',
            'user_query',
            'product_description',
            'other'
        );
    END IF;
END $$;

-- Unified Vector Embeddings table
CREATE TABLE IF NOT EXISTS public.vector_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_table TEXT NOT NULL, -- e.g., 'documents', 'products', 'users'
    source_id TEXT NOT NULL, -- ID of the record in the source table
    embedding VECTOR(1536) NOT NULL, -- Assuming OpenAI's text-embedding-ada-002 dimension
    search_type vector_search_type_enum DEFAULT 'document_content'::vector_search_type_enum,
    metadata JSONB DEFAULT '{}'::jsonb, -- Additional context or filters for search
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for efficient vector search (using HNSW or IVFFlat)
-- Note: Index creation can be time-consuming for large tables.
-- Consider creating it after initial data load or in a separate migration.
-- Example for HNSW:
-- CREATE INDEX ON public.vector_embeddings USING hnsw (embedding vector_l2_ops);
-- Example for IVFFlat:
-- CREATE INDEX ON public.vector_embeddings USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- Unified Full-Text Search Index (for traditional keyword search)
-- This table will store pre-processed text for full-text search
CREATE TABLE IF NOT EXISTS public.full_text_search_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_table TEXT NOT NULL,
    source_id TEXT NOT NULL,
    document_tsv TSVECTOR NOT NULL, -- Text Search Vector
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_full_text_search_document_tsv ON public.full_text_search_index USING GIN (document_tsv);

-- Function to update the full_text_search_index table
CREATE OR REPLACE FUNCTION public.update_full_text_search_index()
RETURNS TRIGGER AS $$
BEGIN
    -- Example: Assuming 'documents' table has a 'content' column
    -- This function needs to be adapted for each source table and its relevant text columns
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        INSERT INTO public.full_text_search_index (source_table, source_id, document_tsv)
        VALUES (
            TG_TABLE_NAME,
            NEW.id,
            to_tsvector('english', NEW.content) -- Replace 'content' with the actual text column
        )
        ON CONFLICT (source_id) DO UPDATE SET
            document_tsv = to_tsvector('english', NEW.content),
            updated_at = NOW();
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.full_text_search_index WHERE source_table = TG_TABLE_NAME AND source_id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Example trigger for the 'documents' table (this would be created in the documents migration or separately)
-- CREATE TRIGGER documents_full_text_search_trigger
-- AFTER INSERT OR UPDATE OR DELETE ON public.documents
-- FOR EACH ROW EXECUTE FUNCTION public.update_full_text_search_index();


-- Set up RLS for all new tables
ALTER TABLE public.vector_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read vector embeddings" ON public.vector_embeddings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage vector embeddings" ON public.vector_embeddings FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.full_text_search_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read full text search index" ON public.full_text_search_index FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage full text search index" ON public.full_text_search_index FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
