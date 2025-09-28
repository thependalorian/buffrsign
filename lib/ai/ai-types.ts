// BuffrSign Platform - AI Service Type Definitions
// Comprehensive type definitions for all AI services

// ============================================================================
// BASE TYPES
// ============================================================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    requestId: string;
    processingTime?: number;
  };
}

export interface ProcessingOptions {
  enableOCR?: boolean;
  enableComputerVision?: boolean;
  enableClassification?: boolean;
  enableCompliance?: boolean;
  enableRiskAssessment?: boolean;
  enableWorkflow?: boolean;
  enableInsights?: boolean;
}

// ============================================================================
// LLAMAINDEX TYPES
// ============================================================================

export interface LlamaIndexResults {
  documentAnalysis: {
    documentType: string;
    confidence: number;
    keyClauses: Array<{
      type: string;
      content: string;
      complianceStatus: string;
      recommendations: string[];
    }>;
    signatureFields: Array<{
      fieldId: string;
      position: { page: number; x: number; y: number };
      type: 'simple_electronic' | 'advanced_electronic' | 'qualified_electronic';
      required: boolean;
      legalBasis: string;
    }>;
  };
  complianceScore: number;
  etaCompliance: {
    section17: 'compliant' | 'needs_review' | 'non_compliant';
    section20: 'compliant' | 'needs_review' | 'non_compliant';
    section21: 'compliant' | 'needs_review' | 'non_compliant';
    chapter4: 'compliant' | 'needs_review' | 'non_compliant';
  };
  recommendations: string[];
}

// ============================================================================
// GROQ AI TYPES
// ============================================================================

export type UserTier = 'standard' | 'pro';

export interface GroqConfig {
  apiKey: string;
  baseUrl?: string;
  standardModel: string;
  proModel: string;
}

export interface GroqMessage {
  role: 'system' | '_user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface GroqResponse {
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  userTier: UserTier;
}

export interface GroqAnalysisRequest {
  documentContent: string;
  userTier: UserTier;
  analysisType?: 'basic' | 'comprehensive';
  context?: string;
}

export interface GroqComplianceRequest {
  documentContent: string;
  userTier: UserTier;
  frameworks?: string[];
}

export interface GroqLegalExplanationRequest {
  terms: string[];
  userTier: UserTier;
  context?: string;
}

export interface ChatRequest {
  message: string;
  context?: Record<string, unknown>;
}

// ============================================================================
// PYDANTIC AI TYPES
// ============================================================================

export interface PydanticResults {
  entityExtraction: {
    names: string[];
    dates: string[];
    amounts: Array<{
      value: number;
      currency: string;
      context: string;
    }>;
    addresses: string[];
    phoneNumbers: string[];
    emailAddresses: string[];
  };
  sentimentAnalysis: {
    overall: 'positive' | 'neutral' | 'negative';
    confidence: number;
    aspects: Array<{
      aspect: string;
      sentiment: 'positive' | 'neutral' | 'negative';
      confidence: number;
    }>;
  };
  complianceValidation: {
    isCompliant: boolean;
    violations: Array<{
      section: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      recommendation: string;
    }>;
  };
}

// ============================================================================
// LANGGRAPH TYPES
// ============================================================================

export interface LangGraphResults {
  workflowExecution: {
    workflowId: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    currentStep: string;
    completedSteps: string[];
    nextSteps: string[];
    estimatedCompletion: Date;
  };
  kycWorkflow: {
    workflowId: string;
    status: 'pending' | 'in_progress' | 'completed' | 'requires_review' | 'rejected';
    currentStage: string;
    completedStages: string[];
    requiredDocuments: string[];
    missingDocuments: string[];
  };
  humanReviewGates: Array<{
    gateId: string;
    type: 'approval' | 'review' | 'correction';
    status: 'pending' | 'approved' | 'rejected';
    assignedTo: string;
    dueDate: Date;
    comments: string[];
  }>;
}

// ============================================================================
// DATA SCIENCE TYPES
// ============================================================================

export interface DataScienceResults {
  documentClassification: {
    documentType: string;
    confidence: number;
    category: string;
    subcategory?: string;
    features: Array<{
      feature: string;
      value: number;
      importance: number;
    }>;
  };
  riskPrediction: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: Array<{
      factor: string;
      impact: number;
      probability: number;
      description: string;
      mitigation: string[];
    }>;
    historicalComparison: {
      percentile: number;
      similarDocuments: number;
      averageRisk: number;
    };
  };
  complianceScoring: {
    overallScore: number;
    sectionScores: Record<string, number>;
    complianceLevel: 'compliant' | 'needs_review' | 'non_compliant';
    criticalIssues: string[];
    recommendations: string[];
  };
  patternRecognition: {
    detectedPatterns: Array<{
      pattern: string;
      type: 'signature' | 'stamp' | 'watermark' | 'security_feature';
      confidence: number;
      location: { page: number; x: number; y: number; width: number; height: number };
    }>;
    anomalies: Array<{
      type: 'tampering' | 'inconsistency' | 'missing_element';
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      location?: { page: number; x: number; y: number };
    }>;
  };
}

// ============================================================================
// OCR TYPES
// ============================================================================

export interface OCRResults {
  textExtraction: {
    text: string;
    confidence: number;
    language: string;
    pageCount: number;
    wordCount: number;
    characterCount: number;
  };
  fieldDetection: {
    fields: Array<{
      name: string;
      type: 'text' | 'signature' | 'date' | 'amount' | 'checkbox';
      position: { x: number; y: number; width: number; height: number };
      confidence: number;
      extractedValue?: string;
    }>;
    tables: Array<{
      tableId: string;
      rows: number;
      columns: number;
      data: string[][];
      confidence: number;
    }>;
  };
  documentAnalysis: {
    orientation: 'portrait' | 'landscape';
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    resolution: number;
    brightness: number;
    contrast: number;
    skew: number;
  };
}

// ============================================================================
// COMPUTER VISION TYPES
// ============================================================================

export interface ComputerVisionResults {
  signatureDetection: {
    signatures: Array<{
      type: 'handwritten' | 'digital' | 'stamp' | 'seal';
      position: { x: number; y: number; width: number; height: number };
      confidence: number;
      isValid: boolean;
      quality: 'excellent' | 'good' | 'fair' | 'poor';
    }>;
    signatureFields: Array<{
      fieldId: string;
      isSigned: boolean;
      signatureType?: string;
      confidence: number;
    }>;
  };
  securityAnalysis: {
    tamperingDetected: boolean;
    riskScore: number;
    anomalies: Array<{
      type: 'tampering' | 'inconsistency' | 'missing_element' | 'duplicate';
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      location: { page: number; x: number; y: number };
      confidence: number;
    }>;
    securityFeatures: Array<{
      feature: 'watermark' | 'security_pattern' | 'hologram' | 'microprint';
      detected: boolean;
      confidence: number;
    }>;
  };
  imageQuality: {
    resolution: number;
    clarity: number;
    brightness: number;
    contrast: number;
    noise: number;
    blur: number;
    overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

// ============================================================================
// UNIFIED PROCESSING TYPES
// ============================================================================

export interface DocumentProcessingResults {
  llamaIndex?: LlamaIndexResults;
  pydantic?: PydanticResults;
  langGraph?: LangGraphResults;
  dataScience?: DataScienceResults;
  ocr?: OCRResults;
  computerVision?: ComputerVisionResults;
  insights?: {
    summary: string;
    keyFindings: string[];
    actionItems: string[];
    confidence: number;
    processingTime: number;
  };
}

export interface CompleteAnalysisResults {
  success: boolean;
  results: DocumentProcessingResults;
  metadata: {
    processingTime: number;
    servicesUsed: string[];
    timestamp: Date;
    documentId: string;
  };
  error?: string;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface WorkflowState {
  documentId: string;
  userId: string;
  currentStep: string;
  completedSteps: string[];
  data: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'human_review' | 'end';
  name: string;
  config: Record<string, unknown>;
  nextNodes: string[];
  conditions?: Array<{
    condition: string;
    nextNode: string;
  }>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  nodes: WorkflowNode[];
  startNode: string;
  endNodes: string[];
  variables: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object';
    required: boolean;
    defaultValue?: unknown;
  }>;
}

// ============================================================================
// KYC TYPES
// ============================================================================

export interface KYCWorkflowState {
  userId: string;
  documentId: string;
  kycType: 'individual' | 'sme_business';
  status: 'pending' | 'in_progress' | 'completed' | 'requires_review' | 'rejected';
  currentStage: string;
  completedStages: string[];
  requiredDocuments: string[];
  submittedDocuments: string[];
  verificationResults: Record<string, {
    status: 'pending' | 'verified' | 'rejected';
    confidence: number;
    issues: string[];
  }>;
  riskAssessment: {
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AIError {
  code: string;
  message: string;
  service: 'llamaindex' | 'pydantic' | 'langgraph' | 'datascience' | 'ocr' | 'computervision';
  details?: Record<string, unknown>;
  timestamp: Date;
  retryable: boolean;
}

export interface ProcessingError {
  error: AIError;
  context: {
    documentId: string;
    userId?: string;
    operation: string;
    timestamp: Date;
  };
  recovery?: {
    action: 'retry' | 'skip' | 'fallback';
    maxRetries: number;
    retryDelay: number;
  };
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AIServiceConfig {
  llamaIndex: {
    apiKey: string;
    baseURL: string;
    model?: string;
    temperature?: number;
  };
  pydantic: {
    apiKey: string;
    baseURL: string;
    model?: string;
    temperature?: number;
  };
  groq: {
    apiKey: string;
    baseURL: string;
    standardModel: string;
    proModel: string;
    temperature?: number;
  };
  langGraph: {
    apiKey: string;
    baseURL: string;
    timeout?: number;
  };
  dataScience: {
    apiKey: string;
    baseURL: string;
    model?: string;
  };
  ocr: {
    apiKey: string;
    baseURL: string;
    language?: string;
  };
  computerVision: {
    apiKey: string;
    baseURL: string;
    confidence?: number;
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

