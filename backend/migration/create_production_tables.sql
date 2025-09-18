-- BuffrSign Production Database Schema
-- This file creates all required tables for the production platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    company_name VARCHAR(255),
    account_type VARCHAR(50) DEFAULT 'individual' CHECK (account_type IN ('individual', 'business', 'enterprise', 'government')),
    namibian_id VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_plan VARCHAR(50) DEFAULT 'free' CHECK (subscription_plan IN ('free', 'basic', 'premium', 'enterprise')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    document_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    mime_type VARCHAR(100),
    initiator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_progress', 'completed', 'cancelled', 'expired')),
    compliance_score DECIMAL(3,2) DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    eta_compliant BOOLEAN DEFAULT FALSE,
    cran_accredited BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    -- Enhanced fields for comprehensive implementation
    file_url VARCHAR(500),
    ai_analysis JSONB,
    analysis_status VARCHAR(20) DEFAULT 'pending',
    category VARCHAR(100),
    description TEXT
);

-- Document fields table
CREATE TABLE IF NOT EXISTS public.document_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('signature', 'text', 'date', 'checkbox', 'dropdown')),
    position_x INTEGER,
    position_y INTEGER,
    width INTEGER,
    height INTEGER,
    page_number INTEGER DEFAULT 1,
    is_required BOOLEAN DEFAULT TRUE,
    default_value TEXT,
    validation_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Signatures table
CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.document_fields(id) ON DELETE CASCADE,
    signer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    signature_data TEXT NOT NULL, -- Base64 encoded signature image or data
    signature_type VARCHAR(50) DEFAULT 'electronic' CHECK (signature_type IN ('electronic', 'advanced', 'qualified')),
    signature_method VARCHAR(50) DEFAULT 'draw' CHECK (signature_method IN ('draw', 'type', 'upload', 'biometric')),
    ip_address INET,
    user_agent TEXT,
    location_data JSONB, -- GPS coordinates if available
    device_info JSONB,
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired')),
    verification_score DECIMAL(3,2) DEFAULT 0.0,
    signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Document recipients table
CREATE TABLE IF NOT EXISTS public.document_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'signer' CHECK (role IN ('signer', 'witness', 'approver', 'viewer')),
    signing_order INTEGER DEFAULT 1,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'signed', 'declined', 'expired')),
    invitation_sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    signed_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    decline_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Signature Requests table
CREATE TABLE IF NOT EXISTS public.signature_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    signer_email VARCHAR(255) NOT NULL,
    signature_type VARCHAR(20) DEFAULT 'simple' CHECK (signature_type IN ('simple', 'advanced', 'qualified')),
    message TEXT,
    redirect_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'verified', 'revoked', 'expired')),
    signature_data TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    notification_sent BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Audit Trail table
CREATE TABLE IF NOT EXISTS public.audit_trail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    content TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Compliance Reports table
CREATE TABLE IF NOT EXISTS public.compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    signature_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('eta_2019', 'eidas', 'esign_act', 'comprehensive')),
    compliance_data JSONB NOT NULL,
    generated_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE
);

-- Enhanced Biometric Data table
CREATE TABLE IF NOT EXISTS public.biometric_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    biometric_type VARCHAR(50) NOT NULL CHECK (biometric_type IN ('fingerprint', 'face', 'iris', 'voice', 'keystroke')),
    template_data TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    liveness_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Behavioral Metrics table
CREATE TABLE IF NOT EXISTS public.behavioral_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    keystroke_dynamics JSONB,
    mouse_patterns JSONB,
    interaction_timing JSONB,
    session_duration DECIMAL(10,2),
    risk_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Fraud Detection table
CREATE TABLE IF NOT EXISTS public.fraud_detection (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    fraud_type VARCHAR(50) NOT NULL CHECK (fraud_type IN ('anomaly', 'behavioral', 'biometric', 'network', 'device')),
    risk_score DECIMAL(3,2) NOT NULL,
    confidence_score DECIMAL(3,2),
    detection_data JSONB,
    is_false_positive BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Certificate Management table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    certificate_type VARCHAR(50) NOT NULL CHECK (certificate_type IN ('self_signed', 'ca_issued', 'qualified')),
    certificate_data TEXT NOT NULL,
    private_key_encrypted TEXT,
    hsm_protected BOOLEAN DEFAULT FALSE,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revocation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Time Stamps table
CREATE TABLE IF NOT EXISTS public.time_stamps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    timestamp_data TEXT NOT NULL,
    tsa_url VARCHAR(500),
    tsa_certificate TEXT,
    is_qualified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Long-term Validation (LTV) table
CREATE TABLE IF NOT EXISTS public.ltv_validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    signature_id UUID REFERENCES public.signature_requests(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    archive_timestamp TEXT NOT NULL,
    hash_tree_data JSONB,
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'valid', 'invalid', 'expired')),
    validated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_initiator_id ON public.documents(initiator_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_document_fields_document_id ON public.document_fields(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_document_id ON public.signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_signatures_signer_id ON public.signatures(signer_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_document_id ON public.signature_requests(document_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_requester_id ON public.signature_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_signer_email ON public.signature_requests(signer_email);
CREATE INDEX IF NOT EXISTS idx_audit_trail_signature_id ON public.audit_trail(signature_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_document_id ON public.audit_trail(document_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON public.audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON public.templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_document_id ON public.compliance_reports(document_id);
CREATE INDEX IF NOT EXISTS idx_biometric_data_user_id ON public.biometric_data(user_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_metrics_user_id ON public.behavioral_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_detection_signature_id ON public.fraud_detection(signature_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_time_stamps_signature_id ON public.time_stamps(signature_id);
CREATE INDEX IF NOT EXISTS idx_ltv_validation_signature_id ON public.ltv_validation(signature_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signature_requests_updated_at BEFORE UPDATE ON public.signature_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_biometric_data_updated_at BEFORE UPDATE ON public.biometric_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON public.certificates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioral_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ltv_validation ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view own documents" ON public.documents
    FOR SELECT USING (auth.uid() = initiator_id);

CREATE POLICY "Users can create documents" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() = initiator_id);

CREATE POLICY "Users can update own documents" ON public.documents
    FOR UPDATE USING (auth.uid() = initiator_id);

-- Document fields policies
CREATE POLICY "Users can view document fields" ON public.document_fields
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents 
            WHERE documents.id = document_fields.document_id 
            AND documents.initiator_id = auth.uid()
        )
    );

CREATE POLICY "Users can create document fields" ON public.document_fields
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents 
            WHERE documents.id = document_fields.document_id 
            AND documents.initiator_id = auth.uid()
        )
    );

-- Signatures policies
CREATE POLICY "Users can view signatures" ON public.signatures
    FOR SELECT USING (
        auth.uid() = signer_id OR
        EXISTS (
            SELECT 1 FROM public.documents 
            WHERE documents.id = signatures.document_id 
            AND documents.initiator_id = auth.uid()
        )
    );

CREATE POLICY "Users can create signatures" ON public.signatures
    FOR INSERT WITH CHECK (auth.uid() = signer_id);

-- Document recipients policies
CREATE POLICY "Users can view document recipients" ON public.document_recipients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.documents 
            WHERE documents.id = document_recipients.document_id 
            AND documents.initiator_id = auth.uid()
        )
    );

CREATE POLICY "Users can create document recipients" ON public.document_recipients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.documents 
            WHERE documents.id = document_recipients.document_id 
            AND documents.initiator_id = auth.uid()
        )
    );

-- Signature Requests policies
CREATE POLICY "Users can view own signature requests" ON public.signature_requests
    FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Users can create signature requests" ON public.signature_requests
    FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update own signature requests" ON public.signature_requests
    FOR UPDATE USING (auth.uid() = requester_id);

-- Audit Trail policies
CREATE POLICY "Users can view own audit trails" ON public.audit_trail
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create audit trails" ON public.audit_trail
    FOR INSERT WITH CHECK (true);

-- Templates policies
CREATE POLICY "Users can view templates" ON public.templates
    FOR SELECT USING (public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (auth.uid() = user_id);

-- Compliance Reports policies
CREATE POLICY "Users can view compliance reports" ON public.compliance_reports
    FOR SELECT USING (auth.uid() = generated_by);

CREATE POLICY "Users can create compliance reports" ON public.compliance_reports
    FOR INSERT WITH CHECK (auth.uid() = generated_by);

-- Biometric Data policies
CREATE POLICY "Users can view own biometric data" ON public.biometric_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create biometric data" ON public.biometric_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biometric data" ON public.biometric_data
    FOR UPDATE USING (auth.uid() = user_id);

-- Behavioral Metrics policies
CREATE POLICY "Users can view own behavioral metrics" ON public.behavioral_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create behavioral metrics" ON public.behavioral_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Fraud Detection policies
CREATE POLICY "Users can view fraud detection" ON public.fraud_detection
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create fraud detection" ON public.fraud_detection
    FOR INSERT WITH CHECK (true);

-- Certificates policies
CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create certificates" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own certificates" ON public.certificates
    FOR UPDATE USING (auth.uid() = user_id);

-- Time Stamps policies
CREATE POLICY "Users can view time stamps" ON public.time_stamps
    FOR SELECT USING (
        auth.uid() = (
            SELECT requester_id FROM public.signature_requests 
            WHERE signature_requests.id = time_stamps.signature_id
        )
    );

CREATE POLICY "System can create time stamps" ON public.time_stamps
    FOR INSERT WITH CHECK (true);

-- LTV Validation policies
CREATE POLICY "Users can view LTV validation" ON public.ltv_validation
    FOR SELECT USING (
        auth.uid() = (
            SELECT requester_id FROM public.signature_requests 
            WHERE signature_requests.id = ltv_validation.signature_id
        )
    );

CREATE POLICY "System can create LTV validation" ON public.ltv_validation
    FOR INSERT WITH CHECK (true);
