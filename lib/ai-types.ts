// BuffrSign Platform - AI Service Type Definitions
// Based on Python backend implementation with LlamaIndex, Pydantic AI, and LangGraph

// ============================================================================
// DOCUMENT ANALYSIS TYPES
// ============================================================================

export interface DocumentAnalysisResult {
  document_id: string;
  analysis_timestamp: string;
  document_type: string;
  confidence_score: number;
  compliance_status: ComplianceStatus;
  extracted_fields: Record<string, unknown>;
  signature_locations: SignatureField[];
  risk_assessment: RiskAssessment;
  recommendations: string[];
  processing_time: number;
}

export interface ComplianceStatus {
  eta_2019_compliant: boolean;
  compliance_score: number;
  compliance_details: ComplianceDetail[];
  validation_errors: string[];
  recommendations: string[];
}

export interface ComplianceDetail {
  section: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'requires_review';
  description: string;
  confidence: number;
}

export interface SignatureField {
  x: number;
  y: number;
  width: number;
  height: number;
  page_number: number;
  field_type: SignatureFieldType;
  confidence: number;
  required: boolean;
  label?: string;
  placeholder_text?: string;
  validation_rules?: ValidationRule[];
}

export enum SignatureFieldType {
  SIGNATURE = 'signature',
  DATE = 'date',
  NAME = 'name',
  TITLE = 'title',
  COMPANY = 'company',
  INITIALS = 'initials',
  STAMP = 'stamp'
}

export interface ValidationRule {
  type: 'required' | 'format' | 'length' | 'custom';
  value: unknown;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface RiskAssessment {
  overall_risk: RiskLevel;
  risk_score: number;
  risk_factors: RiskFactor[];
  mitigation_strategies: string[];
  compliance_risks: ComplianceRisk[];
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface RiskFactor {
  factor: string;
  severity: RiskLevel;
  description: string;
  impact: string;
  probability: number;
  mitigation: string;
}

export interface ComplianceRisk {
  regulation: string;
  section: string;
  risk_description: string;
  severity: RiskLevel;
  mitigation_required: boolean;
}

// ============================================================================
// LLAMAINDEX INTEGRATION TYPES
// ============================================================================

export interface LlamaIndexConfig {
  openai_api_key: string;
  model: string;
  temperature: number;
  max_tokens: number;
  chunk_size: number;
  chunk_overlap: number;
}

export interface VectorSearchResult {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  source: string;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: DocumentChunkMetadata;
  embedding?: number[];
}

export interface DocumentChunkMetadata {
  document_id: string;
  page_number: number;
  chunk_index: number;
  chunk_type: 'text' | 'table' | 'image' | 'signature';
  language: string;
  confidence: number;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: DocumentChunk[];
  vector_index: unknown; // LlamaIndex vector store
  last_updated: string;
  total_chunks: number;
}

// ============================================================================
// PYDANTIC AI INTEGRATION TYPES
// ============================================================================

export interface PydanticAIConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  validation_schema: unknown; // Zod schema for validation
}

export interface AIExtractionRequest {
  document_text: string;
  extraction_schema: unknown; // Zod schema defining the structure
  context?: Record<string, unknown>;
  confidence_threshold?: number;
}

export interface AIExtractionResult<T = unknown> {
  success: boolean;
  data: T;
  confidence: number;
  extraction_errors: string[];
  processing_time: number;
  model_used: string;
}

export interface IDDocumentExtraction {
  country_code: string;
  document_type: string;
  id_number?: string;
  full_name?: string;
  surname?: string;
  first_names?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F';
  nationality?: string;
  issue_date?: string;
  expiry_date?: string;
  place_of_birth?: string;
  address?: string;
  confidence_score: number;
}

export interface FinancialDocumentExtraction {
  document_type: string;
  institution_name?: string;
  account_number?: string;
  account_holder?: string;
  balance?: number;
  currency?: string;
  transaction_date?: string;
  statement_period?: string;
  confidence_score: number;
}

// ============================================================================
// LANGGRAPH WORKFLOW TYPES
// ============================================================================

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name: string;
  description: string;
  action: WorkflowAction;
  conditions: WorkflowCondition[];
  next_nodes: string[];
  timeout_seconds?: number;
  retry_count?: number;
  human_review_required?: boolean;
}

export enum WorkflowNodeType {
  START = 'start',
  DOCUMENT_ANALYSIS = 'document_analysis',
  COMPLIANCE_CHECK = 'compliance_check',
  SIGNATURE_COLLECTION = 'signature_collection',
  APPROVAL_GATE = 'approval_gate',
  HUMAN_REVIEW = 'human_review',
  COMPLETION = 'completion',
  ERROR_HANDLING = 'error_handling'
}

export interface WorkflowAction {
  type: WorkflowActionType;
  parameters: Record<string, unknown>;
  async: boolean;
  timeout_seconds?: number;
}

export enum WorkflowActionType {
  ANALYZE_DOCUMENT = 'analyze_document',
  CHECK_COMPLIANCE = 'check_compliance',
  COLLECT_SIGNATURE = 'collect_signature',
  SEND_NOTIFICATION = 'send_notification',
  UPDATE_STATUS = 'update_status',
  CREATE_AUDIT_LOG = 'create_audit_log',
  TRIGGER_WEBHOOK = 'trigger_webhook',
  WAIT_FOR_HUMAN = 'wait_for_human'
}

export interface WorkflowCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
  logical_operator?: 'and' | 'or';
  description: string;
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_EQUALS = 'greater_than_equals',
  LESS_THAN_EQUALS = 'less_than_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists'
}

export interface WorkflowState {
  workflow_id: string;
  current_node: string;
  status: WorkflowStatus;
  data: Record<string, unknown>;
  history: WorkflowHistoryEntry[];
  errors: WorkflowError[];
  started_at: string;
  updated_at: string;
  completed_at?: string;
}

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface WorkflowHistoryEntry {
  timestamp: string;
  node_id: string;
  action: string;
  result: unknown;
  duration_ms: number;
  status: 'success' | 'failure' | 'skipped';
}

export interface WorkflowError {
  timestamp: string;
  node_id: string;
  error_type: string;
  message: string;
  stack_trace?: string;
  recoverable: boolean;
}

// ============================================================================
// DOCUMENT TEMPLATE TYPES
// ============================================================================

export interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  content: string;
  signature_fields: SignatureField[];
  compliance_requirements: string[];
  customization_options: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: string;
  author: string;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  title: string;
  content: string;
  parties: DocumentParty[];
  signature_fields: SignatureField[];
  compliance_status: ComplianceStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  status: DocumentStatus;
  version: string;
}

export interface DocumentParty {
  id: string;
  name: string;
  email: string;
  role: string;
  signature_required: boolean;
  signature_order?: number;
  metadata?: Record<string, unknown>;
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  PARTIALLY_SIGNED = 'partially_signed',
  SIGNED = 'signed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  REJECTED = 'rejected'
}

// ============================================================================
// AI SERVICE CONFIGURATION TYPES
// ============================================================================

export interface AIServiceConfig {
  openai: {
    api_key: string;
    model: string;
    temperature: number;
    max_tokens: number;
  };
  llamaindex: {
    enabled: boolean;
    chunk_size: number;
    chunk_overlap: number;
    embedding_model: string;
  };
  pydantic_ai: {
    enabled: boolean;
    model: string;
    validation_strict: boolean;
  };
  langgraph: {
    enabled: boolean;
    max_workflow_duration: number;
    human_review_timeout: number;
  };
  compliance: {
    eta_2019_enabled: boolean;
    namibian_law_enabled: boolean;
    international_standards: string[];
  };
}

export interface AIAnalysisRequest {
  document_id: string;
  analysis_type: AnalysisType[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  callback_url?: string;
  metadata?: Record<string, unknown>;
  user_context?: Record<string, unknown>;
}

export enum AnalysisType {
  DOCUMENT_CLASSIFICATION = 'document_classification',
  FIELD_EXTRACTION = 'field_extraction',
  SIGNATURE_DETECTION = 'signature_detection',
  COMPLIANCE_CHECK = 'compliance_check',
  RISK_ASSESSMENT = 'risk_assessment',
  CONTENT_SUMMARY = 'content_summary',
  LEGAL_REVIEW = 'legal_review'
}

export interface AIAnalysisResponse {
  request_id: string;
  document_id: string;
  analysis_type: AnalysisType[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: DocumentAnalysisResult;
  error?: string;
  processing_time?: number;
  confidence_score?: number;
  created_at: string;
  completed_at?: string;
  model_used?: string;
}

// ============================================================================
// COMPLIANCE & LEGAL TYPES
// ============================================================================

export interface ETA2019Compliance {
  section_17_compliant: boolean; // Legal recognition of data messages
  section_20_compliant: boolean; // Electronic signatures
  section_21_compliant: boolean; // Original information
  section_24_compliant: boolean; // Retention of data messages
  overall_compliance: boolean;
  compliance_score: number;
  recommendations: string[];
  validation_details: ETA2019ValidationDetail[];
}

export interface ETA2019ValidationDetail {
  section: string;
  requirement: string;
  status: 'compliant' | 'non_compliant' | 'requires_review';
  description: string;
  evidence: string[];
  confidence: number;
}

export interface NamibianLegalFramework {
  eta_2019_compliance: ETA2019Compliance;
  labour_act_compliance: boolean;
  consumer_protection_compliance: boolean;
  data_protection_compliance: boolean;
  overall_compliance_score: number;
  legal_risks: LegalRisk[];
  recommendations: string[];
}

export interface LegalRisk {
  regulation: string;
  risk_description: string;
  severity: RiskLevel;
  impact: string;
  mitigation_strategy: string;
  legal_advice_required: boolean;
}

// ============================================================================
// DOCUMENT PROCESSING TYPES
// ============================================================================

export interface DocumentProcessingResults {
  analysis?: Record<string, unknown>;
  compliance?: Record<string, unknown>;
  riskScore?: Record<string, unknown>;
  workflowId?: string;
  ocr?: Record<string, unknown>;
  computerVision?: Record<string, unknown>;
}


