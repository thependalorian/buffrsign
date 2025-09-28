# BuffrSign Database Schema - Modular SQL Migrations

This directory contains modular SQL migration files for the BuffrSign platform, organized by functional areas for easy maintenance and deployment.

## 📁 File Structure

```
sql/
├── 0-all-tables.sql              # Complete table definitions
├── 1-user_profiles_requests.sql  # User management functions
├── 2-user_profiles_requests_rls.sql # User RLS policies
├── 3-documents_signatures.sql    # Document & signature functions
├── 4-documents_signatures_rls.sql # Document RLS policies
├── 5-email_system.sql           # Email system functions
├── 6-ai_analysis_kyc.sql        # AI analysis & KYC functions
├── 7-background_tasks_redis.sql # Background tasks & Redis
├── 8-execute_sql_rpc.sql        # SQL execution & monitoring
├── 9-rag_pipeline_state.sql     # RAG pipeline management
├── 10-validation_rules.sql      # Data validation & integrity
├── 11-rate_limiting.sql         # Rate limiting & throttling
├── 12-audit_logging.sql         # Audit logging & system activity
├── 13-sendgrid_configuration.sql # SendGrid email services
├── 14-google_oauth_integration.sql # Google OAuth integration
├── 15-sendgrid_webhooks.sql     # SendGrid webhooks & email tracking
├── 16-email_analytics.sql      # Comprehensive email analytics
├── 17-notification_system.sql  # Notification system & in-app notifications
├── 18-team_management.sql      # Team collaboration & user roles
├── 19-workflow_management.sql  # Document workflow automation
└── README.md                     # This file
```

## 🚀 Deployment Order

Execute the files in numerical order for proper dependency resolution:

1. **0-all-tables.sql** - Creates all tables, types, and basic structure
2. **1-user_profiles_requests.sql** - User management functions and triggers
3. **2-user_profiles_requests_rls.sql** - User security policies
4. **3-documents_signatures.sql** - Document processing functions
5. **4-documents_signatures_rls.sql** - Document security policies
6. **5-email_system.sql** - Email system functions
7. **6-ai_analysis_kyc.sql** - AI analysis and KYC workflows
8. **7-background_tasks_redis.sql** - Background processing
9. **8-execute_sql_rpc.sql** - Database monitoring and utilities
10. **9-rag_pipeline_state.sql** - RAG pipeline management

## 📋 File Descriptions

### 0-all-tables.sql
- **Purpose**: Complete database schema with all tables, types, and indexes
- **Contains**: 
  - Custom types and enums (user_role, ai_method, kyc_workflow_state, etc.)
  - Core tables (profiles, documents, signatures, etc.)
  - AI/ML tables (ai_analysis, kyc_workflows, etc.)
  - Email system tables (email_notifications, templates, etc.)
  - Performance and monitoring tables
  - Indexes for optimal performance

### 1-user_profiles_requests.sql
- **Purpose**: User profile management and authentication functions
- **Contains**:
  - `handle_new_user()` - Creates user profiles on signup
  - `set_user_permissions()` - Sets permissions based on role
  - `update_last_login()` - Updates login timestamps
  - `create_default_email_preferences()` - Sets up email preferences
  - User analytics functions
  - Triggers for user management

### 2-user_profiles_requests_rls.sql
- **Purpose**: Row Level Security policies for user data
- **Contains**:
  - RLS policies for profiles, user_activities, notifications
  - Helper functions for permission checking
  - Security functions (is_admin, has_permission, etc.)

### 3-documents_signatures.sql
- **Purpose**: Document management and signature processing
- **Contains**:
  - Document audit trail functions
  - Signature validation and compliance checking
  - Document workflow management
  - Signature workflow completion
  - Activity logging triggers

### 4-documents_signatures_rls.sql
- **Purpose**: Security policies for documents and signatures
- **Contains**:
  - RLS policies for documents, recipients, signatures
  - Document access control (creators, recipients, admins)
  - Helper functions for document permissions

### 5-email_system.sql
- **Purpose**: Email system management and queue processing
- **Contains**:
  - Email template management
  - Email queue processing
  - Notification sending functions
  - Email analytics and reporting
  - Conflict detection for email workflows

### 6-ai_analysis_kyc.sql
- **Purpose**: AI analysis and KYC workflow management
- **Contains**:
  - AI analysis creation and updates
  - KYC workflow state management
  - KYC analysis steps tracking
  - User KYC status management
  - AI confidence metrics recording

### 7-background_tasks_redis.sql
- **Purpose**: Background task processing and Redis session management
- **Contains**:
  - Background task queue management
  - Redis session handling
  - JWT blacklist management
  - Realtime event logging
  - Rate limiting functions
  - Cache metadata management

### 8-execute_sql_rpc.sql
- **Purpose**: Database monitoring and SQL execution utilities
- **Contains**:
  - Secure SQL execution functions
  - Database statistics and monitoring
  - Performance analysis functions
  - Security audit functions
  - Data export functions

### 9-rag_pipeline_state.sql
- **Purpose**: RAG (Retrieval-Augmented Generation) pipeline management
- **Contains**:
  - RAG pipeline state tracking
  - Document chunking and embeddings
  - Knowledge base management
  - Query processing and analytics
  - Vector search functions

### 10-validation_rules.sql
- **Purpose**: Comprehensive data validation and integrity system
- **Contains**:
  - Email format validation functions
  - Password strength validation
  - Document file validation
  - Signature requirements validation
  - User profile validation
  - Custom validation rules engine
  - Validation results tracking
  - Document-specific validation rules
  - Automatic validation triggers

### 11-rate_limiting.sql
- **Purpose**: Advanced rate limiting and throttling system
- **Contains**:
  - Configurable rate limiting rules
  - Real-time counter tracking
  - Violation tracking and blocking
  - User/IP exemptions
  - Document upload rate limiting
  - Signature request rate limiting
  - Email sending rate limiting
  - Login attempt protection
  - Automatic cleanup of expired data

### 12-audit_logging.sql
- **Purpose**: Comprehensive audit logging and system activity tracking
- **Contains**:
  - Database operation audit trails
  - System activity logging
  - User action tracking
  - Security event logging
  - API call monitoring
  - Email and document processing logs
  - Audit configuration management
  - Automatic cleanup of old logs

### 13-sendgrid_configuration.sql
- **Purpose**: SendGrid email service configuration and management
- **Contains**:
  - SendGrid API configuration
  - Email template management
  - Sender and domain authentication
  - IP pool management
  - Email analytics and tracking
  - Delivery statistics
  - Webhook configuration
  - Rate limiting for email services

### 14-google_oauth_integration.sql
- **Purpose**: Google OAuth integration with user linking and token management
- **Contains**:
  - Google OAuth token storage and management
  - User profile synchronization
  - Session management
  - Event logging and tracking
  - Permission scope management
  - Token refresh and revocation
  - OAuth flow state management

### 15-sendgrid_webhooks.sql
- **Purpose**: SendGrid webhook event tracking and email delivery status
- **Contains**:
  - Webhook event processing
  - Email delivery status tracking
  - Bounce management and suppression
  - Unsubscribe tracking
  - Link and open tracking
  - Event processing functions
  - Delivery statistics

### 16-email_analytics.sql
- **Purpose**: Comprehensive email analytics and performance tracking
- **Contains**:
  - Email analytics summary metrics
  - Campaign performance analytics
  - Template performance tracking
  - Domain and IP analytics
  - Geographic analytics
  - Device and browser analytics
  - Link performance tracking
  - Automated analytics calculation

### 17-notification_system.sql
- **Purpose**: Comprehensive notification system for all communication channels
- **Contains**:
  - Notification templates for email, SMS, push, and in-app
  - Notification queue with priority and scheduling
  - User notification preferences and settings
  - In-app notification system
  - Delivery tracking and analytics
  - Campaign management for bulk notifications
  - Automatic triggers for document signing events
  - Notification cleanup and maintenance

### 18-team_management.sql
- **Purpose**: Team collaboration and user role management
- **Contains**:
  - Team creation and management
  - Team member roles and permissions
  - Team invitation system with tokens
  - Team activity logging and tracking
  - Document sharing permissions
  - Team-based access control
  - Collaboration workflows
  - Team analytics and reporting

### 19-workflow_management.sql
- **Purpose**: Document workflow automation and management
- **Contains**:
  - Workflow definition and templates
  - Workflow steps with conditions and actions
  - Workflow instance execution tracking
  - Step-by-step execution management
  - Workflow templates for reuse
  - Automated workflow triggers
  - Workflow analytics and reporting
  - Team-based workflow collaboration

## 🔧 Key Features

### Security
- **Row Level Security (RLS)** enabled on all sensitive tables
- **Role-based access control** with granular permissions
- **Audit trails** for all critical operations
- **JWT blacklist** for secure session management
- **Data validation** with comprehensive integrity checks
- **Rate limiting** to prevent abuse and ensure fair usage

### Performance
- **Optimized indexes** for common query patterns
- **Background task processing** for heavy operations
- **Redis session management** for scalability
- **Vector search** capabilities for AI features

### AI/ML Integration
- **KYC workflow management** with SADC country support
- **AI analysis tracking** with confidence metrics
- **RAG pipeline** for document understanding
- **Performance monitoring** for AI operations

### Email System
- **Template management** with localization support
- **Queue processing** with retry mechanisms
- **Analytics and reporting** for email performance
- **Conflict detection** for email workflows

## 🛠️ Usage Examples

### Creating a New User
```sql
-- User creation is handled automatically by triggers
-- when a new user signs up through Supabase Auth
```

### Processing a Document
```sql
-- Create document
INSERT INTO documents (title, file_path, file_hash, file_size, mime_type, created_by)
VALUES ('Contract.pdf', '/uploads/contract.pdf', 'abc123', 1024, 'application/pdf', auth.uid());

-- Create recipients
INSERT INTO recipients (document_id, email, full_name, role)
VALUES (document_id, 'signer@example.com', 'John Doe', 'signer');
```

### AI Analysis
```sql
-- Create AI analysis
SELECT create_ai_analysis(document_id, 'comprehensive');

-- Update analysis results
SELECT update_ai_analysis_results(
    analysis_id,
    'Document summary...',
    '{"clauses": [...]}'::JSONB,
    '{"fields": [...]}'::JSONB,
    85,
    '{"eta_compliance": {...}}'::JSONB,
    '{"recommendations": [...]}'::JSONB,
    '{"risk": "low"}'::JSONB,
    '{"confidence": 0.95}'::JSONB,
    1500
);
```

### Email Notifications
```sql
-- Send document invitation
SELECT send_document_invitation(
    document_id,
    'signer@example.com',
    'John Doe',
    'Contract Agreement',
    'Jane Smith'
);

-- Process email queue
SELECT * FROM process_email_queue(10);
```

## 🔍 Monitoring and Analytics

### Database Health
```sql
-- Get database statistics
SELECT * FROM get_database_stats();

-- Get slow queries
SELECT * FROM get_slow_queries(10);

-- Get Redis integration health
SELECT * FROM get_redis_integration_health();
```

### User Analytics
```sql
-- Get user activity analytics
SELECT * FROM get_user_activity_analytics(user_id, 30);

-- Get user document statistics
SELECT * FROM get_user_document_stats(user_id);
```

### AI Performance
```sql
-- Get AI confidence metrics
SELECT * FROM get_ai_confidence_metrics(workflow_id);

-- Get RAG query analytics
SELECT * FROM get_rag_query_analytics(user_id, 30);
```

## 🚨 Important Notes

1. **Execute in Order**: Always run the files in numerical order to avoid dependency issues
2. **Backup First**: Always backup your database before running migrations
3. **Test Environment**: Test all migrations in a development environment first
4. **Permissions**: Ensure the database user has sufficient privileges
5. **Extensions**: Some functions require additional PostgreSQL extensions (pgvector, pg_trgm)

## 🔧 Maintenance

### Regular Cleanup
```sql
-- Cleanup expired sessions
SELECT cleanup_expired_sessions();

-- Cleanup expired JWT blacklist
SELECT cleanup_expired_jwt_blacklist();

-- Cleanup completed pipelines
SELECT cleanup_completed_pipelines(30);

-- Cleanup old query history
SELECT cleanup_old_query_history(90);
```

### Performance Monitoring
```sql
-- Update daily email analytics
SELECT update_daily_email_analytics();

-- Process scheduled reminders
SELECT process_scheduled_reminders();
```

## 📞 Support

For questions or issues with these migrations, please refer to the BuffrSign documentation or contact the development team.

---

**Generated for BuffrSign Platform**  
*Version: 1.0.0*  
*Last Updated: 2025-01-21*
