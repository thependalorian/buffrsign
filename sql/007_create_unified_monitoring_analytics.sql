-- Create metric_type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_type_enum') THEN
        CREATE TYPE metric_type_enum AS ENUM (
            'cpu_usage',
            'memory_usage',
            'disk_usage',
            'network_io',
            'api_response_time',
            'error_rate',
            'latency',
            'throughput',
            'database_connections',
            'queue_depth',
            'custom'
        );
    END IF;
END $$;

-- Create health_check_status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'health_check_status_enum') THEN
        CREATE TYPE health_check_status_enum AS ENUM (
            'healthy',
            'unhealthy',
            'degraded',
            'unknown'
        );
    END IF;
END $$;

-- Unified System Metrics table
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT NOT NULL,
    host_id TEXT, -- Identifier for the host/instance
    metric_type metric_type_enum NOT NULL,
    metric_value DECIMAL(10,4) NOT NULL,
    unit TEXT, -- e.g., '%', 'MB', 'ms', 'req/s'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Unified Performance Logs table
CREATE TABLE IF NOT EXISTS public.performance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT NOT NULL,
    endpoint TEXT, -- e.g., '/api/v1/users'
    method TEXT, -- e.g., 'GET', 'POST'
    response_time_ms INTEGER,
    status_code INTEGER,
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Unified Health Checks table
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name TEXT NOT NULL,
    check_name TEXT NOT NULL, -- e.g., 'database_connection', 'redis_status', 'api_liveness'
    status health_check_status_enum NOT NULL,
    message TEXT,
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),
    next_check_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Set up RLS for all new tables (only admins can view)
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view system metrics" ON public.system_metrics FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.performance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view performance logs" ON public.performance_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));

ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow admins to view health checks" ON public.health_checks FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_role = 'admin'));
