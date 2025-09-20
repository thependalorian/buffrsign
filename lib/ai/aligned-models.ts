// BuffrSign Platform - Aligned Models
// Ensures consistency between Pydantic/Zod models and database types

import { z } from 'zod';
import { Database } from '../../types/supabase';

// ============================================================================
// BASE VALIDATION SCHEMAS
// ============================================================================

export const BaseValidationSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email(),
  phone: z.string().regex(/^(\+264|0)[0-9]{9}$/, 'Invalid Namibian phone number'),
  namibianId: z.string().regex(/^[0-9]{11}$/, 'Invalid Namibian ID format'),
  currency: z.string().regex(/^\$?[0-9,]+(\.[0-9]{2})?$/, 'Invalid currency format'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  percentage: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  filePath: z.string().min(1).max(500),
  documentType: z.enum([
    'contract', 'agreement', 'invoice', 'receipt', 'identity', 'financial', 'legal', 'other'
  ]),
  userRole: z.enum(['_user', 'admin', 'super_admin']),
  workflowStatus: z.enum([
    'initialized', 'running', 'paused', 'completed', 'failed', 'cancelled'
  ])
};

// ============================================================================
// DATABASE-ALIGNED SCHEMAS
// ============================================================================

// User Schema - aligned with users table
export const UserSchema = z.object({
  id: BaseValidationSchemas.uuid,
  email: BaseValidationSchemas.email,
  phone: BaseValidationSchemas.phone.optional(),
  namibian_id: BaseValidationSchemas.namibianId.optional(),
  role: BaseValidationSchemas.userRole,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),
  is_active: z.boolean(),
  profile: z.object({
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    company: z.string().max(200).optional(),
    position: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    postal_code: z.string().max(20).optional()
  }).optional()
});

// Document Schema - aligned with documents table
export const DocumentSchema = z.object({
  id: BaseValidationSchemas.uuid,
  title: z.string().min(1).max(200),
  content: z.string().optional(),
  document_type: BaseValidationSchemas.documentType,
  file_path: BaseValidationSchemas.filePath,
  file_size: z.number().min(0),
  mime_type: z.string().max(100),
  status: z.enum(['draft', 'pending', 'processing', 'completed', 'failed', 'archived']),
  compliance_score: BaseValidationSchemas.percentage.optional(),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  eta_compliant: z.boolean().optional(),
  cran_accredited: z.boolean().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  user_id: BaseValidationSchemas.uuid,
  ai_analysis: z.record(z.any()).optional(),
  analysis_status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  category: z.string().max(100).optional(),
  description: z.string().max(1000).optional()
});

// Signature Schema - aligned with signatures table
export const SignatureSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  recipient_id: BaseValidationSchemas.uuid,
  signature_type: z.enum(['electronic', 'digital', 'biometric', 'wet_signature']),
  signature_data: z.string(),
  signature_image: z.string().optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().max(500).optional(),
  signed_at: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  status: z.enum(['pending', 'signed', 'declined', 'expired']),
  verification_status: z.enum(['pending', 'verified', 'failed']).optional(),
  certificate_id: BaseValidationSchemas.uuid.optional()
});

// Recipient Schema - aligned with recipients table
export const RecipientSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  email: BaseValidationSchemas.email,
  name: z.string().min(1).max(200),
  role: z.enum(['signer', 'viewer', 'approver', 'cc']),
  order: z.number().min(0),
  status: z.enum(['pending', 'sent', 'viewed', 'signed', 'declined', 'expired']),
  sent_at: z.string().datetime().optional(),
  viewed_at: z.string().datetime().optional(),
  signed_at: z.string().datetime().optional(),
  declined_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  message: z.string().max(1000).optional(),
  authentication_method: z.enum(['email', 'sms', 'id_verification', 'biometric']).optional(),
  phone: BaseValidationSchemas.phone.optional()
});

// Audit Trail Schema - aligned with audit_trail table
export const AuditTrailSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  user_id: BaseValidationSchemas.uuid.optional(),
  action: z.enum([
    'created', 'updated', 'deleted', 'viewed', 'signed', 'declined', 'shared',
    'downloaded', 'printed', 'archived', 'restored', 'compliance_check',
    'ai_analysis', 'workflow_started', 'workflow_completed', 'workflow_failed'
  ]),
  details: z.record(z.any()).optional(),
  ip_address: z.string().ip().optional(),
  user_agent: z.string().max(500).optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional()
});

// Template Schema - aligned with templates table
export const TemplateSchema = z.object({
  id: BaseValidationSchemas.uuid,
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  template_data: z.record(z.any()),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional(),
  is_public: z.boolean(),
  created_by: BaseValidationSchemas.uuid,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  usage_count: z.number().min(0),
  version: z.string().max(20).optional()
});

// KYC Workflow Schema - aligned with kyc_workflows table
export const KYCWorkflowSchema = z.object({
  id: BaseValidationSchemas.uuid,
  user_id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid.optional(),
  workflow_type: z.enum(['individual', 'corporate', 'enhanced', 'simplified']),
  status: BaseValidationSchemas.workflowStatus,
  current_step: z.string().max(100),
  completed_steps: z.array(z.string()),
  required_documents: z.array(z.string()),
  submitted_documents: z.array(z.string()),
  verification_results: z.record(z.any()).optional(),
  risk_score: BaseValidationSchemas.percentage.optional(),
  compliance_status: z.enum(['pending', 'compliant', 'non_compliant', 'requires_review']).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().optional(),
  expires_at: z.string().datetime().optional()
});

// AI Analysis Schema - aligned with ai_analysis table
export const AIAnalysisSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  analysis_type: z.enum([
    'document_classification', 'entity_extraction', 'sentiment_analysis',
    'compliance_check', 'risk_assessment', 'content_summary', 'field_extraction',
    'signature_detection', 'fraud_detection', 'language_detection'
  ]),
  model_name: z.string().max(100),
  model_version: z.string().max(50),
  input_data: z.record(z.any()),
  output_data: z.record(z.any()),
  confidence_score: BaseValidationSchemas.confidence,
  processing_time_ms: z.number().min(0),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  error_message: z.string().max(1000).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// ============================================================================
// WORKFLOW SCHEMAS
// ============================================================================

// Workflow State Schema
export const WorkflowStateSchema = z.object({
  id: BaseValidationSchemas.uuid,
  current_node: z.string().max(100),
  status: BaseValidationSchemas.workflowStatus,
  data: z.record(z.any()),
  history: z.array(z.object({
    id: BaseValidationSchemas.uuid,
    node_id: z.string().max(100),
    action: z.string().max(100),
    input: z.record(z.any()),
    output: z.record(z.any()),
    status: z.enum(['pending', 'running', 'completed', 'failed']),
    error: z.string().max(1000).optional(),
    timestamp: z.string().datetime(),
    duration_ms: z.number().min(0)
  })),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  metadata: z.object({
    workflow_type: z.string().max(100),
    document_id: BaseValidationSchemas.uuid.optional(),
    user_id: BaseValidationSchemas.uuid,
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    estimated_duration_minutes: z.number().min(0),
    tags: z.array(z.string())
  })
});

// ============================================================================
// COMPLIANCE SCHEMAS
// ============================================================================

// ETA Compliance Schema - aligned with eta_compliance table
export const ETAComplianceSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  compliance_type: z.enum(['electronic_transactions', 'digital_signatures', 'data_protection']),
  compliance_status: z.enum(['compliant', 'non_compliant', 'requires_review', 'pending']),
  compliance_score: BaseValidationSchemas.percentage,
  violations: z.array(z.object({
    type: z.string().max(100),
    description: z.string().max(500),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    recommendation: z.string().max(500)
  })),
  recommendations: z.array(z.string().max(500)),
  checked_at: z.string().datetime(),
  checked_by: BaseValidationSchemas.uuid.optional(),
  next_review_date: z.string().datetime().optional()
});

// CRAN Accreditation Schema - aligned with cran_accreditation table
export const CRANAccreditationSchema = z.object({
  id: BaseValidationSchemas.uuid,
  document_id: BaseValidationSchemas.uuid,
  accreditation_type: z.enum(['financial_services', 'insurance', 'pension_fund', 'other']),
  accreditation_status: z.enum(['accredited', 'not_accredited', 'pending', 'expired']),
  accreditation_number: z.string().max(100).optional(),
  accreditation_date: z.string().datetime().optional(),
  expiry_date: z.string().datetime().optional(),
  regulatory_body: z.string().max(200).optional(),
  compliance_requirements: z.array(z.string().max(500)),
  verified_at: z.string().datetime().optional(),
  verified_by: BaseValidationSchemas.uuid.optional()
});

// ============================================================================
// SADC COUNTRIES SCHEMA
// ============================================================================

export const SADCCountrySchema = z.object({
  id: BaseValidationSchemas.uuid,
  country_code: z.string().length(2),
  country_name: z.string().max(100),
  currency_code: z.string().length(3),
  currency_name: z.string().max(100),
  is_active: z.boolean(),
  compliance_requirements: z.array(z.string().max(500)),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
});

// ============================================================================
// EXPORT ALL SCHEMAS
// ============================================================================

export const AlignedModels = {
  // Base schemas
  BaseValidationSchemas,
  
  // Database-aligned schemas
  UserSchema,
  DocumentSchema,
  SignatureSchema,
  RecipientSchema,
  AuditTrailSchema,
  TemplateSchema,
  KYCWorkflowSchema,
  AIAnalysisSchema,
  
  // Workflow schemas
  WorkflowStateSchema,
  
  // Compliance schemas
  ETAComplianceSchema,
  CRANAccreditationSchema,
  
  // SADC schemas
  SADCCountrySchema
};

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Signature = z.infer<typeof SignatureSchema>;
export type Recipient = z.infer<typeof RecipientSchema>;
export type AuditTrail = z.infer<typeof AuditTrailSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type KYCWorkflow = z.infer<typeof KYCWorkflowSchema>;
export type AIAnalysis = z.infer<typeof AIAnalysisSchema>;
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;
export type ETACompliance = z.infer<typeof ETAComplianceSchema>;
export type CRANAccreditation = z.infer<typeof CRANAccreditationSchema>;
export type SADCCountry = z.infer<typeof SADCCountrySchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ModelValidator {
  /**
   * Validate data against a schema
   */
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }

  /**
   * Safe validation that returns errors instead of throwing
   */
  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: z.ZodError;
  } {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      return { success: false, errors: result.error };
    }
  }

  /**
   * Validate database record
   */
  static validateDatabaseRecord<T>(schema: z.ZodSchema<T>, record: unknown): T {
    return this.validate(schema, record);
  }

  /**
   * Validate API request data
   */
  static validateApiRequest<T>(schema: z.ZodSchema<T>, requestData: unknown): T {
    return this.validate(schema, requestData);
  }

  /**
   * Validate API response data
   */
  static validateApiResponse<T>(schema: z.ZodSchema<T>, responseData: unknown): T {
    return this.validate(schema, responseData);
  }
}

export default AlignedModels;