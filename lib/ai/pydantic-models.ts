// BuffrSign Platform - Pydantic AI Models
// TypeScript models inspired by Pydantic AI structured outputs
// Based on Data Science principles for validation and type safety

'use client';

import { z } from 'zod';

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

// Base validation schemas using Zod (TypeScript equivalent of Pydantic)
export const BaseValidationSchemas = {
  // UUID validation
  uuid: z.string().uuid(),
  
  // Email validation
  email: z.string().email(),
  
  // Phone number validation (Namibian format)
  phone: z.string().regex(/^(\+264|0)[0-9]{9}$/, 'Invalid Namibian phone number'),
  
  // Namibian ID validation
  namibianId: z.string().regex(/^[0-9]{11}$/, 'Invalid Namibian ID format'),
  
  // Currency validation
  currency: z.string().regex(/^\$?[0-9,]+(\.[0-9]{2})?$/, 'Invalid currency format'),
  
  // Date validation
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  // Percentage validation
  percentage: z.number().min(0).max(100),
  
  // Confidence score validation
  confidence: z.number().min(0).max(1),
  
  // File path validation
  filePath: z.string().min(1).max(500),
  
  // Document type validation
  documentType: z.enum([
    'contract',
    'agreement',
    'invoice',
    'receipt',
    'identity',
    'financial',
    'legal',
    'other'
  ]),
  
  // User role validation
  userRole: z.enum(['user', 'admin', 'super_admin']),
  
  // Workflow status validation
  workflowStatus: z.enum([
    'initialized',
    'running',
    'paused',
    'completed',
    'failed',
    'cancelled'
  ])
};

// ============================================================================
// DOCUMENT ANALYSIS MODELS
// ============================================================================

// Document Analysis Request Schema
export const DocumentAnalysisRequestSchema = z.object({
  documentId: BaseValidationSchemas.uuid,
  filePath: BaseValidationSchemas.filePath,
  documentType: BaseValidationSchemas.documentType,
  userId: BaseValidationSchemas.uuid,
  analysisOptions: z.object({
    extractFields: z.boolean(),
    detectSignatures: z.boolean(),
    checkCompliance: z.boolean(),
    generateSummary: z.boolean(),
    identifyClauses: z.boolean(),
    riskAssessment: z.boolean(),
    confidenceThreshold: BaseValidationSchemas.confidence,
    aiModels: z.array(z.string()).min(1)
  })
});

export type DocumentAnalysisRequest = z.infer<typeof DocumentAnalysisRequestSchema>;

// Document Summary Schema
export const DocumentSummarySchema = z.object({
  title: z.string().min(1).max(200),
  type: BaseValidationSchemas.documentType,
  keyPoints: z.array(z.string()).max(10),
  parties: z.array(z.string()).max(20),
  dates: z.array(BaseValidationSchemas.date).max(10),
  amounts: z.array(BaseValidationSchemas.currency).max(10),
  confidence: BaseValidationSchemas.confidence,
  wordCount: z.number().int().min(0),
  pageCount: z.number().int().min(1)
});

export type DocumentSummary = z.infer<typeof DocumentSummarySchema>;

// Extracted Field Schema
export const ExtractedFieldSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(1000),
  type: z.enum([
    'text',
    'number',
    'date',
    'currency',
    'email',
    'phone',
    'address',
    'signature',
    'checkbox',
    'select'
  ]),
  confidence: BaseValidationSchemas.confidence,
  position: z.object({
    page: z.number().int().min(1),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    boundingBox: z.object({
      topLeft: z.object({ x: z.number(), y: z.number() }),
      topRight: z.object({ x: z.number(), y: z.number() }),
      bottomLeft: z.object({ x: z.number(), y: z.number() }),
      bottomRight: z.object({ x: z.number(), y: z.number() })
    })
  }),
  validation: z.object({
    isValid: z.boolean(),
    rules: z.array(z.object({
      type: z.string(),
      value: z.unknown().optional(),
      message: z.string()
    })),
    errors: z.array(z.object({
      rule: z.string(),
      message: z.string(),
      severity: z.enum(['info', 'warning', 'error'])
    }))
  })
});

export type ExtractedField = z.infer<typeof ExtractedFieldSchema>;

// Signature Field Schema
export const SignatureFieldSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum([
    'simple_electronic',
    'advanced_electronic',
    'qualified_electronic',
    'biometric',
    'handwritten'
  ]),
  position: z.object({
    page: z.number().int().min(1),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    boundingBox: z.object({
      topLeft: z.object({ x: z.number(), y: z.number() }),
      topRight: z.object({ x: z.number(), y: z.number() }),
      bottomLeft: z.object({ x: z.number(), y: z.number() }),
      bottomRight: z.object({ x: z.number(), y: z.number() })
    })
  }),
  required: z.boolean(),
  signerRole: z.string().min(1).max(50),
  legalBasis: z.string().min(1).max(200),
  confidence: BaseValidationSchemas.confidence,
  aiDetected: z.boolean(),
  qualityScore: BaseValidationSchemas.confidence
});

export type SignatureField = z.infer<typeof SignatureFieldSchema>;

// Document Clause Schema
export const DocumentClauseSchema = z.object({
  id: z.string().min(1).max(50),
  type: z.enum([
    'payment',
    'liability',
    'termination',
    'confidentiality',
    'intellectual_property',
    'force_majeure',
    'governing_law',
    'dispute_resolution',
    'other'
  ]),
  content: z.string().min(1).max(2000),
  position: z.object({
    page: z.number().int().min(1),
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    boundingBox: z.object({
      topLeft: z.object({ x: z.number(), y: z.number() }),
      topRight: z.object({ x: z.number(), y: z.number() }),
      bottomLeft: z.object({ x: z.number(), y: z.number() }),
      bottomRight: z.object({ x: z.number(), y: z.number() })
    })
  }),
  importance: z.enum(['low', 'medium', 'high', 'critical']),
  compliance: z.object({
    etaCompliant: z.boolean(),
    cranCompliant: z.boolean(),
    issues: z.array(z.object({
      type: z.string(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      recommendation: z.string(),
      section: z.string().optional()
    })),
    score: BaseValidationSchemas.percentage
  }),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  recommendations: z.array(z.string()).max(5)
});

export type DocumentClause = z.infer<typeof DocumentClauseSchema>;

// ============================================================================
// COMPLIANCE MODELS
// ============================================================================

// ETA 2019 Compliance Schema
export const ETAComplianceSchema = z.object({
  compliant: z.boolean(),
  score: BaseValidationSchemas.percentage,
  issues: z.array(z.object({
    type: z.enum([
      'missing_signature',
      'invalid_date_format',
      'insufficient_evidence',
      'data_protection_violation',
      'audit_trail_incomplete',
      'other'
    ]),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().min(1).max(500),
    recommendation: z.string().min(1).max(500),
    section: z.string().optional()
  })),
  sections: z.object({
    section17: z.enum(['compliant', 'needs_review', 'non_compliant']),
    section20: z.enum(['compliant', 'needs_review', 'non_compliant']),
    section21: z.enum(['compliant', 'needs_review', 'non_compliant']),
    chapter4: z.enum(['compliant', 'needs_review', 'non_compliant'])
  })
});

export type ETACompliance = z.infer<typeof ETAComplianceSchema>;

// CRAN Compliance Schema
export const CRANComplianceSchema = z.object({
  compliant: z.boolean(),
  score: BaseValidationSchemas.percentage,
  issues: z.array(z.object({
    type: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    description: z.string().min(1).max(500),
    recommendation: z.string().min(1).max(500),
    section: z.string().optional()
  })),
  accreditation: z.object({
    accredited: z.boolean(),
    requirements: z.array(z.string()),
    expiryDate: BaseValidationSchemas.date.optional()
  })
});

export type CRANCompliance = z.infer<typeof CRANComplianceSchema>;

// ============================================================================
// KYC MODELS
// ============================================================================

// KYC Workflow Schema
export const KYCWorkflowSchema = z.object({
  id: BaseValidationSchemas.uuid,
  userId: BaseValidationSchemas.uuid,
  documentId: BaseValidationSchemas.uuid,
  workflowState: z.enum([
    'initialized',
    'document_uploaded',
    'ocr_extraction_complete',
    'ai_country_detection',
    'ai_field_extraction',
    'sadc_validation',
    'compliance_checked',
    'auto_approved',
    'auto_rejected',
    'completed',
    'failed'
  ]),
  detectedCountry: z.string().min(2).max(50).optional(),
  countryConfidence: BaseValidationSchemas.confidence.optional(),
  countryDetectionMethod: z.string().optional(),
  finalDecision: z.enum(['approved', 'rejected', 'pending', 'requires_review']),
  decisionConfidence: BaseValidationSchemas.confidence.optional(),
  rejectionReasons: z.array(z.string()).optional(),
  processingTimeMs: z.number().int().min(0),
  totalConfidence: BaseValidationSchemas.confidence,
  createdAt: z.date(),
  updatedAt: z.date()
});

export type KYCWorkflow = z.infer<typeof KYCWorkflowSchema>;

// SADC Country Schema
export const SADCCountrySchema = z.object({
  id: BaseValidationSchemas.uuid,
  countryCode: z.string().length(2),
  countryName: z.string().min(1).max(100),
  idFormat: z.string().min(1).max(200),
  idPatterns: z.array(z.string()),
  dateFormat: z.string().min(1).max(50),
  keywords: z.array(z.string()),
  validationRules: z.record(z.string(), z.unknown()),
  isActive: z.boolean()
});

export type SADCCountry = z.infer<typeof SADCCountrySchema>;

// ============================================================================
// WORKFLOW MODELS
// ============================================================================

// Workflow State Schema
export const WorkflowStateSchema = z.object({
  id: BaseValidationSchemas.uuid,
  status: BaseValidationSchemas.workflowStatus,
  currentStep: z.string().min(1).max(100),
  data: z.record(z.string(), z.unknown()),
  history: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    input: z.record(z.string(), z.unknown()),
    output: z.record(z.string(), z.unknown()),
    startedAt: z.date(),
    completedAt: z.date().optional(),
    duration: z.number().optional(),
    retryCount: z.number().int().min(0),
    maxRetries: z.number().int().min(0)
  })),
  errors: z.array(z.object({
    id: z.string(),
    stepId: z.string(),
    message: z.string(),
    code: z.string(),
    severity: z.enum(['low', 'medium', 'high', 'critical']),
    timestamp: z.date(),
    resolved: z.boolean()
  })),
  metadata: z.object({
    documentId: BaseValidationSchemas.uuid,
    userId: BaseValidationSchemas.uuid,
    documentType: BaseValidationSchemas.documentType,
    priority: z.enum(['low', 'normal', 'high', 'urgent']),
    estimatedDuration: z.number().int().min(0),
    actualDuration: z.number().int().min(0).optional(),
    aiModels: z.array(z.string()),
    complianceRequirements: z.array(z.string())
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type WorkflowState = z.infer<typeof WorkflowStateSchema>;

// ============================================================================
// USER MODELS
// ============================================================================

// User Profile Schema
export const UserProfileSchema = z.object({
  id: BaseValidationSchemas.uuid,
  email: BaseValidationSchemas.email,
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  fullName: z.string().min(1).max(200),
  phone: BaseValidationSchemas.phone.optional(),
  namibianId: BaseValidationSchemas.namibianId.optional(),
  companyName: z.string().max(200).optional(),
  role: BaseValidationSchemas.userRole,
  isActive: z.boolean(),
  isVerified: z.boolean(),
  avatarUrl: z.string().regex(/^https?:\/\/.+/, 'Invalid URL format').optional(),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('Africa/Windhoek'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// DOCUMENT MODELS
// ============================================================================

// Document Schema
export const DocumentSchema = z.object({
  id: BaseValidationSchemas.uuid,
  title: z.string().min(1).max(200),
  filePath: BaseValidationSchemas.filePath,
  fileHash: z.string().min(1).max(64),
  fileSize: z.number().int().min(0),
  mimeType: z.string().min(1).max(100),
  createdBy: BaseValidationSchemas.uuid,
  expiresAt: z.date().optional(),
  status: z.enum([
    'uploaded',
    'processing',
    'analyzed',
    'ready',
    'signed',
    'completed',
    'expired',
    'failed'
  ]).optional(),
  aiAnalysisEnabled: z.boolean().default(true),
  aiAnalysisStatus: z.enum([
    'pending',
    'processing',
    'completed',
    'failed'
  ]).optional(),
  aiAnalysisId: BaseValidationSchemas.uuid.optional(),
  complianceAnalysisId: BaseValidationSchemas.uuid.optional(),
  documentType: BaseValidationSchemas.documentType.optional(),
  industry: z.string().max(100).optional(),
  jurisdiction: z.string().max(100).optional(),
  kycWorkflowId: BaseValidationSchemas.uuid.optional(),
  isKycDocument: z.boolean().default(false),
  kycDocumentType: z.string().max(50).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Document = z.infer<typeof DocumentSchema>;

// ============================================================================
// SIGNATURE MODELS
// ============================================================================

// Signature Schema
export const SignatureSchema = z.object({
  id: BaseValidationSchemas.uuid,
  documentId: BaseValidationSchemas.uuid,
  recipientId: BaseValidationSchemas.uuid,
  signatureType: z.enum([
    'simple_electronic',
    'advanced_electronic',
    'qualified_electronic',
    'biometric',
    'handwritten'
  ]),
  signatureData: z.string().min(1),
  certificateId: BaseValidationSchemas.uuid.optional(),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/, 'Invalid IP address').optional(),
  userAgent: z.string().max(500).optional(),
  timestampToken: z.string().optional(),
  aiDetected: z.boolean().default(false),
  signatureFieldId: z.string().optional(),
  aiConfidenceScore: BaseValidationSchemas.confidence.optional(),
  aiAnalysisMethod: z.string().optional(),
  aiQualityAssessment: z.object({
    clarity: BaseValidationSchemas.confidence,
    completeness: BaseValidationSchemas.confidence,
    authenticity: BaseValidationSchemas.confidence
  }).optional(),
  complianceVerified: z.boolean().default(false),
  etaComplianceStatus: z.enum(['compliant', 'needs_review', 'non_compliant']).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Signature = z.infer<typeof SignatureSchema>;

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PydanticValidator {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.'),
          firstError.code,
          firstError.input
        );
      }
      throw error;
    }
  }

  static validateAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<T> {
    return schema.parseAsync(data);
  }

  static safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: ValidationError;
  } {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const firstError = result.error.issues[0];
        return {
          success: false,
          error: new ValidationError(
            firstError.message,
            firstError.path.join('.'),
            firstError.code,
            firstError.input
          )
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof ValidationError ? error : new ValidationError(
          'Unknown validation error',
          'unknown',
          'UNKNOWN_ERROR'
        )
      };
    }
  }
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

export class DataTransformer {
  static toPydanticModel<T>(data: unknown, schema: z.ZodSchema<T>): T {
    return PydanticValidator.validate(schema, data);
  }

  static fromDatabaseRow<T>(row: unknown, schema: z.ZodSchema<T>): T {
    // Transform database row to Pydantic model
    const rowData = row as Record<string, unknown>;
    const transformed = {
      ...rowData,
      createdAt: rowData.created_at ? new Date(rowData.created_at as string) : undefined,
      updatedAt: rowData.updated_at ? new Date(rowData.updated_at as string) : undefined,
      // Add other common transformations
    };
    
    return PydanticValidator.validate(schema, transformed);
  }

  static toDatabaseRow<T extends Record<string, unknown>>(model: T): Record<string, unknown> {
    // Transform Pydantic model to database row
    const row: Record<string, unknown> = { ...model };
    
    // Convert camelCase to snake_case
    Object.keys(row).forEach(key => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (snakeKey !== key) {
        row[snakeKey] = row[key];
        delete row[key];
      }
    });
    
    return row;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================


const PydanticModels = {
  PydanticValidator,
  DataTransformer,
  ValidationError
};

export default PydanticModels;
