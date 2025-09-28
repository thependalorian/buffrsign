-- Unified Row-Level Security (RLS) Policies
-- This file defines a comprehensive set of RLS policies for the unified schema.

-- Enable RLS on all relevant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's ID
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN (SELECT auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if a user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_id = org_id AND organization_members.user_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies for 'users' table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = auth.current_user_id());
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = auth.current_user_id());

-- RLS Policies for 'profiles' table
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (id = auth.current_user_id());
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.current_user_id());

-- RLS Policies for 'user_preferences' table
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (user_id = auth.current_user_id());

-- RLS Policies for 'organizations' table
CREATE POLICY "Organization members can view their organization" ON organizations
    FOR SELECT USING (is_org_member(id, auth.current_user_id()));
CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (owner_id = auth.current_user_id());

-- RLS Policies for 'organization_members' table
CREATE POLICY "Organization members can view other members" ON organization_members
    FOR SELECT USING (is_org_member(organization_id, auth.current_user_id()));
CREATE POLICY "Organization owners can manage members" ON organization_members
    FOR ALL USING (
        (SELECT owner_id FROM organizations WHERE id = organization_id) = auth.current_user_id()
    );

-- RLS Policies for 'subscriptions' table
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "Organization members can view their organization's subscription" ON subscriptions
    FOR SELECT USING (is_org_member(organization_id, auth.current_user_id()));

-- RLS Policies for 'audit_logs' table
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.current_user_id());
CREATE POLICY "Organization members can view their organization's audit logs" ON audit_logs
    FOR SELECT USING (is_org_member(organization_id, auth.current_user_id()));

-- RLS Policies for 'kyc_workflows' table
CREATE POLICY "Users can manage their own KYC workflows" ON kyc_workflows
    FOR ALL USING (user_id = auth.current_user_id());

-- RLS Policies for 'documents' table
CREATE POLICY "Users can manage their own documents" ON documents
    FOR ALL USING (user_id = auth.current_user_id());
CREATE POLICY "Organization members can view their organization's documents" ON documents
    FOR SELECT USING (is_org_member(organization_id, auth.current_user_id()));

-- Grant usage on helper functions
GRANT EXECUTE ON FUNCTION auth.current_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_member(UUID, UUID) TO authenticated;
