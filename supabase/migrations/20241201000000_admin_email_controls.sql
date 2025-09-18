-- Admin Email Controls Migration for BuffrSign
-- Founder: George Nekwaya (george@buffr.ai +12065308433)

-- Create manual email requests table
CREATE TABLE IF NOT EXISTS manual_email_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL,
    recipients JSONB NOT NULL,
    subject TEXT NOT NULL,
    content JSONB NOT NULL,
    scheduled_for TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'normal',
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    conflicts JSONB DEFAULT '[]',
    approver_id VARCHAR(255),
    approver_name VARCHAR(255),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(255),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin email activity log table
CREATE TABLE IF NOT EXISTS admin_email_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email queue table (if not exists)
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content JSONB NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    priority INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    last_attempt TIMESTAMPTZ,
    error_message TEXT,
    is_manual BOOLEAN DEFAULT FALSE,
    manual_request_id UUID REFERENCES manual_email_requests(id),
    admin_id VARCHAR(255),
    document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_manual_email_requests_status ON manual_email_requests(status);
CREATE INDEX IF NOT EXISTS idx_manual_email_requests_admin_id ON manual_email_requests(admin_id);
CREATE INDEX IF NOT EXISTS idx_manual_email_requests_created_at ON manual_email_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_manual_email_requests_scheduled_for ON manual_email_requests(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_manual_email_requests_email_type ON manual_email_requests(email_type);

CREATE INDEX IF NOT EXISTS idx_admin_email_activity_admin_id ON admin_email_activity(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_email_activity_created_at ON admin_email_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_email_activity_action ON admin_email_activity(action);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled_for ON email_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority);
CREATE INDEX IF NOT EXISTS idx_email_queue_is_manual ON email_queue(is_manual);
CREATE INDEX IF NOT EXISTS idx_email_queue_manual_request_id ON email_queue(manual_request_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_document_id ON email_queue(document_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_manual_email_requests_updated_at ON manual_email_requests;
CREATE TRIGGER update_manual_email_requests_updated_at
    BEFORE UPDATE ON manual_email_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at
    BEFORE UPDATE ON email_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE manual_email_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Manual email requests policies
CREATE POLICY "Admins can view all manual email requests" ON manual_email_requests
    FOR SELECT USING (true);

CREATE POLICY "Admins can insert manual email requests" ON manual_email_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update manual email requests" ON manual_email_requests
    FOR UPDATE USING (true);

-- Admin email activity policies
CREATE POLICY "Admins can view all admin email activity" ON admin_email_activity
    FOR SELECT USING (true);

CREATE POLICY "System can insert admin email activity" ON admin_email_activity
    FOR INSERT WITH CHECK (true);

-- Email queue policies
CREATE POLICY "Admins can view all email queue items" ON email_queue
    FOR SELECT USING (true);

CREATE POLICY "System can insert email queue items" ON email_queue
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email queue items" ON email_queue
    FOR UPDATE USING (true);

-- Create function to check document-specific email conflicts
CREATE OR REPLACE FUNCTION check_document_email_conflicts(
    document_id UUID,
    email_type VARCHAR(50),
    recipient_emails TEXT[]
)
RETURNS TABLE (
    conflict_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    recommendation TEXT,
    document_status VARCHAR(50)
) AS $$
BEGIN
    -- Check document status conflicts
    RETURN QUERY
    SELECT 
        'document_status'::VARCHAR(50) as conflict_type,
        CASE 
            WHEN d.status = 'completed' AND email_type = 'document_invitation' THEN 'high'::VARCHAR(20)
            WHEN d.status = 'draft' AND email_type = 'signature_reminder' THEN 'high'::VARCHAR(20)
            WHEN d.status = 'expired' AND email_type IN ('document_invitation', 'signature_reminder') THEN 'critical'::VARCHAR(20)
            ELSE 'low'::VARCHAR(20)
        END as severity,
        ('Document status: ' || d.status || ' conflicts with email type: ' || email_type)::TEXT as message,
        CASE 
            WHEN d.status = 'completed' AND email_type = 'document_invitation' THEN 'Consider sending completion notification instead'::TEXT
            WHEN d.status = 'draft' AND email_type = 'signature_reminder' THEN 'Wait for document to be sent before sending reminders'::TEXT
            WHEN d.status = 'expired' AND email_type IN ('document_invitation', 'signature_reminder') THEN 'Send document expired notification instead'::TEXT
            ELSE 'No specific recommendation'::TEXT
        END as recommendation,
        d.status as document_status
    FROM documents d
    WHERE d.id = document_id
    AND (
        (d.status = 'completed' AND email_type = 'document_invitation') OR
        (d.status = 'draft' AND email_type = 'signature_reminder') OR
        (d.status = 'expired' AND email_type IN ('document_invitation', 'signature_reminder'))
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to check signature workflow conflicts
CREATE OR REPLACE FUNCTION check_signature_workflow_conflicts(
    recipient_emails TEXT[],
    email_type VARCHAR(50)
)
RETURNS TABLE (
    conflict_type VARCHAR(50),
    severity VARCHAR(20),
    message TEXT,
    recommendation TEXT,
    affected_email VARCHAR(255),
    document_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'signature_workflow'::VARCHAR(50) as conflict_type,
        CASE 
            WHEN ds.status = 'signed' AND email_type = 'signature_reminder' THEN 'medium'::VARCHAR(20)
            WHEN ds.status = 'declined' AND email_type IN ('document_invitation', 'signature_reminder') THEN 'high'::VARCHAR(20)
            ELSE 'low'::VARCHAR(20)
        END as severity,
        ('Recipient ' || ds.signer_email || ' has ' || ds.status || ' the document')::TEXT as message,
        CASE 
            WHEN ds.status = 'signed' AND email_type = 'signature_reminder' THEN 'Remove signed recipients from reminder list'::TEXT
            WHEN ds.status = 'declined' AND email_type IN ('document_invitation', 'signature_reminder') THEN 'Do not send invitation or reminder to declined signers'::TEXT
            ELSE 'No specific recommendation'::TEXT
        END as recommendation,
        ds.signer_email as affected_email,
        ds.document_id
    FROM document_signatures ds
    WHERE ds.signer_email = ANY(recipient_emails)
    AND (
        (ds.status = 'signed' AND email_type = 'signature_reminder') OR
        (ds.status = 'declined' AND email_type IN ('document_invitation', 'signature_reminder'))
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to process email queue
CREATE OR REPLACE FUNCTION process_email_queue(batch_size INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    email_type VARCHAR(50),
    recipient_email VARCHAR(255),
    subject TEXT,
    content JSONB,
    priority INTEGER,
    attempts INTEGER,
    document_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        eq.id,
        eq.email_type,
        eq.recipient_email,
        eq.subject,
        eq.content,
        eq.priority,
        eq.attempts,
        eq.document_id
    FROM email_queue eq
    WHERE eq.status = 'queued'
    AND eq.scheduled_for <= NOW()
    AND eq.attempts < 3
    ORDER BY eq.priority ASC, eq.created_at ASC
    LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

-- Create function to update email queue item status
CREATE OR REPLACE FUNCTION update_email_queue_status(
    queue_id UUID,
    new_status VARCHAR(20),
    error_msg TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE email_queue 
    SET 
        status = new_status,
        attempts = attempts + 1,
        last_attempt = NOW(),
        error_message = error_msg,
        updated_at = NOW()
    WHERE id = queue_id;
END;
$$ LANGUAGE plpgsql;

-- Create view for document email conflict monitoring
CREATE OR REPLACE VIEW document_email_conflict_monitoring AS
SELECT 
    mer.id,
    mer.admin_name,
    mer.email_type,
    mer.subject,
    mer.status,
    mer.created_at,
    jsonb_array_length(mer.conflicts) as conflict_count,
    CASE 
        WHEN jsonb_array_length(mer.conflicts) = 0 THEN 'none'
        WHEN jsonb_array_length(mer.conflicts) <= 2 THEN 'low'
        WHEN jsonb_array_length(mer.conflicts) <= 5 THEN 'medium'
        ELSE 'high'
    END as conflict_severity,
    mer.recipients->>'documentId' as document_id
FROM manual_email_requests mer
WHERE mer.status IN ('pending', 'approved')
AND mer.recipients ? 'documentId'
ORDER BY mer.created_at DESC;

-- Create view for email queue monitoring
CREATE OR REPLACE VIEW email_queue_monitoring AS
SELECT 
    status,
    is_manual,
    COUNT(*) as count,
    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/60) as avg_wait_minutes
FROM email_queue
GROUP BY status, is_manual
ORDER BY status, is_manual;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON manual_email_requests TO authenticated;
GRANT SELECT, INSERT ON admin_email_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_queue TO authenticated;
GRANT SELECT ON document_email_conflict_monitoring TO authenticated;
GRANT SELECT ON email_queue_monitoring TO authenticated;
GRANT EXECUTE ON FUNCTION check_document_email_conflicts TO authenticated;
GRANT EXECUTE ON FUNCTION check_signature_workflow_conflicts TO authenticated;
GRANT EXECUTE ON FUNCTION process_email_queue TO authenticated;
GRANT EXECUTE ON FUNCTION update_email_queue_status TO authenticated;

-- Add comments
COMMENT ON TABLE manual_email_requests IS 'Stores manual email requests submitted by admins with document-specific conflict detection';
COMMENT ON TABLE admin_email_activity IS 'Logs all admin email-related actions for audit purposes';
COMMENT ON TABLE email_queue IS 'Queue for both manual and automated emails with priority and retry logic';
COMMENT ON VIEW document_email_conflict_monitoring IS 'Monitoring view for document-specific email conflicts in manual requests';
COMMENT ON VIEW email_queue_monitoring IS 'Monitoring view for email queue status and performance';
