-- JWT Tables Migration for BuffrSign
-- This migration creates tables for JWT token management

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    jti TEXT NOT NULL UNIQUE, -- JWT ID for tracking
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    device_info JSONB, -- Store device information for security
    ip_address INET,
    user_agent TEXT
);

-- Create blacklisted_tokens table
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    jti TEXT NOT NULL UNIQUE, -- JWT ID
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    token_type TEXT NOT NULL CHECK (token_type IN ('access', 'refresh', 'api', 'session', 'document', 'signature')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason TEXT, -- Reason for blacklisting (logout, security, etc.)
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create token_audit_log table for security monitoring
CREATE TABLE IF NOT EXISTS token_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'refresh', 'revoke', 'blacklist', 'verify_failed', 'document_access', 'signature_access')),
    token_type TEXT,
    jti TEXT,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- Additional context information (document_id, signature_id, etc.)
);

-- Create documents table (if not exists)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'archived', 'deleted')),
    shared_with UUID[] DEFAULT '{}', -- Array of user IDs who have access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    signed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);

-- Create signatures table (if not exists)
CREATE TABLE IF NOT EXISTS signatures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
    signer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'declined', 'expired')),
    signature_data JSONB, -- Store signature coordinates, image, etc.
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_jti ON blacklisted_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_user_id ON blacklisted_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_token_type ON blacklisted_tokens(token_type);

CREATE INDEX IF NOT EXISTS idx_token_audit_log_user_id ON token_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_token_audit_log_action ON token_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_token_audit_log_created_at ON token_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_token_audit_log_success ON token_audit_log(success);

CREATE INDEX IF NOT EXISTS idx_documents_owner_id ON documents(owner_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_shared_with ON documents USING GIN(shared_with);

CREATE INDEX IF NOT EXISTS idx_signatures_document_id ON signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_signer_id ON signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON signatures(status);

-- Enable Row Level Security (RLS)
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE blacklisted_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for refresh_tokens
CREATE POLICY "Users can view own refresh tokens" ON refresh_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own refresh tokens" ON refresh_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own refresh tokens" ON refresh_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own refresh tokens" ON refresh_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for blacklisted_tokens
CREATE POLICY "Users can view own blacklisted tokens" ON blacklisted_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage blacklisted tokens" ON blacklisted_tokens
    FOR ALL USING (true); -- Allow system operations

-- Create RLS policies for token_audit_log
CREATE POLICY "Users can view own audit logs" ON token_audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON token_audit_log
    FOR INSERT WITH CHECK (true); -- Allow system to log all actions

-- Create RLS policies for documents
CREATE POLICY "Users can view own documents" ON documents
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared documents" ON documents
    FOR SELECT USING (auth.uid() = ANY(shared_with));

CREATE POLICY "Users can insert own documents" ON documents
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own documents" ON documents
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own documents" ON documents
    FOR DELETE USING (auth.uid() = owner_id);

-- Create RLS policies for signatures
CREATE POLICY "Users can view signatures for their documents" ON signatures
    FOR SELECT USING (
        auth.uid() = signer_id OR 
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = signatures.document_id 
            AND documents.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert signatures for their documents" ON signatures
    FOR INSERT WITH CHECK (
        auth.uid() = signer_id OR 
        EXISTS (
            SELECT 1 FROM documents 
            WHERE documents.id = signatures.document_id 
            AND documents.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own signatures" ON signatures
    FOR UPDATE USING (auth.uid() = signer_id);

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW() OR is_revoked = TRUE;
    
    -- Delete expired blacklisted tokens
    DELETE FROM blacklisted_tokens 
    WHERE expires_at < NOW();
    
    -- Clean up old audit logs (keep last 90 days)
    DELETE FROM token_audit_log 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Clean up expired signatures
    UPDATE signatures 
    SET status = 'expired' 
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to revoke all user tokens
CREATE OR REPLACE FUNCTION revoke_all_user_tokens(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Revoke all refresh tokens for user
    UPDATE refresh_tokens 
    SET is_revoked = TRUE, revoked_at = NOW() 
    WHERE user_id = target_user_id AND is_revoked = FALSE;
    
    -- Log the action
    INSERT INTO token_audit_log (user_id, action, success, metadata)
    VALUES (target_user_id, 'revoke', TRUE, jsonb_build_object('reason', 'bulk_revoke'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log token actions
CREATE OR REPLACE FUNCTION log_token_action(
    p_user_id UUID,
    p_action TEXT,
    p_token_type TEXT DEFAULT NULL,
    p_jti TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO token_audit_log (
        user_id, 
        action, 
        token_type, 
        jti, 
        success, 
        error_message, 
        metadata
    ) VALUES (
        p_user_id, 
        p_action, 
        p_token_type, 
        p_jti, 
        p_success, 
        p_error_message, 
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check document access
CREATE OR REPLACE FUNCTION check_document_access(
    p_user_id UUID,
    p_document_id UUID,
    p_required_permission TEXT DEFAULT 'read'
)
RETURNS BOOLEAN AS $$
DECLARE
    document_owner UUID;
    shared_users UUID[];
BEGIN
    -- Get document owner and shared users
    SELECT owner_id, shared_with 
    INTO document_owner, shared_users
    FROM documents 
    WHERE id = p_document_id;
    
    -- Check if user is owner
    IF document_owner = p_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is in shared_with list
    IF p_user_id = ANY(shared_users) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check signature access
CREATE OR REPLACE FUNCTION check_signature_access(
    p_user_id UUID,
    p_signature_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    signature_signer UUID;
    document_owner UUID;
BEGIN
    -- Get signature signer and document owner
    SELECT s.signer_id, d.owner_id
    INTO signature_signer, document_owner
    FROM signatures s
    JOIN documents d ON s.document_id = d.id
    WHERE s.id = p_signature_id;
    
    -- Check if user is the signer
    IF signature_signer = p_user_id THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user is the document owner
    IF document_owner = p_user_id THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refresh_tokens_updated_at
    BEFORE UPDATE ON refresh_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signatures_updated_at
    BEFORE UPDATE ON signatures
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON refresh_tokens TO authenticated;
GRANT ALL ON blacklisted_tokens TO authenticated;
GRANT ALL ON token_audit_log TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON signatures TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_tokens() TO authenticated;
GRANT EXECUTE ON FUNCTION revoke_all_user_tokens(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION log_token_action(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION check_document_access(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION check_signature_access(UUID, UUID) TO authenticated;

-- Create a scheduled job to clean up expired tokens (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-expired-tokens', '0 2 * * *', 'SELECT cleanup_expired_tokens();');
