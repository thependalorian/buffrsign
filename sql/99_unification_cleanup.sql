-- Unification Cleanup for buffrsign-starter
-- This script removes tables and types that are now handled by the shared unified schema.

-- Drop tables from 19-workflow_management.sql
DROP TABLE IF EXISTS workflow_step_executions CASCADE;
DROP TABLE IF EXISTS workflow_instances CASCADE;
DROP TABLE IF EXISTS workflow_steps CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TYPE IF EXISTS workflow_instance_status;
DROP TYPE IF EXISTS workflow_step_type;
DROP TYPE IF EXISTS workflow_status;

-- Drop tables from 12-audit_logging.sql
DROP TABLE IF EXISTS audit_trail CASCADE;
DROP TYPE IF EXISTS audit_event_type;

-- Drop tables from 6-ai_analysis_kyc.sql
DROP TABLE IF EXISTS user_kyc_status CASCADE;
DROP TABLE IF EXISTS ai_confidence_metrics CASCADE;
DROP TABLE IF EXISTS document_ai_analysis CASCADE;
DROP TABLE IF EXISTS ai_model_metrics CASCADE;
DROP TABLE IF EXISTS kyc_analysis_steps CASCADE;
DROP TABLE IF EXISTS kyc_workflows CASCADE;
DROP TABLE IF EXISTS sadc_countries CASCADE;
DROP TYPE IF EXISTS compliance_level;
DROP TYPE IF EXISTS kyc_status;
DROP TYPE IF EXISTS metric_quality;
DROP TYPE IF EXISTS analysis_step_status;
DROP TYPE IF EXISTS ai_method;
DROP TYPE IF EXISTS kyc_decision;
DROP TYPE IF EXISTS kyc_workflow_state;

-- Drop tables from 3-documents_signatures.sql
DROP TABLE IF EXISTS document_fields CASCADE;
DROP TABLE IF EXISTS document_recipients CASCADE;
DROP TABLE IF EXISTS signatures CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TYPE IF EXISTS field_type;
DROP TYPE IF EXISTS signature_status;
DROP TYPE IF EXISTS signature_type;
DROP TYPE IF EXISTS document_status;

-- Drop tables from 1-user_profiles_requests.sql
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS subscription_plan;
DROP TYPE IF EXISTS user_status;
DROP TYPE IF EXISTS user_roles;
