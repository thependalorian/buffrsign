"""
Supabase Database Types for BuffrSign
Generated from Supabase schema with KYC and AI enhancements
"""

from typing import Dict, List, Any, Optional, Union
from enum import Enum

# Database Enums
class AIMethod(str, Enum):
    GPT4_VISION = "gpt4_vision"
    GOOGLE_VISION = "google_vision"
    AZURE_VISION = "azure_vision"
    PYTESSERACT_FALLBACK = "pytesseract_fallback"
    PYDANTIC_AI_AGENT = "pydantic_ai_agent"
    OPENAI_STRUCTURED = "openai_structured"
    AI_AGENT_MANAGER = "ai_agent_manager"
    REGEX_FALLBACK = "regex_fallback"

class KYCDecision(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"
    REQUIRES_REVIEW = "requires_review"

class KYCWorkflowState(str, Enum):
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

# Table Row Types
class SADCCountryRow:
    id: str
    country_code: str
    country_name: str
    id_format: str
    id_patterns: List[str]
    date_format: str
    keywords: List[str]
    validation_rules: Optional[Dict[str, Any]]
    is_active: Optional[bool]
    created_at: Optional[str]
    updated_at: Optional[str]

class KYCWorkflowRow:
    id: str
    user_id: str
    document_id: Optional[str]
    workflow_state: KYCWorkflowState
    detected_country: Optional[str]
    country_confidence: Optional[float]
    country_detection_method: Optional[AIMethod]
    ocr_extraction: Optional[Dict[str, Any]]
    ai_field_extraction: Optional[Dict[str, Any]]
    sadc_validation: Optional[Dict[str, Any]]
    final_decision: Optional[KYCDecision]
    decision_confidence: Optional[float]
    rejection_reasons: Optional[List[str]]
    compliance_status: Optional[Dict[str, Any]]
    audit_trail: Optional[List[Dict[str, Any]]]
    processing_time_ms: Optional[int]
    total_confidence: Optional[float]
    created_at: Optional[str]
    updated_at: Optional[str]
    completed_at: Optional[str]

class AIAnalysisRow:
    id: str
    document_id: str
    kyc_workflow_id: Optional[str]
    analysis_type: str
    document_summary: Optional[str]
    key_clauses: Optional[Dict[str, Any]]
    signature_fields: Optional[Dict[str, Any]]
    compliance_score: Optional[int]
    eta_compliance: Optional[Dict[str, Any]]
    recommendations: Optional[Dict[str, Any]]
    risk_assessment: Optional[Dict[str, Any]]
    confidence_scores: Optional[Dict[str, Any]]
    analysis_metadata: Optional[Dict[str, Any]]
    primary_ocr_method: Optional[AIMethod]
    fallback_methods: Optional[List[AIMethod]]
    extracted_fields: Optional[Dict[str, Any]]
    field_confidences: Optional[Dict[str, Any]]
    image_quality_score: Optional[float]
    text_clarity_score: Optional[float]
    overall_quality_score: Optional[float]
    processing_time_ms: Optional[int]
    created_at: Optional[str]
    updated_at: Optional[str]

class UserKYCStatusRow:
    id: str
    user_id: str
    kyc_status: str
    kyc_level: Optional[int]
    latest_workflow_id: Optional[str]
    verification_date: Optional[str]
    expiry_date: Optional[str]
    compliance_level: Optional[str]
    risk_score: Optional[float]
    verified_documents: Optional[Dict[str, Any]]
    verification_history: Optional[List[Dict[str, Any]]]
    created_at: Optional[str]
    updated_at: Optional[str]

# Insert Types
class KYCWorkflowInsert:
    user_id: str
    document_id: Optional[str] = None
    workflow_state: Optional[KYCWorkflowState] = KYCWorkflowState.INITIALIZED
    detected_country: Optional[str] = None
    country_confidence: Optional[float] = None
    country_detection_method: Optional[AIMethod] = None
    ocr_extraction: Optional[Dict[str, Any]] = None
    ai_field_extraction: Optional[Dict[str, Any]] = None
    sadc_validation: Optional[Dict[str, Any]] = None
    final_decision: Optional[KYCDecision] = None
    decision_confidence: Optional[float] = None
    rejection_reasons: Optional[List[str]] = None
    compliance_status: Optional[Dict[str, Any]] = None
    audit_trail: Optional[List[Dict[str, Any]]] = None
    processing_time_ms: Optional[int] = None
    total_confidence: Optional[float] = None

# Update Types
class KYCWorkflowUpdate:
    workflow_state: Optional[KYCWorkflowState] = None
    detected_country: Optional[str] = None
    country_confidence: Optional[float] = None
    country_detection_method: Optional[AIMethod] = None
    ocr_extraction: Optional[Dict[str, Any]] = None
    ai_field_extraction: Optional[Dict[str, Any]] = None
    sadc_validation: Optional[Dict[str, Any]] = None
    final_decision: Optional[KYCDecision] = None
    decision_confidence: Optional[float] = None
    rejection_reasons: Optional[List[str]] = None
    compliance_status: Optional[Dict[str, Any]] = None
    audit_trail: Optional[List[Dict[str, Any]]] = None
    processing_time_ms: Optional[int] = None
    total_confidence: Optional[float] = None
    completed_at: Optional[str] = None
