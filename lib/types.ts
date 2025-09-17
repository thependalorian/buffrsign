// BuffrSign Platform - Comprehensive Type Definitions
// Based on Python backend models and requirements

// ============================================================================
// CORE TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export enum UserRole {
  INDIVIDUAL = 'individual',
  SME_BUSINESS = 'sme_business',
  ADMIN = 'admin',           // Employee administrators
  SUPER_ADMIN = 'super_admin' // Founders only
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  UNDER_REVIEW = 'under_review'
}

export enum VerificationLevel {
  BASIC = 'basic',
  ENHANCED = 'enhanced',
  FULL = 'full'
}

export interface UserProfile extends BaseEntity {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  role: UserRole;
  kyc_status: KYCStatus;
  verification_level: VerificationLevel;
  phone_number?: string;
  address?: Address;
  avatar_url?: string;
  preferences: UserPreferences;
  security_settings: SecuritySettings;
  plan: SubscriptionPlan;
  is_active: boolean;
  last_login?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  document_updates: boolean;
  signature_requests: boolean;
  compliance_alerts: boolean;
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private' | 'business_only';
  data_sharing: boolean;
  analytics_consent: boolean;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number; // minutes
  password_expiry_days: number;
  login_attempts_limit: number;
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise'
}

// ============================================================================
// KYC & DOCUMENT TYPES
// ============================================================================

export interface KYCData {
  identity_documents: {
    id_card: Document;
    passport?: Document;
    drivers_license?: Document;
  };
  financial_documents: {
    bank_statements: Document[];
    payslips: Document[];
  };
  employment_verification: {
    employer_details: EmployerInfo;
    verification_status: VerificationStatus;
  };
  consent: {
    employment_verification: boolean;
    terms_and_conditions: boolean;
    data_processing: boolean;
  };
}

export interface Document extends BaseEntity {
  user_id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  file_url: string;
  file_size: number;
  mime_type: string;
  content_hash: string;
  metadata: DocumentMetadata;
  ai_analysis?: DocumentAnalysis;
  signature_fields: SignatureField[];
  compliance_score?: number;
  risk_indicators?: string[];
}

export enum DocumentType {
  IDENTITY = 'identity',
  FINANCIAL = 'financial',
  LEGAL = 'legal',
  CONTRACT = 'contract',
  AGREEMENT = 'agreement',
  INVOICE = 'invoice',
  RECEIPT = 'receipt',
  OTHER = 'other'
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  REJECTED = 'rejected'
}

export interface DocumentMetadata {
  page_count: number;
  language: string;
  created_by: string;
  tags: string[];
  description?: string;
  expiry_date?: string;
}

export interface DocumentAnalysis {
  document_type: string;
  confidence: number;
  extracted_fields: ExtractedField[];
  compliance_score: number;
  risk_assessment: RiskAssessment;
  recommendations: Recommendation[];
  signature_locations: SignatureLocation[];
  ai_insights: AIInsight[];
}

export interface ExtractedField {
  name: string;
  value: string;
  confidence: number;
  location: FieldLocation;
  field_type: FieldType;
}

export interface FieldLocation {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum FieldType {
  TEXT = 'text',
  SIGNATURE = 'signature',
  DATE = 'date',
  NUMBER = 'number',
  EMAIL = 'email',
  PHONE = 'phone',
  ADDRESS = 'address'
}

export interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high';
  risk_factors: RiskFactor[];
  risk_score: number;
  recommendations: string[];
}

export interface RiskFactor {
  factor: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
}

export interface Recommendation {
  type: 'security' | 'compliance' | 'efficiency' | 'user_experience';
  priority: 'low' | 'medium' | 'high';
  description: string;
  action_required: boolean;
}

export interface SignatureLocation {
  field_name: string;
  location: FieldLocation;
  required: boolean;
  signer_role?: string;
  placeholder_text?: string;
}

export interface AIInsight {
  category: string;
  insight: string;
  confidence: number;
  actionable: boolean;
  related_fields: string[];
}

// ============================================================================
// SIGNATURE & WORKFLOW TYPES
// ============================================================================

export interface Signature extends BaseEntity {
  document_id: string;
  signer_id: string;
  field_name: string;
  signature_data: SignatureData;
  signature_type: SignatureType;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  verification_status: SignatureVerificationStatus;
  certificate_info?: DigitalCertificate;
}

export interface SignatureData {
  image_url?: string;
  digital_signature?: string;
  biometric_data?: BiometricData;
  verification_hash: string;
}

export enum SignatureType {
  ELECTRONIC = 'electronic',
  DIGITAL = 'digital',
  BIOMETRIC = 'biometric',
  HANDWRITTEN = 'handwritten'
}

export enum SignatureVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface DigitalCertificate {
  issuer: string;
  serial_number: string;
  valid_from: string;
  valid_until: string;
  public_key: string;
  certificate_chain: string[];
}

export interface BiometricData {
  type: 'fingerprint' | 'face' | 'voice';
  data_hash: string;
  device_id: string;
  timestamp: string;
}

export interface SignatureWorkflow extends BaseEntity {
  document_id: string;
  initiator_id: string;
  participants: WorkflowParticipant[];
  current_step: string;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  metadata: WorkflowMetadata;
  audit_trail: AuditEvent[];
}

export interface WorkflowParticipant {
  user_id: string;
  role: ParticipantRole;
  order: number;
  status: ParticipantStatus;
  signed_at?: string;
  signature_id?: string;
}

export enum ParticipantRole {
  INITIATOR = 'initiator',
  SIGNER = 'signer',
  APPROVER = 'approver',
  WITNESS = 'witness',
  REVIEWER = 'reviewer'
}

export enum ParticipantStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  participants: string[];
  order: number;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  next_steps: string[];
  timeout_hours?: number;
}

export enum StepType {
  SIGNATURE = 'signature',
  APPROVAL = 'approval',
  REVIEW = 'review',
  NOTIFICATION = 'notification',
  CONDITIONAL = 'conditional',
  HUMAN_REVIEW = 'human_review'
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean | null;
  logical_operator?: 'and' | 'or';
}

export interface WorkflowAction {
  type: 'send_notification' | 'update_status' | 'trigger_webhook' | 'create_audit_log';
  parameters: Record<string, unknown>;
}

export interface WorkflowMetadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[];
  description?: string;
  estimated_completion_time?: number; // hours
  reminder_settings: ReminderSettings;
}

export interface ReminderSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  custom_hours?: number;
  max_reminders: number;
}

// ============================================================================
// ADMIN & PERMISSION TYPES
// ============================================================================

export interface AdminUser extends UserProfile {
  admin_level: AdminLevel;
  permissions: AdminPermissions;
  departments: string[];
  created_by: string;
  last_activity: string;
}

export enum AdminLevel {
  SUPER_ADMIN = 'super_admin', // Founders - Full platform control
  ADMIN = 'admin'              // Employees - Limited administrative access
}

export interface AdminPermissions {
  level: AdminLevel;
  departments: string[];
  user_management: UserManagementPermissions;
  document_management: DocumentManagementPermissions;
  compliance_management: CompliancePermissions;
  analytics_access: AnalyticsPermissions;
  system_management: SystemManagementPermissions;
}

export interface UserManagementPermissions {
  create_users: boolean;
  delete_users: boolean;
  modify_user_profiles: boolean;
  view_all_users: boolean;
  // Super Admin only permissions
  create_admins: boolean;        // Only SUPER_ADMIN can create other admins
  delete_admins: boolean;        // Only SUPER_ADMIN can delete admins
  modify_admin_permissions: boolean; // Only SUPER_ADMIN can modify admin permissions
}

export interface DocumentManagementPermissions {
  view_all_documents: boolean;
  modify_documents: boolean;
  delete_documents: boolean;
  approve_documents: boolean;
  access_audit_logs: boolean;
}

export interface CompliancePermissions {
  view_compliance_reports: boolean;
  modify_compliance_settings: boolean;
  approve_compliance_actions: boolean;
  access_regulatory_data: boolean;
}

export interface AnalyticsPermissions {
  view_business_analytics: boolean;
  export_reports: boolean;
  access_user_analytics: boolean;
  view_system_metrics: boolean;
}

export interface SystemManagementPermissions {
  platform_configuration: boolean;
  security_settings: boolean;
  compliance_settings: boolean;
  system_monitoring: boolean;
  feature_flags: boolean;
  pricing_configuration: boolean;
}

// ============================================================================
// AUDIT & COMPLIANCE TYPES
// ============================================================================

export interface AuditEvent extends BaseEntity {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  session_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  compliance_related: boolean;
}

export interface ComplianceReport extends BaseEntity {
  report_type: ComplianceReportType;
  period: string;
  status: ComplianceStatus;
  findings: ComplianceFinding[];
  recommendations: string[];
  generated_by: string;
  reviewed_by?: string;
  review_date?: string;
}

export enum ComplianceReportType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  INCIDENT = 'incident',
  AUDIT = 'audit'
}

export enum ComplianceStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_ACTION = 'requires_action'
}

export interface ComplianceFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  impact: string;
  remediation: string;
  due_date?: string;
  assigned_to?: string;
}

// ============================================================================
// AI & ML TYPES
// ============================================================================

export interface AIAnalysisRequest {
  document_id: string;
  analysis_type: AnalysisType[];
  priority: 'low' | 'medium' | 'high';
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export enum AnalysisType {
  DOCUMENT_CLASSIFICATION = 'document_classification',
  FIELD_EXTRACTION = 'field_extraction',
  SIGNATURE_DETECTION = 'signature_detection',
  COMPLIANCE_CHECK = 'compliance_check',
  RISK_ASSESSMENT = 'risk_assessment',
  CONTENT_SUMMARY = 'content_summary'
}

export interface AIAnalysisResult {
  request_id: string;
  document_id: string;
  analysis_type: AnalysisType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: DocumentAnalysis;
  error?: string;
  processing_time?: number;
  confidence_score?: number;
  created_at: string;
  completed_at?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  request_id?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: string;
    supabase: string;
    storage: string;
    ai_services: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface Address {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface EmployerInfo {
  name: string;
  address: Address;
  phone: string;
  email: string;
  verification_status: VerificationStatus;
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

export interface SignatureField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  location: FieldLocation;
  placeholder_text?: string;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'custom';
  value: string | number | boolean | RegExp | null;
  message: string;
}

// ============================================================================
// ENVIRONMENT & CONFIG TYPES
// ============================================================================

export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
  OPENAI_API_KEY: string;
  LLAMAINDEX_ENABLED: boolean;
  LANGGRAPH_ENABLED: boolean;
  REDIS_URL?: string;
  RATE_LIMIT_REQUESTS: number;
  RATE_LIMIT_WINDOW: number;
}


