"""
KYC and AI Analysis Models for BuffrSign

Pydantic models for KYC workflows, AI analysis, and SADC country processing.
These models correspond to the Supabase database schema.
"""

from typing import Optional, Dict, Any, List, Union
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum
import uuid
from ..database.supabase_client import get_supabase_client

# Enums matching database types
class KYCWorkflowState(str, Enum):
    """KYC workflow states matching database enum"""
    INITIALIZED = "initialized"
    DOCUMENT_UPLOADED = "document_uploaded"
    OCR_EXTRACTION_COMPLETE = "ocr_extraction_complete"
    AI_COUNTRY_DETECTION = "ai_country_detection"
    AI_FIELD_EXTRACTION = "ai_field_extraction"
    SADC_VALIDATION = "sadc_validation"
    COMPLIANCE_CHECKED = "compliance_checked"
    AUTO_APPROVED = "auto_approved"
    AUTO_REJECTED = "auto_rejected"
    COMPLETED = "completed"
    FAILED = "failed"

class KYCDecision(str, Enum):
    """KYC decision types"""
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"
    REQUIRES_REVIEW = "requires_review"

class AIMethod(str, Enum):
    """AI analysis methods"""
    GPT4_VISION = "gpt4_vision"
    GOOGLE_VISION = "google_vision"
    AZURE_VISION = "azure_vision"
    PYTESSERACT_FALLBACK = "pytesseract_fallback"
    PYDANTIC_AI_AGENT = "pydantic_ai_agent"
    OPENAI_STRUCTURED = "openai_structured"
    AI_AGENT_MANAGER = "ai_agent_manager"
    REGEX_FALLBACK = "regex_fallback"

class AnalysisStepStatus(str, Enum):
    """Analysis step status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class MetricQuality(str, Enum):
    """Confidence metric quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"

class KYCStatus(str, Enum):
    """User KYC verification status"""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"

class ComplianceLevel(str, Enum):
    """KYC compliance levels"""
    BASIC = "basic"
    ENHANCED = "enhanced"
    FULL_DUE_DILIGENCE = "full_due_diligence"

# Core Models
class SADCCountry(BaseModel):
    """SADC country reference model"""
    id: Optional[uuid.UUID] = None
    country_code: str = Field(..., min_length=2, max_length=2, description="ISO 3166-1 alpha-2 code")
    country_name: str = Field(..., min_length=1, max_length=100)
    id_format: str = Field(..., description="ID format type (11_digits, 13_digits, variable)")
    id_patterns: List[str] = Field(..., description="Regex patterns for ID validation")
    date_format: str = Field(..., description="Date format used in IDs (DDMMYY, YYMMDD)")
    keywords: List[str] = Field(..., description="Keywords for country detection")
    validation_rules: Dict[str, Any] = Field(default_factory=dict, description="Country-specific validation rules")
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

class ExtractedIDFields(BaseModel):
    """Structured ID document fields"""
    id_number: Optional[str] = None
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    nationality: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    place_of_birth: Optional[str] = None
    address: Optional[str] = None
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)
    
    @validator('confidence_score')
    def validate_confidence(cls, v):
        return max(0.0, min(1.0, v))

class OCRExtractionResult(BaseModel):
    """OCR extraction results"""
    extracted_text: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    processing_time: float = Field(default=0.0, ge=0.0)
    method: AIMethod
    error_details: Optional[Dict[str, Any]] = None

class CountryDetectionResult(BaseModel):
    """Country detection results"""
    country_code: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    method: AIMethod
    matches: Optional[int] = None
    detection_details: Optional[Dict[str, Any]] = None

class FieldExtractionResult(BaseModel):
    """Field extraction results"""
    fields: ExtractedIDFields
    confidence: float = Field(..., ge=0.0, le=1.0)
    method: AIMethod
    extraction_details: Optional[Dict[str, Any]] = None

class SADCValidationResult(BaseModel):
    """SADC validation results"""
    score: float = Field(..., ge=0.0, le=1.0)
    passed: List[str] = Field(default_factory=list)
    failed: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    country: str
    validation_details: Optional[Dict[str, Any]] = None

class ComplianceCheckResult(BaseModel):
    """Compliance check results"""
    eta_2019_compliant: bool = False
    sadc_compliant: bool = False
    compliance_score: float = Field(default=0.0, ge=0.0, le=1.0)
    issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class AuditTrailEntry(BaseModel):
    """Audit trail entry"""
    timestamp: datetime
    action: str
    details: Dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = None
    ip_address: Optional[str] = None

class KYCWorkflow(BaseModel):
    """Main KYC workflow model"""
    id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    document_id: Optional[uuid.UUID] = None
    workflow_state: KYCWorkflowState = KYCWorkflowState.INITIALIZED
    
    # SADC Country Detection
    detected_country: Optional[str] = None
    country_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    country_detection_method: Optional[AIMethod] = None
    
    # AI Extraction Results
    ocr_extraction: Optional[Dict[str, Any]] = None
    ai_field_extraction: Optional[Dict[str, Any]] = None
    sadc_validation: Optional[Dict[str, Any]] = None
    
    # Final Decision
    final_decision: Optional[KYCDecision] = None
    decision_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    rejection_reasons: Optional[List[str]] = None
    
    # Compliance and Audit
    compliance_status: Optional[Dict[str, Any]] = None
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Metadata
    processing_time_ms: Optional[int] = None
    total_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

class KYCAnalysisStep(BaseModel):
    """Individual KYC analysis step"""
    id: Optional[uuid.UUID] = None
    workflow_id: uuid.UUID
    step_name: str
    step_order: int
    status: AnalysisStepStatus = AnalysisStepStatus.PENDING
    
    # AI Method and Results
    ai_method: Optional[AIMethod] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    processing_time_ms: Optional[int] = None
    
    # Step Data
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_details: Dict[str, Any] = Field(default_factory=dict)
    
    # Timestamps
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

class AIModelMetrics(BaseModel):
    """AI model performance metrics"""
    id: Optional[uuid.UUID] = None
    model_name: str
    model_version: str
    
    # Performance Metrics
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)
    precision_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    recall: Optional[float] = Field(None, ge=0.0, le=1.0)
    f1_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    avg_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    avg_processing_time_ms: Optional[float] = None
    throughput_per_hour: Optional[int] = None
    error_rate: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Sample Size
    total_predictions: int = 0
    successful_predictions: int = 0
    failed_predictions: int = 0
    
    # Time Period
    period_start: datetime
    period_end: datetime
    created_at: Optional[datetime] = None

class DocumentAIAnalysis(BaseModel):
    """Document AI analysis results"""
    id: Optional[uuid.UUID] = None
    document_id: uuid.UUID
    workflow_id: Optional[uuid.UUID] = None
    
    # Document Analysis
    document_type: Optional[str] = None
    extracted_text: Optional[str] = None
    text_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # OCR Methods
    primary_ocr_method: AIMethod
    fallback_methods: List[AIMethod] = Field(default_factory=list)
    
    # Extracted Data
    extracted_fields: Dict[str, Any] = Field(default_factory=dict)
    field_confidences: Dict[str, float] = Field(default_factory=dict)
    
    # Validation Results
    validation_results: Dict[str, Any] = Field(default_factory=dict)
    compliance_checks: Dict[str, Any] = Field(default_factory=dict)
    
    # Quality Metrics
    image_quality_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    text_clarity_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    overall_quality_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # AI Recommendations
    recommendations: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    
    # Processing Metadata
    processing_time_ms: Optional[int] = None
    total_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

class AIConfidenceMetric(BaseModel):
    """Individual confidence metric"""
    id: Optional[uuid.UUID] = None
    workflow_id: Optional[uuid.UUID] = None
    analysis_id: Optional[uuid.UUID] = None
    
    # Metric Details
    metric_name: str = Field(..., min_length=1, max_length=100)
    metric_value: float = Field(..., ge=0.0, le=1.0)
    metric_weight: float = Field(..., ge=0.0, le=1.0)
    metric_description: Optional[str] = None
    metric_quality: MetricQuality
    
    # Method Used
    ai_method: Optional[AIMethod] = None
    processing_time_ms: Optional[int] = None
    
    created_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

class UserKYCStatus(BaseModel):
    """User KYC verification status"""
    id: Optional[uuid.UUID] = None
    user_id: uuid.UUID
    
    # KYC Status
    kyc_status: KYCStatus = KYCStatus.PENDING
    kyc_level: int = Field(default=1, ge=1, le=3)
    
    # Latest Verification
    latest_workflow_id: Optional[uuid.UUID] = None
    verification_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    
    # Compliance
    compliance_level: Optional[ComplianceLevel] = None
    risk_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    
    # Documents
    verified_documents: Dict[str, Any] = Field(default_factory=dict)
    
    # Audit
    verification_history: List[Dict[str, Any]] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        use_enum_values = True

# Request/Response Models for API
class KYCWorkflowCreateRequest(BaseModel):
    """Request to create a new KYC workflow"""
    document_id: Optional[uuid.UUID] = None
    analysis_level: str = Field(default="comprehensive", description="basic, standard, or comprehensive")

class KYCWorkflowUpdateRequest(BaseModel):
    """Request to update KYC workflow"""
    workflow_state: Optional[KYCWorkflowState] = None
    detected_country: Optional[str] = None
    country_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    final_decision: Optional[KYCDecision] = None
    decision_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    rejection_reasons: Optional[List[str]] = None

class DocumentUploadRequest(BaseModel):
    """Request for document upload with AI analysis"""
    file_name: str
    file_size: int
    file_type: str
    analysis_level: str = "comprehensive"
    auto_detect_fields: bool = True
    compliance_check: bool = True

class DocumentAnalysisResponse(BaseModel):
    """Response from document AI analysis"""
    success: bool
    document_id: uuid.UUID
    analysis_id: uuid.UUID
    
    # Analysis Results
    document_type: Optional[str] = None
    detected_country: Optional[str] = None
    extracted_fields: ExtractedIDFields
    confidence_score: float
    
    # Compliance
    compliance_status: str
    eta_compliance: Dict[str, str] = Field(default_factory=dict)
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    
    # Workflow
    workflow_id: Optional[uuid.UUID] = None
    next_steps: List[str] = Field(default_factory=list)

class KYCWorkflowStatusResponse(BaseModel):
    """KYC workflow status response"""
    workflow_id: uuid.UUID
    status: KYCWorkflowState
    progress_percentage: float = Field(..., ge=0.0, le=100.0)
    current_step: Optional[str] = None
    
    # Results (if completed)
    final_decision: Optional[KYCDecision] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    extracted_data: Optional[ExtractedIDFields] = None
    
    # Error details (if failed)
    error_message: Optional[str] = None
    rejection_reasons: Optional[List[str]] = None
    
    # Metadata
    processing_time_ms: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

class AIModelDashboardResponse(BaseModel):
    """AI model dashboard response"""
    model_name: str
    model_version: str
    status: str  # healthy, warning, error
    
    # Current Metrics
    current_accuracy: float
    current_confidence: float
    current_throughput: int
    error_rate: float
    
    # Historical Performance
    performance_trends: List[Dict[str, Any]] = Field(default_factory=list)
    
    # System Health
    uptime_percentage: float
    last_updated: datetime

# Default confidence metrics for KYC
DEFAULT_KYC_CONFIDENCE_METRICS = [
    {
        "metric_name": "ocr_quality",
        "metric_description": "Quality and accuracy of text extraction from the document using AI vision models",
        "metric_weight": 0.25,
        "ai_method": "gpt4_vision"
    },
    {
        "metric_name": "country_detection", 
        "metric_description": "Confidence in detecting the correct SADC country from document features and content",
        "metric_weight": 0.15,
        "ai_method": "ai_agent_manager"
    },
    {
        "metric_name": "field_extraction",
        "metric_description": "Accuracy of extracting structured data fields using Pydantic AI agents",
        "metric_weight": 0.35,
        "ai_method": "pydantic_ai_agent"
    },
    {
        "metric_name": "validation_rules",
        "metric_description": "Compliance with SADC country-specific validation rules and format requirements",
        "metric_weight": 0.25,
        "ai_method": "regex_fallback"
    }
]
