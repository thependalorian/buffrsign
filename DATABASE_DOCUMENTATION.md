# BuffrSign Database Documentation

## Overview

This document provides comprehensive documentation of the BuffrSign database structure, relationships, authentication, triggers, and AI-powered features. The database is built on Supabase (PostgreSQL) and includes advanced AI integration for document processing, KYC workflows, and compliance management.

## Database Architecture

### Core Tables

#### 1. **users** - Main User Table
- **Purpose**: Primary user authentication and basic profile data
- **Key Fields**:
  - `id`: UUID primary key
  - `email`: Unique email address
  - `full_name`, `first_name`, `last_name`: User identification
  - `account_type`: 'individual' | 'business' | 'enterprise' | 'government'
  - `role`: 'user' | 'admin' | 'super_admin'
  - `is_verified`, `is_active`: Account status flags
  - `namibian_id`: National ID for KYC
  - `company_name`: Business information
  - `password_hash`: Encrypted password
  - `last_login_at`: Authentication tracking

#### 2. **profiles** - Extended User Profile
- **Purpose**: Detailed user preferences, permissions, and settings
- **Key Fields**:
  - `id`: References auth.users.id (one-to-one)
  - `avatar_url`: Profile picture
  - `language`, `timezone`, `theme`: User preferences
  - `email_notifications`, `sms_notifications`: Communication settings
  - `two_factor_enabled`: Security settings
  - **Permission Flags**:
    - `can_view_dashboard`
    - `can_manage_users`
    - `can_manage_documents`
    - `can_manage_compliance`
    - `can_view_analytics`
    - `can_manage_settings`
    - `can_access_admin_panel`
    - `can_manage_super_admins`
    - `can_manage_kyc`
    - `can_manage_templates`

#### 3. **documents** - Document Management
- **Purpose**: Core document storage and metadata
- **Key Fields**:
  - `id`: UUID primary key
  - `title`: Document name
  - `file_path`: Storage location
  - `file_hash`: Content integrity verification
  - `file_size`, `mime_type`: File metadata
  - `created_by`: User reference
  - `status`: Document workflow status
  - `expires_at`: Document expiration
  - **AI Integration**:
    - `ai_analysis_enabled`: AI processing flag
    - `ai_analysis_status`: Processing status
    - `ai_analysis_id`: Reference to AI analysis results
    - `compliance_analysis_id`: Compliance analysis reference
  - **KYC Integration**:
    - `is_kyc_document`: KYC document flag
    - `kyc_workflow_id`: KYC workflow reference
    - `kyc_document_type`: Document classification
  - `document_type`, `industry`, `jurisdiction`: Classification

#### 4. **signatures** - Digital Signatures
- **Purpose**: Signature collection and verification
- **Key Fields**:
  - `id`: UUID primary key
  - `document_id`: Document reference
  - `recipient_id`: Signer reference
  - `signature_type`: Signature method
  - `signature_data`: Encrypted signature data
  - `certificate_id`: Digital certificate reference
  - `ip_address`, `user_agent`: Security tracking
  - `timestamp_token`: Cryptographic timestamp
  - **AI Features**:
    - `ai_detected`: AI field detection flag
    - `signature_field_id`: Detected field reference
    - `ai_confidence_score`: AI confidence rating
    - `ai_analysis_method`: AI method used
    - `ai_quality_assessment`: Quality metrics
  - **Compliance**:
    - `compliance_verified`: Compliance status
    - `eta_compliance_status`: ETA 2019 compliance

#### 5. **recipients** - Document Recipients
- **Purpose**: Manage document sharing and signing workflow
- **Key Fields**:
  - `id`: UUID primary key
  - `document_id`: Document reference
  - `email`, `full_name`: Recipient information
  - `role`: 'signer' | 'approver' | 'witness' | 'reviewer'
  - `signing_order`: Sequential signing order
  - `status`: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'expired'
  - `viewed_at`, `signed_at`: Activity tracking

### AI-Powered Tables

#### 6. **ai_analysis** - AI Document Analysis
- **Purpose**: Store AI-powered document analysis results
- **Key Fields**:
  - `id`: UUID primary key
  - `document_id`: Document reference
  - `analysis_type`: Analysis category
  - `document_summary`: AI-generated summary
  - `key_clauses`: Extracted legal clauses
  - `signature_fields`: Detected signature locations
  - `compliance_score`: 0-100 compliance rating
  - `eta_compliance`: ETA 2019 compliance data
  - `recommendations`: AI suggestions
  - `risk_assessment`: Risk analysis
  - **AI Methods**:
    - `primary_ocr_method`: Primary AI method used
    - `fallback_methods`: Backup methods
    - `confidence_scores`: Method confidence ratings
  - **Quality Metrics**:
    - `image_quality_score`: Document quality
    - `text_clarity_score`: Text readability
    - `overall_quality_score`: Combined quality
    - `processing_time_ms`: Performance metrics

#### 7. **kyc_workflows** - KYC Processing
- **Purpose**: AI-powered KYC verification workflows
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `document_id`: KYC document reference
  - `workflow_state`: Current processing state
  - `detected_country`: AI-detected country
  - `country_confidence`: Detection confidence
  - `country_detection_method`: AI method used
  - `final_decision`: 'approved' | 'rejected' | 'pending' | 'requires_review'
  - `decision_confidence`: Decision confidence score
  - `rejection_reasons`: Rejection details
  - `processing_time_ms`: Performance tracking
  - `total_confidence`: Overall confidence score
  - **Processing Data**:
    - `ocr_extraction`: OCR results
    - `ai_field_extraction`: AI field extraction
    - `sadc_validation`: SADC compliance validation
    - `compliance_status`: Compliance results
    - `audit_trail`: Complete processing history

#### 8. **ai_insights** - AI-Generated Insights
- **Purpose**: Store AI insights and recommendations
- **Key Fields**:
  - `id`: UUID primary key
  - `document_id`: Document reference
  - `insight_type`: Insight category
  - `key_points`: Main insights
  - `risk_factors`: Identified risks
  - `optimization_suggestions`: Improvement recommendations
  - `compliance_gaps`: Compliance issues
  - `signature_recommendations`: Signature suggestions
  - `confidence_scores`: Insight confidence ratings

### Compliance & Security Tables

#### 9. **eta_compliance** - ETA 2019 Compliance
- **Purpose**: ETA 2019 compliance tracking
- **Key Fields**:
  - `id`: UUID primary key
  - `document_id`, `signature_id`: References
  - `compliance_type`: Compliance category
  - `compliance_status`: Current status
  - `compliance_score`: 0-100 score
  - `risk_level`: 'low' | 'medium' | 'high' | 'critical'
  - `verification_data`: Compliance verification
  - `recommendations`: Improvement suggestions
  - `remediation_required`: Action required flag
  - `verified_by`: Verifier reference
  - `verified_at`: Verification timestamp

#### 10. **cran_accreditation** - CRAN Accreditation
- **Purpose**: CRAN accreditation management
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `accreditation_type`: Accreditation category
  - `status`: 'pending' | 'approved' | 'rejected' | 'expired'
  - `application_date`: Application timestamp
  - `approval_date`: Approval timestamp
  - `expiry_date`: Expiration date
  - `certificate_number`: Certificate reference
  - `compliance_score`: Compliance rating
  - `audit_results`: Audit data

#### 11. **security_events** - Security Monitoring
- **Purpose**: Security event tracking and monitoring
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `event_type`: Security event category
  - `event_data`: Event details
  - `ip_address`, `user_agent`: Request metadata
  - `risk_score`: Risk assessment (0-100)
  - `is_suspicious`: Suspicious activity flag

### Audit & Monitoring Tables

#### 12. **audit_trail** - Complete Audit Logging
- **Purpose**: Comprehensive audit trail for compliance
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `document_id`: Document reference (optional)
  - `action`: Action performed
  - `details`: Action details (JSON)
  - `ip_address`, `user_agent`: Request metadata
  - `ai_related`: AI operation flag
  - `ai_workflow_id`: AI workflow reference
  - `ai_insight_id`: AI insight reference

#### 13. **performance_metrics** - System Performance
- **Purpose**: AI and system performance monitoring
- **Key Fields**:
  - `id`: UUID primary key
  - `metric_name`: Metric identifier
  - `metric_value`: Metric value
  - `metric_type`: 'counter' | 'gauge' | 'histogram' | 'timing'
  - `user_id`, `document_id`, `workflow_id`: Context references
  - `ai_method`: AI method used
  - `processing_context`: Processing details
  - `tags`: Additional metadata

### Template & Workflow Tables

#### 14. **templates** - Document Templates
- **Purpose**: Reusable document templates
- **Key Fields**:
  - `id`: UUID primary key
  - `name`: Template name
  - `description`: Template description
  - `category`: Template category
  - `file_path`: Template file location
  - `fields`: Template field definitions (JSON)
  - `created_by`: Creator reference
  - `is_public`: Public template flag
  - `is_ai_generated`: AI-generated flag
  - `ai_template_id`: AI template reference
  - `template_type`, `industry`, `jurisdiction`: Classification
  - `compliance_metadata`: Compliance information
  - `signature_field_specs`: Signature field specifications

#### 15. **ai_templates** - AI-Generated Templates
- **Purpose**: AI-generated document templates
- **Key Fields**:
  - `id`: UUID primary key
  - `name`: Template name
  - `description`: Template description
  - `template_type`: Template category
  - `industry`: Industry context
  - `template_content`: Template content
  - `signature_fields`: Signature field definitions
  - `compliance_status`: Compliance information
  - `customization_options`: Customization settings
  - `legal_notes`: Legal considerations
  - `jurisdiction`: Legal jurisdiction
  - `is_ai_generated`: AI generation flag

### Subscription & Billing Tables

#### 16. **subscription_plans** - Available Plans
- **Purpose**: Subscription plan definitions
- **Key Fields**:
  - `id`: UUID primary key
  - `name`: Plan name
  - `description`: Plan description
  - `price_monthly`, `price_yearly`: Pricing
  - `document_limit`: Document usage limit
  - `user_limit`: User limit
  - `features`: Plan features (JSON)
  - `is_active`: Active plan flag

#### 17. **user_subscriptions** - User Subscriptions
- **Purpose**: User subscription management
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `plan_id`: Plan reference
  - `status`: 'active' | 'cancelled' | 'expired' | 'suspended'
  - `start_date`, `end_date`: Subscription period
  - `auto_renew`: Auto-renewal flag
  - `payment_method`: Payment method
  - `stripe_subscription_id`: Stripe integration

### Notification & Communication Tables

#### 18. **notifications** - User Notifications
- **Purpose**: User notification management
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `type`: Notification type
  - `title`: Notification title
  - `message`: Notification message
  - `data`: Additional data (JSON)
  - `is_read`: Read status
  - `read_at`: Read timestamp

### Supporting Tables

#### 19. **sadc_countries** - SADC Country Data
- **Purpose**: SADC country reference data for KYC
- **Key Fields**:
  - `id`: UUID primary key
  - `country_code`: ISO country code
  - `country_name`: Country name
  - `id_format`: ID format description
  - `id_patterns`: ID validation patterns
  - `date_format`: Date format
  - `keywords`: Country-specific keywords
  - `validation_rules`: Validation rules (JSON)
  - `is_active`: Active country flag

#### 20. **digital_certificates** - Digital Certificates
- **Purpose**: Digital certificate management
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: User reference
  - `certificate_type`: Certificate type
  - `public_key`: Public key
  - `private_key_encrypted`: Encrypted private key
  - `certificate_data`: Certificate details (JSON)
  - `issued_at`, `expires_at`: Validity period
  - `is_revoked`: Revocation status
  - `revocation_reason`: Revocation reason

## Database Relationships

### Primary Relationships

1. **users ↔ profiles**: One-to-one relationship via `profiles.id = auth.users.id`
2. **users ↔ documents**: One-to-many via `documents.created_by = users.id`
3. **documents ↔ signatures**: One-to-many via `signatures.document_id = documents.id`
4. **documents ↔ recipients**: One-to-many via `recipients.document_id = documents.id`
5. **documents ↔ ai_analysis**: One-to-one via `documents.ai_analysis_id = ai_analysis.id`
6. **users ↔ kyc_workflows**: One-to-many via `kyc_workflows.user_id = users.id`
7. **users ↔ user_subscriptions**: One-to-many via `user_subscriptions.user_id = users.id`

### AI Integration Relationships

1. **documents ↔ ai_analysis**: AI analysis results
2. **documents ↔ ai_insights**: AI-generated insights
3. **documents ↔ ai_workflows**: AI workflow processing
4. **kyc_workflows ↔ ai_analysis**: KYC AI analysis
5. **signatures ↔ ai_analysis**: AI signature analysis

### Compliance Relationships

1. **documents ↔ eta_compliance**: ETA 2019 compliance
2. **signatures ↔ eta_compliance**: Signature compliance
3. **users ↔ cran_accreditation**: CRAN accreditation
4. **users ↔ security_events**: Security monitoring

## Authentication & Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

1. **Users can view/update their own data**
2. **Admins can view all data in their scope**
3. **Super admins have full access**
4. **Public data is accessible to authenticated users**

### Authentication Flow

1. **User Registration**: Creates entry in `auth.users` and `profiles`
2. **Profile Creation**: Automatic profile creation via trigger
3. **Permission Assignment**: Role-based permissions via trigger
4. **Session Management**: JWT tokens with Redis session backup

### Security Features

1. **Password Hashing**: bcrypt with salt
2. **JWT Blacklisting**: Token revocation support
3. **Rate Limiting**: API rate limiting with Redis
4. **Audit Logging**: Complete action tracking
5. **Security Events**: Suspicious activity monitoring
6. **Two-Factor Authentication**: TOTP support

## AI Integration Architecture

### AI Methods Supported

1. **gpt4_vision**: OpenAI GPT-4 Vision for document analysis
2. **google_vision**: Google Vision API for OCR
3. **azure_vision**: Azure Computer Vision
4. **pytesseract_fallback**: Tesseract OCR fallback
5. **pydantic_ai_agent**: Pydantic AI for structured extraction
6. **openai_structured**: OpenAI structured outputs
7. **ai_agent_manager**: AI agent orchestration
8. **regex_fallback**: Regex pattern matching

### AI Workflow States

1. **initialized**: Workflow started
2. **document_uploaded**: Document received
3. **ocr_extraction_complete**: OCR processing done
4. **ai_country_detection**: Country detection complete
5. **ai_field_extraction**: Field extraction complete
6. **sadc_validation**: SADC compliance validation
7. **compliance_checked**: Compliance verification done
8. **auto_approved**: Automatically approved
9. **auto_rejected**: Automatically rejected
10. **completed**: Workflow complete
11. **failed**: Workflow failed

### KYC Decision States

1. **approved**: KYC approved
2. **rejected**: KYC rejected
3. **pending**: Awaiting processing
4. **requires_review**: Manual review needed

## Database Functions & Triggers

### Key Functions

1. **handle_new_user()**: Automatic profile creation on user signup
2. **set_user_permissions()**: Role-based permission assignment
3. **update_last_login()**: Login timestamp tracking
4. **log_user_activity()**: Activity logging
5. **log_realtime_event()**: Real-time event logging
6. **get_user_document_stats()**: User statistics
7. **get_document_audit_trail()**: Document audit history

### Triggers

1. **on_auth_user_created**: Creates profile on user signup
2. **set_permissions_trigger**: Sets permissions based on role
3. **on_user_login**: Updates last login timestamp

## Performance Optimization

### Indexes

1. **Primary Keys**: All tables have UUID primary keys
2. **Foreign Keys**: Indexed for join performance
3. **Search Fields**: Email, names, and status fields indexed
4. **Timestamp Fields**: Created/updated timestamps indexed

### Caching Strategy

1. **Redis Integration**: Session and cache data
2. **Query Optimization**: Optimized for common queries
3. **Connection Pooling**: Efficient connection management

## Compliance & Regulatory

### ETA 2019 Compliance

- Digital signature validation
- Audit trail maintenance
- Certificate management
- Compliance scoring

### CRAN Accreditation

- Accreditation tracking
- Compliance monitoring
- Audit result storage
- Certificate management

### Data Protection

- GDPR compliance features
- Data retention policies
- User consent tracking
- Privacy settings management

## Monitoring & Analytics

### Performance Metrics

- AI processing times
- System performance
- User activity tracking
- Error rate monitoring

### Business Intelligence

- User engagement metrics
- Document processing statistics
- Compliance trend analysis
- Revenue tracking

## Backup & Recovery

### Data Protection

- Automated backups
- Point-in-time recovery
- Cross-region replication
- Disaster recovery procedures

### Security

- Encrypted backups
- Access control
- Audit logging
- Compliance reporting

## API Integration

### Supabase Integration

- Real-time subscriptions
- Row Level Security
- Edge Functions
- Storage integration

### External APIs

- OpenAI integration
- Google Vision API
- Azure Computer Vision
- Stripe payment processing

## Development & Maintenance

### Schema Management

- Migration system
- Version control
- Rollback procedures
- Environment management

### Testing

- Unit tests
- Integration tests
- Performance tests
- Security tests

This database architecture provides a robust, scalable, and AI-powered foundation for the BuffrSign digital signature platform, with comprehensive compliance, security, and monitoring capabilities.
