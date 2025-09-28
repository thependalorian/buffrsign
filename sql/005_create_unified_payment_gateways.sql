-- Create payment_gateway_enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_gateway_enum') THEN
        CREATE TYPE payment_gateway_enum AS ENUM (
            'realpay',
            'adumo',
            'stripe',
            'buffr_pay',
            'other'
        );
    END IF;
END $$;

-- Create transaction_status_enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status_enum') THEN
        CREATE TYPE transaction_status_enum AS ENUM (
            'pending',
            'successful',
            'failed',
            'refunded',
            'partially_refunded',
            'cancelled',
            'disputed'
        );
    END IF;
END $$;

-- Create transaction_type_enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type_enum') THEN
        CREATE TYPE transaction_type_enum AS ENUM (
            'payment',
            'refund',
            'chargeback',
            'payout',
            'settlement'
        );
    END IF;
END $$;

-- Unified Payment Gateway Configuration
CREATE TABLE IF NOT EXISTS public.payment_gateway_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_name payment_gateway_enum UNIQUE NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    secret_key_encrypted TEXT,
    webhook_secret_encrypted TEXT,
    settings JSONB DEFAULT '{}'::jsonb, -- Gateway-specific settings
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    gateway_id UUID REFERENCES public.payment_gateway_config(id) ON DELETE SET NULL,
    gateway_transaction_id TEXT, -- ID from the payment gateway
    transaction_type transaction_type_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    status transaction_status_enum NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- Gateway-specific details, QR codes, NFC data, credit/risk info
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Payment Webhooks
CREATE TABLE IF NOT EXISTS public.payment_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_id UUID REFERENCES public.payment_gateway_config(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- e.g., 'payment_succeeded', 'payment_failed', 'refund_created'
    payload JSONB NOT NULL, -- Raw webhook payload
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Payment Refunds
CREATE TABLE IF NOT EXISTS public.payment_refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES public.payment_transactions(id) ON DELETE CASCADE,
    gateway_refund_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    reason TEXT,
    status transaction_status_enum NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Payment Settlements
CREATE TABLE IF NOT EXISTS public.payment_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway_id UUID REFERENCES public.payment_gateway_config(id) ON DELETE SET NULL,
    settlement_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL,
    fees DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Set up RLS for all new tables
ALTER TABLE public.payment_gateway_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage payment gateway config" ON public.payment_gateway_config FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own payment transactions" ON public.payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow admins to view all payment transactions" ON public.payment_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to manage payment webhooks" ON public.payment_webhooks FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.payment_refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to view their own payment refunds" ON public.payment_refunds FOR SELECT USING (EXISTS (SELECT 1 FROM public.payment_transactions pt WHERE pt.id = transaction_id AND pt.user_id = auth.uid()));
CREATE POLICY "Allow admins to view all payment refunds" ON public.payment_refunds FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.payment_settlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view payment settlements" ON public.payment_settlements FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
