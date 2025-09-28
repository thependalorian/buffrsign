-- Create notification_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type_enum') THEN
        CREATE TYPE notification_type_enum AS ENUM (
            'email',
            'sms',
            'in_app',
            'push',
            'webhook'
        );
    END IF;
END $$;

-- Create notification_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_status_enum') THEN
        CREATE TYPE notification_status_enum AS ENUM (
            'pending',
            'sent',
            'delivered',
            'failed',
            'read',
            'clicked',
            'cancelled'
        );
    END IF;
END $$;

-- Create email_provider_enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_provider_enum') THEN
        CREATE TYPE email_provider_enum AS ENUM (
            'sendgrid',
            'ses',
            'mailgun',
            'other'
        );
    END IF;
END $$;

-- Unified Notification Templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    type notification_type_enum NOT NULL,
    subject TEXT, -- For email/sms
    body TEXT NOT NULL, -- Template content (HTML for email, plain text for SMS/in-app)
    variables JSONB DEFAULT '{}'::jsonb, -- Expected variables for the template
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Notification Queue
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_address TEXT NOT NULL, -- Email, phone number, or user ID for in-app
    type notification_type_enum NOT NULL,
    status notification_status_enum DEFAULT 'pending'::notification_status_enum,
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Dynamic data for template rendering
    priority INTEGER DEFAULT 0, -- Higher number means higher priority
    retries INTEGER DEFAULT 0,
    last_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}'::jsonb, -- Granular preferences for specific notification types
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Delivery Logs
CREATE TABLE IF NOT EXISTS public.email_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID REFERENCES public.notification_queue(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    provider email_provider_enum,
    provider_message_id TEXT,
    event_type TEXT, -- e.g., 'processed', 'deferred', 'delivered', 'bounce', 'open', 'click'
    event_data JSONB DEFAULT '{}'::jsonb, -- Raw webhook data from provider
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Provider Configuration (e.g., SendGrid API keys)
CREATE TABLE IF NOT EXISTS public.email_provider_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_name email_provider_enum UNIQUE NOT NULL,
    api_key_encrypted TEXT NOT NULL, -- Encrypted API key
    sender_email TEXT NOT NULL,
    sender_name TEXT,
    settings JSONB DEFAULT '{}'::jsonb, -- Provider-specific settings
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Webhook Management for Email Providers
CREATE TABLE IF NOT EXISTS public.email_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider email_provider_enum NOT NULL,
    webhook_url TEXT NOT NULL,
    secret_key_encrypted TEXT, -- For webhook signature verification
    events TEXT[] DEFAULT '{}'::TEXT[], -- Events to listen for (e.g., 'delivered', 'opened', 'clicked')
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Analytics
CREATE TABLE IF NOT EXISTS public.email_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE SET NULL,
    template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_failed INTEGER DEFAULT 0,
    unique_opens INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    report_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Suppression List
CREATE TABLE IF NOT EXISTS public.email_suppression_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    reason TEXT, -- e.g., 'bounced', 'complaint', 'unsubscribed'
    suppressed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- For temporary suppressions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Email Reputation Monitoring
CREATE TABLE IF NOT EXISTS public.email_reputation_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider email_provider_enum NOT NULL,
    metric_name TEXT NOT NULL, -- e.g., 'bounce_rate', 'spam_complaint_rate', 'delivery_rate'
    metric_value DECIMAL(5,2),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up RLS for all new tables (example for notification_templates, others similar)
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read notification templates" ON public.notification_templates FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admins to manage notification templates" ON public.notification_templates FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read their own notification queue" ON public.notification_queue FOR SELECT USING (auth.uid() = recipient_id);
CREATE POLICY "Allow admins to manage notification queue" ON public.notification_queue FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read their own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.email_delivery_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view email delivery logs" ON public.email_delivery_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to read their own email campaigns" ON public.email_campaigns FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Allow admins to manage email campaigns" ON public.email_campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_provider_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage email provider config" ON public.email_provider_config FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage email webhooks" ON public.email_webhooks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view email analytics" ON public.email_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_suppression_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage email suppression list" ON public.email_suppression_list FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.email_reputation_monitoring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view email reputation monitoring" ON public.email_reputation_monitoring FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
